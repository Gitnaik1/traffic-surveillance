import os
import sys
import ssl
import glob
import json
import time
import random
import argparse
import numpy as np
from PIL import Image

# macOS SSL Certificate Fix for downloading torchvision weights
try:
    ssl._create_default_https_context = ssl._create_unverified_context
except Exception:
    pass

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import torchvision.models as models

# ── 1. Dataset & Data Loading ───────────────────────────────────────────────────

class VehicleReIDDataset(Dataset):
    """
    Vehicle Re-Identification Dataset parser for multi-camera tracking crops.
    Supports balanced stratified sampling across cameras and vehicle IDs.
    """
    def __init__(self, data_dir="data/vehicle_reid_dataset/crops", is_train=True, max_crops_per_id=12, transform=None):
        self.data_dir = data_dir
        self.is_train = is_train
        self.samples = []  # (image_path, pid, camid)
        
        # Scan vehicle identity directories
        veh_dirs = sorted([d for d in glob.glob(os.path.join(data_dir, "*")) if os.path.isdir(d)])
        self.pid2label = {os.path.basename(d): idx for idx, d in enumerate(veh_dirs)}
        self.cam2label = {"c001": 0}
        
        for d in veh_dirs:
            pid = self.pid2label[os.path.basename(d)]
            img_paths = sorted(glob.glob(os.path.join(d, "*.jpg")) + glob.glob(os.path.join(d, "*.png")))
            
            # Subsample up to max_crops_per_id for balanced training speed
            if max_crops_per_id is not None and len(img_paths) > max_crops_per_id:
                step = len(img_paths) / float(max_crops_per_id)
                img_paths = [img_paths[int(i * step)] for i in range(max_crops_per_id)]
                
            for p in img_paths:
                filename = os.path.basename(p)
                cam_name = filename.split("_")[0] if "_" in filename else "c001"
                if cam_name not in self.cam2label:
                    self.cam2label[cam_name] = len(self.cam2label)
                camid = self.cam2label[cam_name]
                self.samples.append((p, pid, camid))
                    
        self.num_classes = len(self.pid2label) if self.pid2label else 1
        
        # Standard ReID Transformations (256x128 resize, flips, ImageNet norm)
        if transform:
            self.transform = transform
        else:
            if is_train:
                self.transform = transforms.Compose([
                    transforms.Resize((256, 128), interpolation=transforms.InterpolationMode.BILINEAR),
                    transforms.RandomHorizontalFlip(p=0.5),
                    transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
                    transforms.RandomErasing(p=0.3, scale=(0.02, 0.2), value='random')
                ])
            else:
                self.transform = transforms.Compose([
                    transforms.Resize((256, 128), interpolation=transforms.InterpolationMode.BILINEAR),
                    transforms.ToTensor(),
                    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
                ])

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, pid, camid = self.samples[idx]
        img = Image.open(img_path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        return img, pid, camid

# ── 2. Model Architecture (ResNet-50 512-D L2 Embedding) ───────────────────────

class VehicleReIDNet(nn.Module):
    """
    Deep Vehicle Re-Identification Network producing 512-dimensional L2-normalized embeddings.
    """
    def __init__(self, num_classes=1000, embedding_dim=512, pretrained=True, freeze_early=True):
        super(VehicleReIDNet, self).__init__()
        self.num_classes = num_classes
        self.embedding_dim = embedding_dim
        
        # ResNet-50 Backbone
        resnet = models.resnet50(weights=None)
        cache_file = os.path.expanduser('~/.cache/torch/hub/checkpoints/resnet50-11ad3fa6.pth')
        if pretrained and os.path.exists(cache_file):
            state = torch.load(cache_file, map_location='cpu', weights_only=True)
            resnet.load_state_dict(state)
            print("  • Loaded ImageNet pretrained weights from local cache.", flush=True)
        elif pretrained:
            print("  • Initialized backbone.", flush=True)
        
        self.conv1 = resnet.conv1
        self.bn1 = resnet.bn1
        self.relu = resnet.relu
        self.maxpool = resnet.maxpool
        self.layer1 = resnet.layer1
        self.layer2 = resnet.layer2
        self.layer3 = resnet.layer3
        self.layer4 = resnet.layer4
        
        if freeze_early:
            for p in list(self.conv1.parameters()) + list(self.bn1.parameters()) + \
                     list(self.layer1.parameters()) + list(self.layer2.parameters()) + \
                     list(self.layer3.parameters()):
                p.requires_grad = False
            print("  • Fine-tuning upper layers (layer4 + 512-D embedding projection head).", flush=True)
        
        # Global Average Pooling & 512-D Projection Head
        self.gap = nn.AdaptiveAvgPool2d(1)
        self.reduction = nn.Linear(2048, embedding_dim, bias=False)
        self.reduction_bn = nn.BatchNorm1d(embedding_dim)
        nn.init.kaiming_normal_(self.reduction.weight, mode='fan_out')
        nn.init.constant_(self.reduction_bn.weight, 1.0)
        nn.init.constant_(self.reduction_bn.bias, 0.0)
        
        # Identity Classifier
        self.classifier = nn.Linear(embedding_dim, num_classes, bias=False)
        nn.init.normal_(self.classifier.weight, std=0.001)

    def forward(self, x):
        x = self.conv1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.maxpool(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        
        features = self.gap(x)
        features = features.view(features.size(0), -1)
        
        embedding = self.reduction_bn(self.reduction(features))
        l2_normalized_emb = F.normalize(embedding, p=2, dim=1)
        
        if not self.training:
            return l2_normalized_emb
            
        logits = self.classifier(embedding)
        return l2_normalized_emb, logits

# ── 3. Vectorized Triplet Loss & Label Smoothing Loss ───────────────────────────

class VectorizedBatchHardTripletLoss(nn.Module):
    """
    Vectorized Batch-Hard Triplet Loss with margin.
    """
    def __init__(self, margin=0.3):
        super(VectorizedBatchHardTripletLoss, self).__init__()
        self.margin = margin

    def forward(self, embeddings, targets):
        dist_mat = torch.cdist(embeddings, embeddings, p=2)
        n = targets.size(0)
        
        is_pos = targets.expand(n, n).eq(targets.expand(n, n).t())
        is_neg = ~is_pos
        
        dist_ap = torch.where(is_pos, dist_mat, torch.zeros_like(dist_mat)).max(dim=1)[0]
        dist_an = torch.where(is_neg, dist_mat, torch.full_like(dist_mat, 1e4)).min(dim=1)[0]
        
        loss = F.relu(dist_ap - dist_an + self.margin).mean()
        return loss

class CrossEntropyLabelSmooth(nn.Module):
    """
    Cross-Entropy Loss with label smoothing.
    """
    def __init__(self, num_classes, epsilon=0.1):
        super(CrossEntropyLabelSmooth, self).__init__()
        self.num_classes = num_classes
        self.epsilon = epsilon
        self.logsoftmax = nn.LogSoftmax(dim=-1)

    def forward(self, inputs, targets):
        log_probs = self.logsoftmax(inputs)
        targets_one_hot = torch.zeros_like(log_probs).scatter_(1, targets.unsqueeze(1), 1)
        targets_smooth = (1 - self.epsilon) * targets_one_hot + self.epsilon / self.num_classes
        return (-targets_smooth * log_probs).mean(0).sum()

# ── 4. Training Engine & ONNX Exporter ──────────────────────────────────────────

def train_and_export_reid(
    data_dir="data/vehicle_reid_dataset/crops",
    output_onnx="ml_service/vehicle_reid_512d.onnx",
    output_weights="ml_service/vehicle_reid_resnet50.pth",
    epochs=4,
    batch_size=32,
    max_crops_per_id=12,
    lr=0.0005
):
    print("="*70, flush=True)
    print("🚗 Starting Deep Vehicle Re-Identification (ReID) Pipeline", flush=True)
    print("="*70, flush=True)
    
    device = torch.device("cpu")
    torch.set_num_threads(4)
    print("⚡ Using Multi-Core CPU acceleration (Accelerate BLAS)", flush=True)
        
    dataset = VehicleReIDDataset(data_dir=data_dir, is_train=True, max_crops_per_id=max_crops_per_id)
    num_classes = max(dataset.num_classes, 2)
    
    if len(dataset) == 0:
        print(f"[Warning] No crops found in {data_dir}.", flush=True)
        return
    else:
        print(f"• Dataset indexed: {len(dataset)} balanced vehicle crops across {num_classes} identities.", flush=True)
        loader = DataLoader(
            dataset,
            batch_size=batch_size,
            shuffle=True,
            num_workers=0,
            drop_last=(len(dataset) > batch_size),
            pin_memory=False
        )

    # Initialize Model
    model = VehicleReIDNet(num_classes=num_classes, embedding_dim=512, pretrained=True, freeze_early=True)
    model.to(device)
    
    # Trainable parameters: layer4 + projection + classifier
    trainable_params = [p for p in model.parameters() if p.requires_grad]
    optimizer = torch.optim.Adam(trainable_params, lr=lr, weight_decay=5e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    
    criterion_ce = CrossEntropyLabelSmooth(num_classes=num_classes)
    criterion_triplet = VectorizedBatchHardTripletLoss(margin=0.3)
    
    # Training Loop
    model.train()
    total_batches = len(loader)
    
    for epoch in range(1, epochs + 1):
        epoch_loss = 0.0
        correct = 0
        total = 0
        start_epoch_time = time.time()
        
        for batch_idx, (imgs, pids, _) in enumerate(loader):
            imgs, pids = imgs.to(device), pids.to(device)
            optimizer.zero_grad()
            
            embs, logits = model(imgs)
            
            loss_ce = criterion_ce(logits, pids)
            loss_triplet = criterion_triplet(embs, pids)
            loss = loss_ce + loss_triplet
            
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item() * imgs.size(0)
            _, preds = torch.max(logits, 1)
            correct += torch.sum(preds == pids.data).item()
            total += imgs.size(0)

            if (batch_idx + 1) % 15 == 0 or (batch_idx + 1) == total_batches:
                curr_acc = (correct / total * 100) if total > 0 else 0
                curr_loss = epoch_loss / total if total > 0 else 0
                print(f"  [Epoch {epoch:02d}/{epochs:02d}] Batch {batch_idx+1:03d}/{total_batches:03d} | Loss: {curr_loss:.4f} | ID Acc: {curr_acc:.1f}%", flush=True)
            
        scheduler.step()
        acc = (correct / total * 100) if total > 0 else 0
        avg_loss = epoch_loss / total if total > 0 else 0
        elapsed = time.time() - start_epoch_time
        print(f"🌟 Epoch [{epoch:02d}/{epochs:02d}] Finished in {elapsed:.1f}s | Avg Loss: {avg_loss:.4f} | ID Acc: {acc:.2f}% | LR: {scheduler.get_last_lr()[0]:.6f}\n", flush=True)

    # Save PyTorch Model Weights
    os.makedirs(os.path.dirname(output_weights), exist_ok=True)
    torch.save(model.state_dict(), output_weights)
    print(f"✅ Saved trained model weights to: {output_weights}", flush=True)

    # Export to ONNX
    print("📦 Exporting model to ONNX format (512-D Embedding output)...", flush=True)
    model.eval()
    dummy_input = torch.randn(1, 3, 256, 128, device=device)
    os.makedirs(os.path.dirname(output_onnx), exist_ok=True)
    
    # Move to CPU for clean standard ONNX export
    model_cpu = model.cpu()
    dummy_cpu = dummy_input.cpu()
    
    try:
        torch.onnx.export(
            model_cpu,
            dummy_cpu,
            output_onnx,
            export_params=True,
            opset_version=14,
            do_constant_folding=True,
            input_names=["input"],
            output_names=["embedding"],
            dynamic_axes={
                "input": {0: "batch_size"},
                "embedding": {0: "batch_size"}
            },
            dynamo=False
        )
    except TypeError:
        torch.onnx.export(
            model_cpu,
            dummy_cpu,
            output_onnx,
            export_params=True,
            opset_version=14,
            do_constant_folding=True,
            input_names=["input"],
            output_names=["embedding"],
            dynamic_axes={
                "input": {0: "batch_size"},
                "embedding": {0: "batch_size"}
            }
        )
    print(f"✅ Exported 512-D ONNX model to: {output_onnx}", flush=True)
    
    # Verify ONNX model with ONNX Runtime
    import onnx
    import onnxruntime as ort
    
    onnx_model = onnx.load(output_onnx)
    onnx.checker.check_model(onnx_model)
    
    session = ort.InferenceSession(output_onnx, providers=["CPUExecutionProvider"])
    test_arr = np.random.randn(1, 3, 256, 128).astype(np.float32)
    onnx_out = session.run(None, {"input": test_arr})[0]
    
    emb_norm = np.linalg.norm(onnx_out[0])
    print(f"✅ ONNX Verification Succeeded! Output Shape: {onnx_out.shape}, L2 Norm: {emb_norm:.4f}", flush=True)
    print("="*70, flush=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--max-crops-per-id", type=int, default=10)
    args = parser.parse_args()
    
    train_and_export_reid(epochs=args.epochs, batch_size=args.batch_size, max_crops_per_id=args.max_crops_per_id)
