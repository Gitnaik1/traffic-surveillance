export interface Vehicle {
  id: string
  plate: string
  type: string
  color: string
  firstSeen: string
  lastSeen: string
  currentCamera: string
  camerasVisited: number
  confidence: number
  status: 'Active' | 'Tracked' | 'Completed' | 'Alert'
}

export const vehicles: Vehicle[] = [
  { id: 'UTX-VH-00124', plate: 'KA01AB1234', type: 'SUV', color: 'White', firstSeen: '10:21:14', lastSeen: '10:47:22', currentCamera: 'CAM-004', camerasVisited: 3, confidence: 94.6, status: 'Tracked' },
  { id: 'UTX-VH-00125', plate: 'MH12CD5678', type: 'Sedan', color: 'Silver', firstSeen: '10:25:03', lastSeen: '10:51:09', currentCamera: 'CAM-007', camerasVisited: 4, confidence: 88.2, status: 'Active' },
  { id: 'UTX-VH-00126', plate: 'DL3CXY9010', type: 'Motorcycle', color: 'Black', firstSeen: '10:31:44', lastSeen: '10:33:11', currentCamera: 'CAM-002', camerasVisited: 1, confidence: 71.4, status: 'Completed' },
  { id: 'UTX-VH-00127', plate: 'TN09EF3456', type: 'Bus', color: 'Blue', firstSeen: '09:58:27', lastSeen: '10:42:55', currentCamera: 'CAM-009', camerasVisited: 5, confidence: 97.1, status: 'Tracked' },
  { id: 'UTX-VH-00128', plate: 'KA03GH7890', type: 'Truck', color: 'Red', firstSeen: '10:05:18', lastSeen: '10:28:44', currentCamera: 'CAM-001', camerasVisited: 2, confidence: 82.9, status: 'Alert' },
  { id: 'UTX-VH-00129', plate: 'AP39IJ1122', type: 'Auto', color: 'Yellow', firstSeen: '10:38:52', lastSeen: '10:55:30', currentCamera: 'CAM-006', camerasVisited: 2, confidence: 66.3, status: 'Active' },
  { id: 'UTX-VH-00130', plate: 'GJ05KL3344', type: 'Car', color: 'Grey', firstSeen: '10:12:07', lastSeen: '10:44:19', currentCamera: 'CAM-003', camerasVisited: 3, confidence: 91.0, status: 'Tracked' },
  { id: 'UTX-VH-00131', plate: 'RJ14MN5566', type: 'SUV', color: 'Black', firstSeen: '10:47:33', lastSeen: '10:59:01', currentCamera: 'CAM-008', camerasVisited: 2, confidence: 79.5, status: 'Active' },
  { id: 'UTX-VH-00132', plate: 'WB01PQ7788', type: 'Sedan', color: 'White', firstSeen: '09:45:11', lastSeen: '10:15:38', currentCamera: 'CAM-005', camerasVisited: 4, confidence: 85.7, status: 'Completed' },
  { id: 'UTX-VH-00133', plate: 'TS07RS9900', type: 'Motorcycle', color: 'Blue', firstSeen: '10:52:44', lastSeen: '10:58:22', currentCamera: 'CAM-002', camerasVisited: 1, confidence: 58.1, status: 'Active' },
  { id: 'UTX-VH-00134', plate: 'KL08TU1234', type: 'Car', color: 'Green', firstSeen: '10:18:29', lastSeen: '10:49:55', currentCamera: 'CAM-007', camerasVisited: 3, confidence: 93.3, status: 'Tracked' },
  { id: 'UTX-VH-00135', plate: 'HR26VW5678', type: 'Truck', color: 'White', firstSeen: '09:30:00', lastSeen: '10:07:44', currentCamera: 'CAM-001', camerasVisited: 6, confidence: 96.8, status: 'Alert' },
]
