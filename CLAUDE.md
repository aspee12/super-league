# Claude.md

## Project Overview
Super League is a football league web application inspired by the English Premier League.  
The platform displays league standings, match schedules, statistics, and team information.

The application is built using modern full-stack technologies including Next.js and Payload CMS.

## Tech Stack
Frontend:
- Next.js (App Router)
- React 19
- Tailwind CSS
- React Hook Form
- Zustand (state management)
- TanStack React Query (server state)

Backend / CMS:
- Payload CMS
- MongoDB

Other Tools:
- Lucide React (icons)
- FontAwesome
- Sonner (toast notifications)
- Sharp (image processing)

## Package Manager
npm

## Project Scripts

Run development server:

npm run dev

Build production:

npm run build

Start production server:

npm run start

Run ESLint:

npm run lint

Seed super admin user:

npm run seed:super-admin

Seed teams data:

npm run seed:teams

## Project Architecture

High level structure:

/app
Next.js routes and pages

/components
Reusable UI components

/lib
Utilities, helpers, shared functions

/store
Zustand stores

/hooks
Reusable React hooks

/payload
Payload CMS configuration and collections

/scripts
Database seed scripts

/public
Static assets

## State Management

Client State:
Zustand

Server State:
TanStack React Query

Forms:
React Hook Form

## Styling
Tailwind CSS is used for styling.
Design reference comes from the Figma design system.

## CMS

Payload CMS manages:

- Teams
- Matches
- League standings
- Statistics
- Media (team logos, player images)

MongoDB is used as the database.

## Seeding

Two seed scripts exist:

seed-super-admin.mjs  
Creates the initial admin user.

seed-teams.mjs  
Populates the database with league teams.

## Coding Guidelines

- Use TypeScript for all new files
- Follow functional React components
- Prefer server components where possible
- Keep UI components reusable
- Use Tailwind utilities instead of custom CSS when possible
- Use React Query for API data fetching
- Use Zustand only for client state

## Environment Variables

.env file example:

DATABASE_URI=
PAYLOAD_SECRET=
NEXT_PUBLIC_APP_URL=

## Goal

Build a scalable football league management and viewing platform with a clean UI and maintainable architecture.