# User Interface Design Document

## Layout Structure

- **Primary Layout:**  
  - Split-screen layout with:
    - **Left Sidebar:** Filters and navigation
    - **Main Area:** Card-grid results (projects, developers, events)
  - Responsive breakpoint handling for sidebar collapse on mobile
  - Top navigation bar with global actions and user controls

- **Main Navigation (Top Navbar):**
  - Discover
  - Teams
  - Events
  - Inbox
  - Profile (with avatar dropdown)

- **Secondary Navigation (Sub-tabs or Pills):**
  - Within Discover: Projects | Developers | Hackathons | Matches

- **Detail Panels:**
  - Project, Person, or Event opens in a right-hand side panel (drawer)
  - Includes full details and interactive actions (e.g., Join, Message)

---

## Core Components

- **Filter Sidebar:**
  - Stack: Tech, Language, Interest Tags
  - Experience: Beginner-friendly, Intermediate, Advanced
  - Availability: Weekend-only, Weekly hours, Hackathon-ready
  - Sorting: Trending, Newest, Active, Most Starred

- **Cards (Project / Person / Event):**
  - Compact and scannable
  - Avatar or Logo, Title, Short Description
  - Tags (e.g. React, AI, First Timer Friendly)
  - Quick actions: Join, Save, Message

- **Match Suggestions Tab:**
  - Personalized matches based on GitHub profile and input interests
  - Carousel or vertical list of recommended projects and people

- **Inbox / Messaging:**
  - List of conversations (1:1 and team)
  - Chat window with file upload and markdown support

- **Profile View:**
  - GitHub stats (commits, repos, languages)
  - Contribution history timeline
  - Earned badges and team affiliations

---

## Interaction Patterns

- **Card-Based Discovery:**
  - Hover reveals quick actions
  - Clicking a card opens a right-hand drawer with more info
  - Cards can be bookmarked or shared

- **Drawer Panels:**
  - Used for Project Details, Event Info, Developer Profiles
  - Slide-in from right, scrollable, always closeable

- **Filters & Search:**
  - Debounced live search across tags and titles
  - Filters update results dynamically

- **Real-time Messaging:**
  - Notifications for new messages or invites
  - Team chats shown in overlay drawer

- **Matching Engine Feedback:**
  - Like / Dismiss suggestions to improve match accuracy
  - "Why this match?" hint with shared interests/skills

---

## Visual Design Elements & Color Scheme

- **Theme:** Professional, clean, minimal
- **Color Palette:**
  - Primary: Indigo / Slate / Teal accents
  - Background: White (light mode), Dark Gray (dark mode)
  - Text: Neutral blacks and grays
  - Tags: Color-coded by type (Tech, Interest, Level)

- **Component Style:**
  - Rounded corners (lg or xl)
  - Subtle shadows and border dividers
  - Smooth transitions for modals, panels, hover states

- **Dark/Light Mode Toggle:** Available in navbar

---

## Mobile, Web App, Desktop Considerations

- **Mobile:**
  - Sidebar becomes a filter modal
  - Cards stacked vertically
  - Navbar collapses into hamburger menu
  - Bottom tab bar for quick navigation

- **Web App:**
  - Default experience, responsive at all breakpoints
  - Keyboard navigation for developers (e.g., `j/k` to browse cards)

- **Desktop:**
  - Expanded sidebar
  - Persistent chat panel on wide screens
  - Richer detail drawers (more stats and charts)

---

## Typography

- **Font Family:** Sans-serif (e.g., Inter, Work Sans)
- **Headings:** Bold, large, clear hierarchy (e.g., h1 = 32px, h2 = 24px)
- **Body Text:** Medium weight, readable at 16px base
- **Monospace Elements:** Used for GitHub stats, code snippets, etc.

---

## Accessibility

- **Keyboard Navigation:** All interactive elements focusable
- **Screen Reader Labels:** Provided for buttons, tags, and modals
- **Color Contrast:** Meets WCAG AA for both light and dark themes
- **ARIA Roles:** For drawers, alerts, chat messages, and cards

---
