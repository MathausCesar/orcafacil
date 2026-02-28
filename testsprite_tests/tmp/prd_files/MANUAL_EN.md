# OrçaFácil - Application Manual

> Quote and proposal management system featuring intuitive onboarding, robust client management, and a service catalog.

## 1. Overview
**OrçaFácil** is a modern web application built to streamline the creation, customization, and management of quotes/estimates. The system covers the entire user journey from an introductory onboarding wizard to the final approval of a quote by the client, offering features like flexible payment options, warranties, and a structured service catalog.

## 2. Tech Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4, \`tw-animate-css\`
- **Components:** Shadcn UI (Radix UI)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Forms and Validation:** React Hook Form + Zod
- **PWA:** \`@ducanh2912/next-pwa\`

### Backend & Cloud (BaaS)
- **Platform:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (SSR supported via \`@supabase/ssr\`)
- **Database:** Hosted PostgreSQL on Supabase with Row Level Security (RLS)

### Tooling & Quality
- **Language:** TypeScript
- **Linting:** ESLint
- **Package Manager:** npm/yarn/pnpm

---

## 3. Architecture & Structure

The application follows the component-oriented architecture of the Next.js App Router:
- \`src/app/\`: Application routes grouped into domains (\`(auth)\`, \`(dashboard)\`, \`(onboarding)\`).
- \`src/components/\`: Reusable UI and business components structured by domain (auth, clients, quotes, onboarding, profile, support, ui).
- \`supabase/migrations/\`: SQL migrations for database version control and schema updates.

---

## 4. Main Features

### Authentication and Onboarding
- **Login/Registration:** Secure authentication via Supabase.
- **Onboarding Wizard:** Guided setup for new accounts, automatically seeding database with initial user company details, default services, and templates.

### Quote Management
- **Creation and Editing:** Comprehensive interface for drafting detailed quotes.
- **Payment Options:** Flexible payment methods and installment configurations.
- **Warranty Box:** Warranty declarations for provided services or products.
- **Visual Customization:** Editing quote layouts and custom fields (\`quote_customization_fields\`).
- **Quote Approval:** Streamlined status update workflow upon client approval.
- **Service Catalog:** Structured product/service library with folders (\`catalog_folders\`).

### Client Management
- **Client Profiles:** Registration and management of B2C (individual) and B2B (company) clients.
- **Corporate Fields:** Built-in support for company registration numbers (e.g., CNPJ) and associated business data.

### User Dashboard & Profile
- **Dashboard:** Main business overview (metrics, quick links, global search).
- **Profile:** Manage user and company registration data.
- **Support:** Integrated support ticketing system (\`support_tickets\`).
- **Notifications:** Platform alerts (e.g., quote approvals, new messages).

---

## 5. API and Database

The application's API layer is fully managed by **Supabase**. There is no traditional manually hand-coded REST/GraphQL backend route layer; instead, the frontend directly interacts with the database via the \`Supabase Client\` adhering to Row Level Security (RLS) policies.

### Database Entities (Schema Highlights)
Based on the migration logs in \`supabase/migrations/\`:
- \`profiles\`: User account details and corporate identifiers.
- \`clients\`: Client database matching B2B/B2C data points.
- \`quotes\`: Core table storing the generated estimates.
- \`quote_customization\`: Layout and data field toggle preferences for quotes.
- \`catalog_folders\` & \`templates\`: Structural hierarchy of the service/product library.
- \`support_tickets\`: User support requests tracker.

### Data Flow
1. **Server Actions (Next.js):** Located in \`src/app/actions/\`, these contain the secure server-side business logic and make the mutations via the \`@supabase/ssr\` client.
2. **Client Components:** Implement optimistic UI updates or subscribe to real-time events, querying through localized data fetching hooks or actions.

---

## 6. Development Environment (Quick Start)

### Prerequisites
- Node.js (v20+)
- Pre-configured Supabase project
- Supabase API Keys (URL and Anon Key)

### Running the App
1. Clone this repository.
2. Install the dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Duplicate the environment variables template and add your Supabase credentials:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
4. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open http://localhost:3000 in your browser.
