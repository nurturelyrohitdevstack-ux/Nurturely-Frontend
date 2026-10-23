# Lead Management System (MERN) — Antigravity Build Specification

> **Purpose:** Build a maintainable, responsive Lead Management System using the MERN stack.
>
> **Important:** Treat this document as the project requirements and implementation plan. Do not immediately generate the entire application in one pass. First inspect the existing repository and the UI/reference project supplied by the owner, report your findings, then implement in small, testable phases.

---

## 1. Project Decisions

The form's selected values were not included in the message received by the coding assistant. The following are the visible default choices from the project-planning form. **Confirm these against the owner's actual selections before making architecture decisions.**

- **Purpose:** Business CRM for managing leads for web development and SEO services
- **Users:** Admin and sales team
- **Lead capture for v1:** Manual entry
- **Scope:** Full CRM — dashboard, pipeline, activities, follow-ups, and team roles
- **Email delivery:** Backend hosted on Render; send emails through an SMTP-compatible email provider using environment variables. Render hosts the application but is not itself the email-delivery provider.
- **Frontend/UI reference:** The owner will provide an existing project/reference. Inspect it and follow its visual language and relevant conventions.

If the owner confirms different choices, update the plan and implementation accordingly. Do not assume the defaults are final without checking.

## 2. Mandatory First Step: Inspect Before Coding

Before editing or creating files:

1. Inspect the repository root, `package.json` files, scripts, installed dependencies, current routes, environment examples, and existing application structure.
2. Identify whether the repository already contains a frontend, backend, or both. Preserve working code and conventions where reasonable.
3. Inspect the reference project and any screenshots, design files, source code, or repository the owner provides.
4. Document:
   - Existing framework and libraries
   - Current folder structure
   - Current design system: colors, typography, spacing, radii, shadows, icons, components, navigation, table patterns, forms, and responsive behavior
   - Existing reusable components and patterns
   - Any risks or conflicts with the requirements in this README
5. Propose a concise implementation plan and list the files you intend to create or modify.
6. **Wait for the owner to provide the reference project if it has not been supplied yet.** Do not invent a generic UI and claim it matches the reference.
7. Do not delete, rename, or rewrite existing files unnecessarily. Do not replace project configuration without explaining why.
8. Never expose `.env` values, credentials, tokens, or private user data in logs, screenshots, generated documentation, or frontend code.

### Reference design is a requirement

The UI must be similar to the project the owner supplies. Use the reference as the source of truth for the visual direction. Reuse its patterns where suitable, but do not blindly copy unrelated features or introduce inconsistent design systems.

The finished UI must be responsive, accessible, and usable on mobile, tablet, and desktop. Avoid placeholder buttons and nonfunctional controls.

---

## 3. Product Overview

The application helps a small business manage prospective customers from initial contact to a successful or lost deal.

Core workflow:

1. A team member creates a lead.
2. The lead is assigned to a responsible user.
3. The team records calls, notes, emails, meetings, and status changes.
4. A follow-up task is scheduled.
5. The user receives an in-app reminder and, where configured, an email reminder.
6. The lead progresses through the sales pipeline.
7. The lead is marked **Won** or **Lost**, with an optional/required loss reason as appropriate.
8. Dashboard reports summarize the pipeline and conversion outcomes.

### User roles

Use role-based access control on the **backend**, not just by hiding frontend controls.

- **Admin**
  - Access all leads in the business workspace
  - Create, update, view, and delete leads
  - Manage team members and assignments
  - View workspace-wide dashboard and reports
  - Manage allowed CRM configuration
- **Sales representative**
  - View leads assigned to them, plus leads they created if the product rules allow it
  - Create leads
  - Update permitted lead fields
  - Add activities and notes
  - Create and manage permitted follow-up tasks
  - Move leads through allowed pipeline stages
  - View their own performance metrics

Define permissions centrally and test them. Every endpoint that reads or changes a lead, activity, task, user, or report must enforce authorization. Do not trust an `assignedTo`, `userId`, or role value supplied by the client.

### Workspace boundary

For the initial small-business version, the app may use one workspace with Admin and Sales roles. Keep the code organized so multi-tenant support can be added later, but **do not build billing or multi-tenant SaaS complexity unless the owner confirms that requirement**.

If multiple organizations are included now or later, every organization-owned record must include an `organizationId` and every query must enforce it. Never rely on role checks alone for tenant isolation.

---

## 4. Functional Requirements

### 4.1 Authentication and account management

- Login and logout
- Secure password hashing with `bcrypt` or `bcryptjs`
- JWT authentication using secure, HTTP-only cookies
- Prefer short-lived access tokens and a carefully implemented refresh strategy if refresh tokens are required
- Validate credentials and request bodies on the server
- Protect private frontend routes and backend endpoints
- Admin-controlled team member creation/invitation or registration, based on the existing project conventions
- Forgot-password and reset-password flow using a one-time, expiring token
- Store only the hash of the password-reset token in MongoDB
- Never disclose whether an email address exists in the password-reset response
- Rate-limit login and password-reset endpoints
- Secure cookie configuration must account for production HTTPS and frontend/backend origins
- Do not store authentication tokens in `localStorage`
- Do not return password hashes, reset-token hashes, or refresh-token secrets from APIs

### 4.2 Lead management

Lead fields should include, at minimum:

- Full name (required)
- Email
- Phone
- Company/business name
- Job title, if relevant
- Lead source: Website, Referral, WhatsApp, Social Media, Cold Outreach, Other
- Status/stage: New, Contacted, Qualified, Proposal, Won, Lost
- Estimated deal value and currency
- Assigned sales representative
- Priority: Low, Medium, High
- Requirements/description
- Tags
- Created by
- Created and updated timestamps
- Last-contacted date, if applicable
- Next-follow-up date, if applicable
- Lost reason when status is Lost, where required by product rules

Features:

- Create, view, edit, and delete leads with clear confirmation for destructive actions
- Lead details page or side panel
- Search by name, email, phone, company, and other relevant fields
- Filter by stage, source, priority, assignee, date range, and follow-up status
- Sort by created date, updated date, deal value, and next follow-up
- Server-side pagination
- Empty, loading, error, and success states
- Duplicate detection, at minimum by normalized email and/or phone when supplied
- Prevent unauthorized users from viewing or modifying other users' leads
- Use soft deletion only if it fits the project and is implemented consistently; otherwise use a protected delete workflow
- Keep API validation and UI validation aligned

### 4.3 Sales pipeline

- Kanban board with columns for lead stages
- Lead cards display useful summary information, such as name, company, deal value, assignee, and next follow-up
- Drag-and-drop stage changes if compatible with the reference UI
- Also provide an accessible alternative to drag-and-drop, such as a stage selector
- Persist stage changes through the API
- Enforce valid stage transitions and permissions on the server
- Record stage changes in the activity history
- Show Won and Lost leads clearly
- Capture a lost reason where required
- Use optimistic UI updates only with rollback/error handling

### 4.4 Activities and lead history

Track meaningful interactions against a lead:

- Note
- Call
- Email
- Meeting
- Status change
- Assignment change
- Other supported interaction

Each activity should record its lead, creator, type, text/summary, and timestamp. Where useful, include metadata such as previous and new status. Show activities in chronological order in the lead details view.

Notes and activity records must follow the same access-control rules as their parent lead. Do not allow an activity to be attached to a lead the user cannot access.

### 4.5 Follow-up tasks and reminders

Task fields:

- Title
- Lead reference
- Assigned user
- Due date/time
- Type: Call, Email, Meeting, Other
- Notes
- Status: Pending, Completed, Cancelled
- Created by
- Created/updated timestamps
- Completion timestamp, where applicable

Features:

- Create, edit, complete, and cancel tasks
- Views for Today, Upcoming, Overdue, and Completed
- Filter by assignee, status, and due date
- Display the related lead and a shortcut to its details
- In-app reminders or dashboard indicators for tasks due soon and overdue
- Email reminders only when configured
- Prevent duplicate email reminders for the same task/reminder window
- Handle time zones consistently and store dates as UTC in the database
- Do not rely on a browser tab being open to send reminders

For scheduled email reminders, use a reliable scheduler/worker approach compatible with the deployment setup. If the web service can sleep or restart, do not assume an in-process `setInterval` is reliable. Use an external scheduler/cron service or a separately deployed worker where appropriate. Make the reminder process idempotent and record delivery attempts/results.

### 4.6 Dashboard and reporting

Dashboard cards:

- Total leads
- New leads in the selected period
- Leads by stage
- Won and lost leads
- Total value of open opportunities
- Won deal value for the selected period
- Follow-ups due today
- Overdue tasks
- Conversion rate, with the formula clearly defined

Charts/reports:

- Leads by stage
- Leads by source
- Lead creation trend over time
- Won/lost outcomes over time, if sufficient data exists
- Optional per-representative performance for Admins

Requirements:

- Use MongoDB aggregation pipelines or appropriate indexed queries for server-side calculations
- Apply date filters consistently
- Scope all figures to the current user's permitted records
- Do not calculate business-critical totals only from the currently visible page of a paginated list
- Handle zero-data and zero-denominator cases safely
- Clearly label currencies, date ranges, and metric definitions

### 4.7 Team management

Admin capabilities:

- List team members
- Create/invite a member or enable accounts using the existing authentication design
- Change permitted role/active status
- Assign leads and tasks
- View basic member-level workload/performance
- Prevent an Admin from accidentally removing the last active Admin, if the product supports multiple Admins

Do not allow public registration to create an Admin account. Seed the first Admin using a documented, secure setup procedure or an explicit invitation flow. Never hardcode production credentials.

### 4.8 UI quality

- Follow the supplied reference project's visual language
- Responsive navigation and layouts
- Accessible labels, focus states, keyboard navigation, and contrast
- Consistent spacing, typography, colors, borders, and component behavior
- Clear loading, empty, error, and success states
- Confirmation before destructive actions
- Toasts or inline feedback consistent with the reference
- Useful form validation messages
- Tables that work on small screens, with an appropriate responsive alternative where needed
- Avoid excessive animation and unnecessary dependencies
- Use the icon library already present in the reference project; do not add a second icon library without a reason
- Avoid hardcoded sample metrics in the live dashboard
- Remove debug logs and placeholder links before completion

---

## 5. Suggested Data Model

Adapt the field names to the existing repository conventions. Use Mongoose schemas, indexes, timestamps, and appropriate validation.

### User

- `fullName`
- `email` (normalized and unique)
- `passwordHash`
- `role`: `admin` or `sales`
- `isActive`
- Password-reset token hash and expiry fields, if needed
- Refresh-token/session fields only if required by the chosen authentication design
- `createdAt`, `updatedAt`

Never expose secret fields in API responses. Use explicit response serializers or safe field selection.

### Lead

- `fullName`
- `email` (normalized when supplied)
- `phone` (normalized when possible)
- `company`
- `jobTitle`
- `source`
- `status`
- `priority`
- `estimatedValue`
- `currency`
- `assignedTo` → User reference
- `createdBy` → User reference
- `requirements`
- `tags`
- `lastContactedAt`
- `nextFollowUpAt`
- `lostReason`
- `createdAt`, `updatedAt`

Add indexes based on actual query patterns, such as status, assignee, creation date, next follow-up, and relevant search fields. Do not add indexes blindly. Ensure duplicate handling is compatible with optional email/phone fields and normalized data.

### Activity

- `lead` → Lead reference
- `createdBy` → User reference
- `type`
- `summary`
- `details`, if needed
- `metadata`, for structured status/assignment changes
- `createdAt`, `updatedAt`

Use a separate collection so activity history can grow without making the Lead document unbounded.

### Task

- `title`
- `lead` → Lead reference
- `assignedTo` → User reference
- `createdBy` → User reference
- `type`
- `notes`
- `dueAt`
- `status`
- `completedAt`
- Reminder tracking fields, such as last attempted/sent time and delivery status
- `createdAt`, `updatedAt`

Use indexes that support queries for pending tasks by due date and assignee. Define a safe strategy for retrying failed email reminders without sending duplicates.

### Optional future models

Do not add these unless needed for the confirmed scope:

- `Organization` for multi-tenant SaaS
- `EmailLog` for detailed outbound-email auditing
- `AuditLog` for sensitive admin actions
- `LeadSource` or configurable pipeline stages
- Billing/subscription models

---

## 6. API Design

Use a consistent `/api` prefix, a centralized error format, and appropriate HTTP status codes. Confirm naming conventions against the existing project.

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- Refresh endpoint only if the selected session design requires it

### Leads

- `POST /api/leads`
- `GET /api/leads`
- `GET /api/leads/:leadId`
- `PATCH /api/leads/:leadId`
- `PATCH /api/leads/:leadId/status`
- `PATCH /api/leads/:leadId/assign`
- `DELETE /api/leads/:leadId`

List endpoint should support validated query parameters, for example:

`GET /api/leads?page=1&limit=20&search=acme&status=Qualified&source=Referral&assignedTo=USER_ID&sortBy=createdAt&order=desc`

Use a sensible maximum page size. Validate allowed sort fields to prevent unsafe dynamic query construction. Return pagination metadata such as total count, current page, page size, and total pages.

### Activities

- `POST /api/leads/:leadId/activities`
- `GET /api/leads/:leadId/activities`

Add edit/delete activity endpoints only if the product rules require them. Protect audit-relevant events from inappropriate alteration.

### Tasks

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId/complete`
- `PATCH /api/tasks/:taskId/cancel`

Support validated filters for due date, task status, assignee, and lead.

### Dashboard and team

- `GET /api/dashboard/summary`
- `GET /api/dashboard/leads-by-status`
- `GET /api/dashboard/leads-by-source`
- `GET /api/dashboard/trends`
- `GET /api/team`
- `POST /api/team` or an invitation endpoint
- `PATCH /api/team/:userId`
- `PATCH /api/team/:userId/status`

Dashboard/report endpoints must enforce permissions and scope data correctly. Avoid returning unrestricted user records or sensitive fields.

---

## 7. Frontend Architecture

First inspect the supplied project and preserve its existing conventions. If starting from scratch, use a feature-based structure similar to this:

```text
client/
  src/
    app/
      App.jsx
      router.jsx
      providers.jsx
    assets/
    components/
      ui/
      layout/
      feedback/
    features/
      auth/
        api/
        components/
        hooks/
        pages/
        schemas/
      dashboard/
        api/
        components/
        hooks/
        pages/
      leads/
        api/
        components/
        hooks/
        pages/
        schemas/
      pipeline/
        components/
        pages/
      activities/
        api/
        components/
        hooks/
      tasks/
        api/
        components/
        hooks/
        pages/
      team/
        api/
        components/
        hooks/
        pages/
    lib/
      apiClient.js
      queryClient.js
    utils/
    styles/
    main.jsx
```

Suggested frontend practices:

- React Router for navigation
- TanStack Query for server state and cache management
- React state/Context for local UI state and shared client state only when justified
- A shared API client with a configured base URL and `withCredentials: true` for cookie-based auth
- Centralized API error handling
- Reusable forms, fields, dialogs, tables, badges, pagination, and feedback components
- Feature-specific hooks and API modules
- Form validation aligned with server validation
- Query invalidation after mutations; use optimistic updates only where useful and handle rollback
- Avoid duplicating server data in global Context
- Keep page components focused on composition, not all business logic
- Use clear query keys and predictable cache invalidation
- Avoid adding Redux unless there is a demonstrated requirement

---

## 8. Backend Architecture

If the repository is new, a suggested feature-based structure is:

```text
server/
  src/
    config/
      db.js
      env.js
      mailer.js
    middleware/
      protect.js
      authorize.js
      validate.js
      notFound.js
      errorHandler.js
      rateLimiters.js
    features/
      auth/
        auth.routes.js
        auth.controller.js
        auth.service.js
        auth.validation.js
      users/
      leads/
      activities/
      tasks/
      dashboard/
      team/
    jobs/
      taskReminder.job.js
    utils/
      AppError.js
      asyncHandler.js
      token.js
      emailTemplates/
    app.js
    server.js
  tests/
  .env.example
  package.json
```

Use thin controllers, service functions for business rules, centralized error handling, request validation, and explicit authorization. Follow the repository's established module format (CommonJS or ES modules) rather than mixing them arbitrarily.

Do not introduce a complex abstraction for every small operation. Keep the code understandable and consistent.

---

## 9. Email Delivery on Render

### Important distinction

Render hosts and runs the backend. Email is delivered through a separate SMTP-compatible provider or email service. Choose a provider that supports the owner's sender domain/account and verify its current free-tier limits, sender verification requirements, and production restrictions before relying on it.

### Configuration

Create environment variables on Render's backend service, not in frontend build variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=
CLIENT_URL=
SERVER_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

These are examples. Use only variables required by the selected implementation. If the provider requires port 465, configure `SMTP_SECURE=true`; for STARTTLS on port 587, the common setup is `SMTP_SECURE=false` with TLS upgraded by the mail library. Follow the provider's current SMTP instructions.

Also create a local `.env` file for development and ensure `.env` is ignored by Git. Commit only `.env.example` with blank values. Never put SMTP credentials, JWT secrets, or database credentials in React/Vite environment variables or expose them through API responses.

### Email implementation requirements

- Use Nodemailer or a compatible mail library on the server.
- Create a centralized mailer module and reusable, escaped email templates.
- Support password-reset emails and follow-up reminder emails.
- Use a verified sender address/domain as required by the provider.
- Set sensible connection and send timeouts.
- Log success/failure metadata without logging credentials, reset tokens, or unnecessary personal data.
- Do not report an email as sent if the provider rejects it.
- Track reminder attempts/results so scheduled jobs can retry safely.
- Make scheduled jobs idempotent to avoid duplicate reminders.
- Test in development using the provider's test/sandbox mode if available.
- Confirm deployment logs and actual inbox delivery after configuring Render.

### Scheduled reminder deployment

Do not rely on a timer running inside a web process as the only reminder mechanism. For production, choose one of these after confirming budget and hosting constraints:

1. A Render Cron Job that runs a reminder script at an interval and exits.
2. A separate always-on worker that processes due reminders.
3. A trusted external scheduler that invokes a secured backend job endpoint.

Protect any job endpoint with a strong secret or use an execution model that does not expose a public unauthenticated trigger. Handle time zones, retries, and duplicate sends.

---

## 10. Environment Variables and Deployment

### Local development

- Frontend and backend should have separate environment files.
- Include `.env.example` in each app.
- Never commit actual `.env` files.
- Configure CORS to allow only the intended frontend origins.
- Configure cookies for the actual local and production origin setup.
- Validate required environment variables on startup and fail with a clear message if a required value is missing.

### Production

- Frontend: Vercel or the owner's chosen static frontend host
- Backend: Render Web Service
- Database: MongoDB Atlas
- Email: SMTP-compatible provider configured through Render environment variables
- Scheduled reminders: Render Cron Job, a worker, or another reliable scheduler

Deployment checklist:

- Set production environment variables in the correct Render service
- Set the correct MongoDB Atlas network access and database user permissions
- Set frontend origin in backend CORS configuration
- Use HTTPS in production
- Configure cookie `secure`, `sameSite`, and domain behavior for the actual deployment topology
- Verify login, logout, session restoration, and password reset
- Verify lead access restrictions for each role
- Verify email delivery and scheduled reminder execution
- Review service logs without exposing secrets
- Configure a health endpoint if useful
- Do not rely on local filesystem storage for persistent business data
- Confirm the selected hosting plan's sleep/availability behavior before choosing a worker strategy

---

## 11. Security and Reliability

Minimum requirements:

- Password hashing
- Secure, HTTP-only cookies
- Appropriate CSRF protection for cookie-authenticated state-changing requests, depending on the cookie/CORS architecture
- CORS allowlist
- Rate limiting for authentication and sensitive endpoints
- Server-side schema validation
- Output serialization that excludes secrets
- Centralized error handling
- Authorization checks for every record-level operation
- Safe MongoDB query construction; never pass untrusted query objects directly into database operations
- Pagination limits and validated sorting
- Protection against mass assignment by allowlisting editable fields
- Safe handling of user-generated text in UI and email templates
- Audit trail for important stage and assignment changes
- Backups and database access restrictions appropriate to the deployment
- No secrets committed to Git
- No sensitive information in client-side logs
- Meaningful handling of email provider failures
- Duplicate-safe scheduled reminder processing

Do not claim the app is production-ready until the security and acceptance checks have actually been completed.

---

## 12. Testing Requirements

Add tests appropriate to the existing stack.

At minimum test:

- Authentication succeeds and fails correctly
- Inactive users cannot access protected resources
- Admin-only routes reject Sales users
- Sales users cannot access unauthorized leads
- A user cannot change another user's lead/task by guessing an ID
- Invalid lead data is rejected
- Duplicate lead behavior is consistent
- Search, filters, sorting, and pagination work together
- Stage changes are persisted and recorded
- Activities cannot be attached to inaccessible leads
- Tasks move correctly between Pending, Completed, and Cancelled
- Overdue and due-today task calculations use the correct time boundaries
- Reminder jobs do not send duplicate emails
- SMTP failures are handled without falsely reporting success
- Dashboard metrics respect permissions and date filters
- Frontend handles loading, empty, validation, and server-error states

Use seeded development data only for local testing. Do not populate production with fake customer records.

---

## 13. Acceptance Checklist

The project is complete only when the relevant items below work end-to-end.

### Repository and UI

- [ ] Existing project and reference UI inspected before coding
- [ ] Folder structure and dependencies documented
- [ ] Existing code preserved where reasonable
- [ ] Visual style matches the supplied reference
- [ ] Mobile, tablet, and desktop layouts checked
- [ ] No placeholder controls or dead links

### Authentication and permissions

- [ ] Login/logout/session restoration work
- [ ] Password reset works using email delivery
- [ ] Admin and Sales permissions are enforced on the backend
- [ ] Unauthorized record access is blocked
- [ ] Secrets are never returned to the frontend

### Leads and pipeline

- [ ] Create, view, edit, and delete flows work
- [ ] Search, filters, sorting, and pagination work
- [ ] Duplicate handling works
- [ ] Stage transitions persist and appear in history
- [ ] Lead assignments obey permissions

### Activities and tasks

- [ ] Activities appear in the correct lead timeline
- [ ] Tasks can be created, edited, completed, and cancelled
- [ ] Today, Upcoming, and Overdue views are correct
- [ ] Reminder delivery is configured, logged, and duplicate-safe

### Dashboard and team

- [ ] Dashboard numbers are computed from real permitted data
- [ ] Charts and date filters work
- [ ] Team management is restricted to Admins
- [ ] Empty and error states are usable

### Deployment and quality

- [ ] Local setup documented
- [ ] `.env.example` included and `.env` ignored
- [ ] Frontend and backend deploy successfully
- [ ] MongoDB Atlas connection works in production
- [ ] SMTP delivery tested in the deployed environment
- [ ] Scheduled reminder mechanism tested
- [ ] Relevant tests pass
- [ ] No secrets, debug code, or known critical authorization bugs remain

---

## 14. Required Documentation

Create or update:

- `README.md` — setup, architecture, scripts, environment variables, deployment
- `.env.example` — blank placeholder values only
- API documentation — endpoints, authentication, validation, sample safe responses
- Database notes — schemas, indexes, and relationship explanation
- Deployment notes — Render, frontend host, MongoDB Atlas, SMTP provider, and scheduler configuration
- Seed instructions — how to create the initial Admin safely

Never write real secrets into documentation.

---

## 15. Antigravity Execution Instructions

Implement the application incrementally:

**Phase 0 — Inspect and plan**
- Inspect the current repository and reference project.
- Confirm the owner's actual selected project options.
- Return the current folder structure, reference UI findings, gaps, and proposed files.
- Do not start destructive changes.

**Phase 1 — Foundation**
- Configure app entry points, database connection, environment validation, error handling, and authentication.

**Phase 2 — Leads**
- Implement the Lead model, validation, services, API, and UI.
- Test role and record-level access.

**Phase 3 — Pipeline and activities**
- Implement status changes, activity history, and assignment tracking.

**Phase 4 — Tasks and email**
- Implement follow-up tasks, SMTP configuration, reminder scheduling, delivery tracking, and duplicate prevention.

**Phase 5 — Dashboard and team**
- Implement aggregation-backed metrics, charts, and Admin team tools.

**Phase 6 — Hardening and deployment**
- Run tests, inspect responsive layouts, review permissions, deploy, and verify actual email delivery.

After each phase:
1. Summarize files changed.
2. Explain important implementation decisions.
3. Report tests run and their actual results.
4. List missing environment variables or manual setup steps.
5. Identify unresolved issues before continuing.

Do not claim a feature works unless it has been implemented and verified. Do not silently skip a requirement; explain any limitation and propose the smallest appropriate solution.

---

## 16. Final Product Goal

Deliver a clean, maintainable MERN CRM that follows the supplied reference project's UI and code conventions, helps a small business manage its sales pipeline, records customer interactions, schedules follow-ups, sends configured emails through SMTP from the deployed backend, and enforces secure role-based access.

**Start by inspecting the repository and waiting for/inspecting the owner's reference project. Confirm the actual project choices before implementing.**
