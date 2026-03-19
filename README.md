# Selise Super League (SSL) Portal

A sports league management portal for tracking teams, players, matches, and standings — built with Next.js and Payload CMS.

## Tech Stack

- **Framework:** Next.js 16 (React 19, TypeScript)
- **CMS:** Payload CMS 3
- **Database:** MongoDB
- **Storage:** Vercel Blob
- **Styling:** Tailwind CSS 4, Radix UI (shadcn/ui)
- **State:** Zustand, TanStack React Query
- **Package Manager:** Yarn 4

## Prerequisites

- Node.js 18+
- Yarn
- MongoDB instance (local or Atlas)
- Vercel Blob store (public access)

## Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL=your_mongodb_connection_string
PAYLOAD_SECRET=your_secret_key
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### 3. Seed the database (optional)

```bash
yarn seed:super-admin
yarn seed:teams
```

### 4. Run the development server

```bash
yarn dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                  | Description                     |
| ------------------------ | ------------------------------- |
| `yarn dev`               | Start development server        |
| `yarn build`             | Build for production            |
| `yarn start`             | Start production server         |
| `yarn lint`              | Run ESLint                      |
| `yarn seed:super-admin`  | Seed super admin user           |
| `yarn seed:teams`        | Seed teams data                 |

## Project Structure

```
src/
├── app/
│   ├── (client)/        # Public-facing routes (table, login, team pages)
│   └── (payload)/       # Payload CMS admin panel (/admin)
├── collections/         # Payload collection schemas (Users, Teams, Players, Matches, Media)
├── components/          # React components (ui, auth, teams, matches, stats)
├── hooks/               # Custom React hooks
├── lib/                 # API clients & utilities
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── styles/              # Global styles
```

## Deployment

The project is deployed on **Vercel**. Push to `main` to trigger a production deployment.

Required Vercel environment variables:

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `BLOB_READ_WRITE_TOKEN`
