# TruthLens AI Trust Platform

TruthLens AI is a production-ready AI Trust & Safety Platform for detecting AI-generated videos, assessing media authenticity, and integrating deepfake verification audits directly into publication pipelines.

Think of it as Cloudflare for video authenticity or VirusTotal for synthetic media.

---

## Repository Structure

```
TruthLens/
├── backend/                  # FastAPI backend and AI pipelines
│   ├── app/
│   │   ├── api/              # HTTP routers (endpoints.py)
│   │   ├── services/         # VideoProcessor, AIDetector, PDFGenerator, WebhookClient
│   │   ├── main.py           # FastAPI entrypoint and CORS setups
│   │   └── models.py         # Pydantic schemas and types
│   ├── tests/                # Pytest unit and integration test suite
│   ├── Dockerfile            # Container definition for API and AI dependencies
│   └── requirements.txt      # Python packages list
├── frontend/                 # Next.js and Tailwind CSS frontend
│   ├── src/app/
│   │   ├── dashboard/        # Enterprise metrics, queues, Recharts and audit log
│   │   ├── portal/           # Video Upload, webhook config, drag-and-drop
│   │   │   └── result/[id]/  # Trust score radial gauge, suspicious timestamps, frame details
│   │   ├── layout.tsx        # Responsive layout and dark styling wrappers
│   │   ├── globals.css       # Tailwind CSS v4 variables and custom glassmorphism classes
│   │   └── page.tsx          # Marketing Landing page (Hero, Features, Pricing accordion)
│   ├── Dockerfile            # Multi-stage production build container definition
│   └── package.json          # Node dependencies list
├── docker-compose.yml        # Multi-container local orchestration script
└── README.md                 # Project instructions manual
```

---

## Core Technical Features

1. **Dual-Mode AI Engine**:
   - **Active Mode**: Preloads a lightweight PyTorch neural network backbone (`mobilenet_v3_small` / `efficientnet`) and performs OpenCV-based frame-splitting and Haar face detection.
   - **Fallback Simulation Mode**: Gracefully handles lack of GPU runtime or weight downloading timeouts. It runs a deterministic analysis utilizing image channel distributions and filename keyword vectors.
2. **Interactive Trust Gauges**: Radial trust indicators displaying risk classes (High, Medium, Low) and confidence verifications.
3. **Automated PDF Audits**: High-fidelity PDF certifications compiled dynamically using `ReportLab`, listing frame evaluation tables, warning recommendations, and timestamp markings.
4. **Integration Ready**: Developer-friendly REST API endpoints combined with asynchronous webhook payloads and secret key headers.

---

## Installation & Setup

### Requirements
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Docker & Docker Compose** (Optional, for containers)

---

### Running Locally

#### 1. Setup Backend
```bash
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
- API Swagger documentation is served at [http://localhost:8000/docs](http://localhost:8000/docs)
- Base status check is at [http://localhost:8000/](http://localhost:8000/)

#### 2. Setup Frontend
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install Node dependencies
npm install --legacy-peer-deps

# Run Next.js in development mode
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000) to view the Platform Landing Page, Portal Uploads, and Dashboards.

---

### Running Backend Unit Tests

Verify API contracts, schema structures, and pipeline mock loading:
```bash
cd backend
venv\Scripts\python -m pytest tests/
```

---

### Running via Docker Compose

To build and run both the Next.js frontend and FastAPI backend together in production containers:
```bash
docker-compose up --build
```
- Next.js Web Portal: [http://localhost:3000](http://localhost:3000)
- FastAPI Service: [http://localhost:8000](http://localhost:8000)