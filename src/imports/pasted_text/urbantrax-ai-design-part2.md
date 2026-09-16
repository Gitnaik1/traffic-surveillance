Design Part 2 of the UrbanTrax AI frontend.

URBANTRAX AI
City-Wide Multi-Camera ANPR & Traffic Intelligence

SIH Problem Statement:
SIH26127 — City-Wide AI Engine for Multi-Camera ANPR Trajectory Tracking and Urban Traffic Analytics.

You are designing ONLY:

1. Vehicle Intelligence
2. ANPR / Number Plates
3. Multi-Camera Vehicle Trajectories

Do not design Dashboard, Live Cameras, Analytics, Alerts, Watchlist, Camera Management, Reports, System Health or Settings.

==================================================
GLOBAL DESIGN LANGUAGE
==================================================

IMPORTANT:
Your designs will be combined with designs produced by three other teammates.

Therefore DO NOT invent a separate style.

Use exactly this visual language:

- dark-first smart-city command center
- premium technical interface
- clean AI/computer-vision aesthetic
- professional
- information-dense but readable
- minimal gradients
- no gaming UI
- no excessive neon
- no excessive glass effects

Colors:
- dark navy/charcoal background
- slightly lighter dark cards
- electric blue primary accent
- cyan secondary accent
- green success
- amber warning
- red danger
- white primary text
- gray secondary text

Use consistent:
- card shapes
- spacing
- typography
- icons
- buttons
- badges
- tables
- modals

==================================================
GLOBAL SIDEBAR
==================================================

Use the same exact sidebar structure:

UrbanTrax AI

Dashboard
Live Cameras
Vehicle Intelligence
ANPR
Trajectories
Traffic Analytics
Alerts
Watchlist
Camera Management
Reports
System Health
Settings

Show the relevant current page as active.

Same top navbar:
- page title
- global search
- system status
- notifications
- timestamp
- profile

==================================================
PAGE 1 — VEHICLE INTELLIGENCE
==================================================

Title:
Vehicle Intelligence

Subtitle:
Search and inspect vehicles detected across the camera network.

--------------------------------------------------
SEARCH / FILTER AREA
--------------------------------------------------

Search by:

- License Plate
- Vehicle ID
- Camera
- Date
- Time

Filters:

Vehicle type:
Car
Motorcycle
Bus
Truck
Auto
Other

Status:
Active
Tracked
Completed
Alert

Confidence:
High
Medium
Low

--------------------------------------------------
VEHICLE TABLE
--------------------------------------------------

Create a professional searchable table.

Columns:

Vehicle ID
License Plate
Vehicle Type
Color
First Seen
Last Seen
Current Camera
Cameras Visited
Confidence
Status
Actions

Sample:

UTX-VH-00124
KA01AB1234
SUV
White
10:21:14
10:47:22
CAM-004
3
94.6%
Tracked

Use pagination.

--------------------------------------------------
VEHICLE DETAILS
--------------------------------------------------

Clicking a vehicle opens a detailed page/drawer.

Show:

Vehicle ID
UTX-VH-00124

License Plate
KA01AB1234

Vehicle Type
SUV

Color
White

Identity Confidence
94.6%

First Seen
10:21:14

Last Seen
10:47:22

Current Camera
CAM-004

Create sections:

Vehicle image
Plate crop
Detection history
Camera history
Journey
Identity evidence

Identity evidence:

Plate match
Appearance similarity
Vehicle type
Color
Re-ID confidence

Show confidence visually.

==================================================
PAGE 2 — ANPR
==================================================

Title:
Automatic Number Plate Recognition

Subtitle:
Real-time license plate detection and OCR monitoring.

--------------------------------------------------
ANPR KPI CARDS
--------------------------------------------------

Plates Detected
Successful OCR
OCR Accuracy
Unknown / Unreadable

--------------------------------------------------
ANPR TABLE
--------------------------------------------------

Columns:

Timestamp
Plate
Camera
Location
Vehicle Type
OCR Confidence
Vehicle ID
Status
Evidence

Statuses:

Verified
Low Confidence
Unreadable
Manual Review

--------------------------------------------------
ANPR DETAIL MODAL
--------------------------------------------------

When clicking an ANPR result, show:

Large vehicle image
Cropped number plate
Recognized plate
OCR confidence
Camera
Location
Timestamp
Vehicle ID

Include:

Raw OCR result
Normalized plate result

Example:

Raw:
KA 01 AB 1234

Normalized:
KA01AB1234

Do not imply OCR is always correct.

Show confidence clearly.

==================================================
PAGE 3 — MULTI-CAMERA TRAJECTORIES
==================================================

This is one of the most important pages in the entire product.

Title:
Vehicle Trajectory

Subtitle:
Reconstruct vehicle movement across multiple cameras.

--------------------------------------------------
VEHICLE SEARCH
--------------------------------------------------

Search by:

License Plate
Vehicle ID

After selecting a vehicle:

Vehicle:
UTX-VH-00124

Plate:
KA01AB1234

--------------------------------------------------
MAIN MAP
--------------------------------------------------

Create a large geographic map.

Show:

CAM-001
CAM-003
CAM-007
CAM-009

Connect camera nodes using route lines.

Use arrows to show direction.

Show timestamps beside each node.

Example:

CAM-001
10:21:14

↓

CAM-003
10:35:08

↓

CAM-007
10:43:52

Use a strong visual distinction between:
- detected camera
- current camera
- route
- selected location

--------------------------------------------------
TIMELINE
--------------------------------------------------

Create a chronological journey timeline.

Each event:

Timestamp
Camera
Location
Event
Confidence

Example:

10:21:14
CAM-001
Vehicle detected

10:35:08
CAM-003
Vehicle re-identified

10:43:52
CAM-007
Vehicle detected

--------------------------------------------------
JOURNEY SUMMARY
--------------------------------------------------

Show:

Total Journey Time
22m 38s

Cameras Visited
3

Estimated Distance
7.2 km

Average Speed
31 km/h

Re-ID Confidence
91.4%

--------------------------------------------------
IDENTITY MATCH EVIDENCE
--------------------------------------------------

Create a panel:

Plate Match
Strong

Appearance Similarity
88%

Vehicle Type
Match

Color
Match

Time/Route Consistency
High

Overall Match Confidence
91.4%

Clearly communicate that confidence is an estimate, not absolute identity proof.

==================================================
BACKEND-READY DATA
==================================================

The frontend should be ready to consume:

Vehicle:
id
plate_number
vehicle_type
color
confidence

Detection:
vehicle_id
camera_id
timestamp
bbox
plate_number
plate_confidence

Trajectory:
vehicle_id
camera_id
timestamp
latitude
longitude
confidence

Journey:
start_camera
end_camera
start_time
end_time
travel_time

==================================================
IMPORTANT
==================================================

These screens will later connect to FastAPI REST APIs and WebSockets.

Do not use the frontend to directly interact with AI models or databases.

The frontend is only the visualization layer.

Generate reusable:
- tables
- vehicle cards
- ANPR cards
- detail drawers
- journey timeline
- trajectory map
- confidence badges

Make everything consistent with the other UrbanTrax pages.



IMPORTANT RULE:

Do not create your own sidebar, navbar, typography, color palette, button style, card style, spacing system, or visual language.

All four frontend parts belong to ONE product:
URBANTRAX AI.

Use the exact global design specification in the prompt.

Use the same:
- desktop layout proportions
- sidebar width
- top navbar
- font hierarchy
- colors
- icons
- border radius
- shadows
- badges
- buttons
- tables
- modal style
- spacing

Use the sample camera names, vehicle IDs, plates, and terminology consistently.

Design everything so that the final four parts can be merged into one React + Vite + Tailwind application and connected to the same FastAPI backend.

Do not add unrelated pages or features.