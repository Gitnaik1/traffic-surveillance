import os
import cv2
import json
import glob
from tqdm import tqdm
from collections import defaultdict

def prepare_reid_crops(
    dataset_root="data/vehicle_reid_dataset",
    output_dir="data/vehicle_reid_dataset/crops",
    sample_stride=6,
    max_crops_per_track=25
):
    os.makedirs(output_dir, exist_ok=True)
    metadata_records = []
    
    seq_dirs = sorted(glob.glob(os.path.join(dataset_root, "train", "S*")) + 
                      glob.glob(os.path.join(dataset_root, "validation", "S*")))
    
    print(f"[Dataset Preparation] Found {len(seq_dirs)} sequences to process.")
    
    total_crops = 0
    identity_map = defaultdict(list)
    
    for s_idx, seq_dir in enumerate(seq_dirs):
        seq_name = os.path.basename(seq_dir)
        cam_dirs = sorted(glob.glob(os.path.join(seq_dir, "c*")))
        print(f"\n--- Processing Sequence {seq_name} ({len(cam_dirs)} cameras) ---")
        
        for cam_dir in cam_dirs:
            cam_name = os.path.basename(cam_dir)
            video_file = os.path.join(cam_dir, "vdo.avi")
            gt_file = os.path.join(cam_dir, "gt", "gt.txt")
            
            if not os.path.exists(video_file):
                continue
            if not os.path.exists(gt_file):
                det_files = glob.glob(os.path.join(cam_dir, "det", "*.txt"))
                if not det_files:
                    continue
                gt_file = det_files[0]
            
            frame_boxes = defaultdict(list)
            with open(gt_file, "r") as f:
                for line in f:
                    parts = line.strip().split(",")
                    if len(parts) < 6:
                        parts = line.strip().split()
                    if len(parts) >= 6:
                        frame_id = int(parts[0])
                        target_id = int(parts[1])
                        if target_id <= 0:
                            continue
                        x, y, w, h = int(float(parts[2])), int(float(parts[3])), int(float(parts[4])), int(float(parts[5]))
                        if w >= 30 and h >= 30:
                            frame_boxes[frame_id].append((target_id, x, y, w, h))
            
            if not frame_boxes:
                continue
                
            cap = cv2.VideoCapture(video_file)
            frame_idx = 0
            track_counts = defaultdict(int)
            
            sorted_frames = sorted(frame_boxes.keys())
            max_frame = max(sorted_frames) if sorted_frames else 0
            
            pbar = tqdm(total=max_frame, desc=f"{seq_name}/{cam_name}", unit="frame")
            
            while cap.isOpened() and frame_idx <= max_frame:
                ret, frame = cap.read()
                frame_idx += 1
                pbar.update(1)
                if not ret:
                    break
                
                if frame_idx in frame_boxes:
                    for target_id, x, y, w, h in frame_boxes[frame_idx]:
                        if track_counts[target_id] >= max_crops_per_track:
                            continue
                        if frame_idx % sample_stride != 0 and track_counts[target_id] > 0:
                            continue
                            
                        fh, fw = frame.shape[:2]
                        x1 = max(0, x)
                        y1 = max(0, y)
                        x2 = min(fw, x + w)
                        y2 = min(fh, y + h)
                        
                        if (x2 - x1) < 25 or (y2 - y1) < 25:
                            continue
                            
                        crop = frame[y1:y2, x1:x2]
                        if crop.size == 0:
                            continue
                            
                        global_veh_id = f"{seq_name}_ID_{target_id:04d}"
                        veh_dir = os.path.join(output_dir, global_veh_id)
                        os.makedirs(veh_dir, exist_ok=True)
                        
                        crop_filename = f"{cam_name}_F{frame_idx:06d}.jpg"
                        crop_path = os.path.join(veh_dir, crop_filename)
                        
                        resized_crop = cv2.resize(crop, (128, 256), interpolation=cv2.INTER_LINEAR)
                        cv2.imwrite(crop_path, resized_crop)
                        
                        record = {
                            "image_path": crop_path,
                            "relative_path": os.path.relpath(crop_path, dataset_root),
                            "vehicle_id": global_veh_id,
                            "raw_target_id": target_id,
                            "camera_id": f"{seq_name}_{cam_name}",
                            "sequence_id": seq_name,
                            "frame_id": frame_idx
                        }
                        metadata_records.append(record)
                        identity_map[global_veh_id].append(record)
                        track_counts[target_id] += 1
                        total_crops += 1
                        
            cap.release()
            pbar.close()

    meta_path = os.path.join(output_dir, "reid_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata_records, f, indent=2)
        
    print("\n" + "="*60)
    print(f"🎉 Dataset Crop Preparation Complete!")
    print(f"• Total Unique Vehicle Identities: {len(identity_map)}")
    print(f"• Total Vehicle Crops Generated: {total_crops}")
    print(f"• Metadata saved to: {meta_path}")
    print("="*60)
    return metadata_records

if __name__ == "__main__":
    prepare_reid_crops()
