# California Fraud Intelligence Platform

A premium California-native fraud intelligence visualization platform built with Next.js, FastAPI, and MapLibre (OpenStreetMap).

## Design Philosophy

- **Californian**: Bright, confident, data-driven
- **Modern**: Sunlit, breathable layouts with high contrast
- **Trustworthy**: Serious but not oppressive, premium feel
- **Data-first**: Human-centered data visualization

## Color System

| Color | Hex | Usage |
|-------|-----|-------|
| California Sand | `#F9FAF7` | Background |
| White | `#FFFFFF` | Cards, surfaces |
| Border | `#E6E2D8` | Soft sand borders |
| Pacific Blue | `#1E6FFF` | Ocean, primary accent |
| Golden Poppy | `#F6B400` | State flower, highlight |
| Redwood Green | `#2E5E4E` | Forest, secondary |
| Sunset Orange | `#FF7A18` | Warm accent |

### Fraud Severity Heatmap

Light Yellow → Golden → Orange → Crimson (never black)

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **MapLibre GL JS** - Interactive California map (free, open source)
- **Framer Motion** - Animations and micro-interactions
- **React Query** - Server state management
- **Zustand** - Client state management
- **D3.js** - Data visualizations

### Backend
- **FastAPI** - Python async API framework
- **SQLAlchemy** - ORM
- **GeoAlchemy2** - Geospatial extensions
- **PostgreSQL + PostGIS** - Database with geo support

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Docker (for PostgreSQL)

### 1. Start the Database

```bash
docker-compose up -d
```

### 2. Setup Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Seed the database
python -m app.db.seed_data

# Start the API
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file (optional - for API URL override)
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

### Interactive California Map
- MapLibre + OpenStreetMap (free, no API token)
- Custom light style with California geography emphasis
- Fraud heatmap with smooth gradient transitions
- Case markers sized by fraud amount
- Golden state silhouette with subtle glow

### Command Panel
- Real-time KPI cards with counting animations
- Scheme type filter chips (color-coded)
- Fraud amount range slider
- Date range picker with quick presets

### Time Scrubber
- Glassmorphism bottom overlay
- Animated playback of fraud timeline
- Month-by-month heatmap morphing

### Case Detail Panel
- Slide-up modal with clean hierarchy
- Gold-emphasized amounts
- Source documentation links

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/cases` | GET | List fraud cases with filters |
| `/api/cases/{id}` | GET | Get case details |
| `/api/analytics/summary` | GET | KPI aggregations |
| `/api/analytics/heatmap` | GET | Heatmap data by county |
| `/api/analytics/timeline` | GET | Time-series data |
| `/api/geo/counties` | GET | County GeoJSON |
| `/api/geo/points` | GET | Case points GeoJSON |

## Accessibility

- WCAG AA compliant contrast ratios
- Keyboard navigable filters
- Screen reader friendly
- Color-blind safe heatmap gradients
- Focus indicators with golden accent

## Responsive Design

- **Desktop** (1280px+): Full sidebar + map + timeline
- **Tablet** (768-1279px): Collapsible sidebar
- **Mobile** (<768px): Map-only with swipeable panels

## License

Private - All rights reserved
