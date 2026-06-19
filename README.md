# CollabDocs

**Production-grade real-time collaborative document editor** — a Google Docs-inspired platform demonstrating CRDT synchronization, offline-first editing, vector clocks, version history, and distributed systems concepts.

## Architecture

```
Frontend (React + TipTap + Yjs)
        ↓ WebSocket
CRDT Synchronization Engine (Yjs + y-protocols)
        ↓
Backend API (Express + TypeScript)
        ↓
PostgreSQL (Neon) via Prisma ORM
```

## Key Features

- **Real-time collaboration** — Live cursors, selections, typing indicators via Yjs Awareness
- **CRDT synchronization** — Conflict-free concurrent editing with Yjs (operation-based, not full-document sync)
- **Offline-first** — IndexedDB persistence; operations queue locally and merge on reconnect
- **Version history** — Every operation stored; reconstruct document state at any timestamp
- **Vector clocks & Lamport timestamps** — Causality tracking for distributed events
- **CRDT Internals panel** — Live visualization of merge events (interview demo feature)
- **Network simulator** — Latency, packet loss, disconnect/reconnect testing
- **Analytics dashboard** — Ops/sec, merge count, WebSocket latency, memory usage
- **RBAC permissions** — Owner, Editor, Commenter, Viewer
- **Google OAuth** + email/password authentication

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, TypeScript, TailwindCSS, TipTap, Yjs, Zustand, React Query |
| Backend | Node.js, Express, TypeScript, ws, Prisma |
| Database | PostgreSQL (Neon) |
| Auth | JWT, Passport.js, Google OAuth |
| Deployment | Vercel (frontend), Render/Railway (backend) |

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database ([Neon](https://neon.tech) recommended)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd Google-Docs
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, and optional Google OAuth credentials

# Initialize database
npm run db:push

# Start development servers
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3001/ws/:documentId?token=...

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret (optional) |
| `CLIENT_URL` | Frontend URL for CORS and OAuth redirects |
| `VITE_API_URL` | Backend URL (frontend) |
| `VITE_WS_URL` | WebSocket URL (frontend) |

## Project Structure

```
├── backend/
│   ├── prisma/schema.prisma    # Database schema (12 tables)
│   └── src/
│       ├── services/           # Auth, Document, Version, CRDT Sync, Presence, Analytics
│       ├── routes/             # REST API endpoints
│       ├── middleware/         # Auth, permissions, rate limiting
│       └── utils/              # Vector clocks, Lamport timestamps
├── frontend/
│   └── src/
│       ├── components/editor/  # TipTap editor, CRDT panel, network sim
│       ├── pages/              # Dashboard, Editor, Login
│       ├── hooks/              # Collaboration, API hooks
│       └── store/              # Zustand state management
```

## Database Schema

Core tables: `users`, `documents`, `document_permissions`, `document_versions`, `document_snapshots`, `document_operations`, `active_sessions`, `user_presence`, `activity_logs`, `notifications`, `audit_logs`, `pinned_documents`, `recently_opened`

Operations are stored separately from snapshots — document state is never overwritten without audit trail.

## Interview Talking Points

1. **Why CRDT over OT?** — CRDTs enable peer-to-peer sync without a central transformation server; Yjs uses YATA algorithm for text.
2. **How does offline sync work?** — Yjs + IndexedDB stores local ops; on reconnect, state vectors diff and merge automatically.
3. **Vector clocks** — Track causality across clients; concurrent edits detected when clocks are incomparable.
4. **Scaling WebSockets** — Add Redis Pub/Sub between server instances; sticky sessions or CRDT room affinity.
5. **Snapshot strategy** — Periodic snapshots every N operations avoid replaying full operation log.

## Deployment

### Frontend (Vercel)

```bash
cd frontend && vercel
```

Set `VITE_API_URL` and `VITE_WS_URL` to your production backend.

### Backend (Render)

Use `render.yaml` or connect repo with:
- Build: `npm install && npm run build -w backend`
- Start: `npm run start -w backend`
- Set all environment variables from `.env.example`

### Database (Neon)

Create a project at [neon.tech](https://neon.tech), copy the connection string to `DATABASE_URL`, then run `npm run db:push`.

## Demo Scenarios

1. Open same document in two browser tabs → see live cursors and instant sync
2. Toggle "CRDT Internals" → watch operations, vector clocks, and merge events
3. Use Network Simulator → disconnect, edit offline, reconnect → automatic merge
4. Open Version History → restore or reconstruct at any timestamp

## License

MIT
