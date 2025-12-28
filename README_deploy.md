# Deployment Guide

## Prerequisites
- Node.js 18+
- npm
- Set environment variables (see .env.example)

## Install
```
npm install
```

## Run (dev)
```
npm run dev
```

## Run (prod)
```
npm start
```

## Environment
- PORT: server port (default 3000)
- AUTH_*: credentials for auth provider (placeholders)
- DB_*: connection details (placeholders)

## Seed Data (placeholder)
- Not implemented; insert via your DB directly or add a seed script when persistence is added.

## Notes
- Current backend uses in-memory stores; add persistence before production.
- SLA/escalation/audit are wired as services; ensure immutability and append-only semantics when backing with a database.