# SchoolScout

A school discovery web application for UK parents. Search schools by postcode, explore them on an interactive map, view Ofsted ratings and performance data, and compare schools side by side.

## Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Leaflet, TanStack Query
- **Backend:** Java Spring Boot microservices
- **Database:** PostgreSQL with PostGIS

## Getting started

### Prerequisites

- Java 17+, Maven
- Node.js 18+
- Docker (for the database)

### 1. Start the database

```bash
docker compose up -d
```

### 2. Ingest school data

```bash
cd data-ingestion-service
mvn spring-boot:run
# In a separate terminal:
curl -X POST http://localhost:8081/ingest
```

### 3. Start the school service API

```bash
cd school-service
mvn spring-boot:run
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Environment

Copy `frontend/.env.example` to `frontend/.env` and set:

```
VITE_API_URL=http://localhost:8080
```
