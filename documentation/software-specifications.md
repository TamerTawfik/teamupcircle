# Software Requirements Specification

## System Design

- A responsive web platform for matching and collaborating on open-source projects and hackathons.
- Three primary user roles: **Maintainers**, **Contributors**, and **Organizers**.
- Core modules:
  - Authentication & Profile
  - Discovery & Filtering
  - Matching Engine
  - Team Collaboration & Messaging
  - Event Management
  - Notifications & Activity Feed
  - Reputation & Analytics
  - Admin & Moderation

## Architecture Pattern

- **App Directory (Next.js 15)** using Server Components and Server Actions.
- **Client-server hybrid**: server-side data fetching with interactive client components.
- **Modular component architecture** with shared UI primitives (cards, drawers, toasts).
- Feature-based folder structure (`/features/projects`, `/features/events`, etc.)

## State Management

- **Zustand** for lightweight client-side global state (e.g., user context, modals, chat sessions).
- **Server Actions** for mutations (join team, RSVP, send message).
- **URL + local component state** for filters/searches and drawers.
- React Query is **not used** — Server Actions + caching handled by Next.js.

## Data Flow

- **Authentication** via GitHub OAuth using next-auth v5.
- **Server Actions** (e.g., `joinTeam`, `createEvent`) invoke Prisma directly.
- **Client-side UI** renders server-fetched data via Server Components.
- **Real-time Messaging** via polling or Pusher/Socket.io (future enhancement).
- **Match Engine** is triggered on profile change or periodically server-side.

## Technical Stack

- **Frontend**: React 19, Next.js 15, Tailwind CSS, Shadcn UI, react-hook-form, Zod
- **Backend**: Server Actions, Prisma ORM, PostgreSQL (Neon DB)
- **Auth**: next-auth v5 with GitHub OAuth
- **State Management**: Zustand
- **Hosting**: Vercel (Frontend) + Neon (DB)

## Authentication Process

- GitHub OAuth via next-auth v5
- On first login:
  - Import GitHub public data (repos, languages, contribution history)
  - Create user profile in DB
- JWT-based session stored in secure cookies
- Protected server actions use `getServerSession` for access control

## Route Design

- `/` → Landing page with GitHub login CTA
- `/dashboard` → Personalized feed (matches, events, projects)
- `/discover` → Filterable list of Projects | Developers | Events
- `/project/[id]` → Project detail drawer
- `/event/[id]` → Hackathon detail drawer
- `/profile/[username]` → User public profile
- `/inbox` → Messages and team chat
- `/admin` → Project owner and moderator controls

## API Design

All mutations handled via **Server Actions** inside `app/actions/`:

- `createProject(data)`
- `joinTeam(projectId)`
- `sendMessage(toUserId, content)`
- `createEvent(data)`
- `rsvp(eventId)`
- `rateUser(userId, rating)`

All queries handled via **Server Components** or RSC helpers:

- `getMatchingProjects(userId)`
- `getProjectDetail(projectId)`
- `getEvents(filters)`
- `getUserProfile(username)`

## Database Design ERD

### Tables:

- **User**
  - id (PK)
  - githubId
  - username
  - bio
  - avatarUrl

= **CollaborationStyle**

- id (PK)
- techStack
- projectDomains
- availability
- teamSize
- teamRoles
- hoursPerWeek

- **Project**

  - id (PK)
  - ownerId (FK → User)
  - name
  - description
  - tags (JSON)
  - isBeginnerFriendly
  - stars
  - createdAt

- **ProjectMember**

  - id (PK)
  - projectId (FK)
  - userId (FK)
  - role (owner, contributor)
  - joinedAt

- **Event**

  - id (PK)
  - organizerId (FK → User)
  - name
  - description
  - startDate, endDate
  - maxTeamSize
  - isActive

- **EventParticipant**

  - id (PK)
  - userId (FK)
  - eventId (FK)
  - teamId (nullable)

- **Team**

  - id (PK)
  - eventId (FK)
  - name

- **Message**

  - id (PK)
  - senderId (FK)
  - recipientId (nullable)
  - teamId (nullable)
  - content
  - createdAt

- **Notification**
  - id (PK)
  - userId (FK)
  - type (invite, message, rsvpReminder, prComment)
  - data (JSON)
  - read (boolean)
  - createdAt
