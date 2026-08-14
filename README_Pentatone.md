# Pentatone Musical Club Management Portal

A full-stack web application for managing **Pentatone Musical Club, Sylhet Engineering College**.

The system provides a public club website, account-based membership workflow, role-based dashboards, event and audition management, announcements, gallery, member-only learning resources, contact messages, admin tools, and secure password recovery.

> **Course Project:** CSE 338 — Web Technologies Sessional  
> **Institution:** Sylhet Engineering College  
> **Repository:** https://github.com/Diganta-13/pentatone-musical-club

---

## Table of Contents

- [Project Overview](#project-overview)
- [Main Features](#main-features)
- [User Roles and Access](#user-roles-and-access)
- [Core Workflows](#core-workflows)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Database Overview](#database-overview)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Creating an Admin Account](#creating-an-admin-account)
- [Password Reset Email Setup](#password-reset-email-setup)
- [Useful Routes](#useful-routes)
- [Security Notes](#security-notes)
- [File Storage](#file-storage)
- [Troubleshooting](#troubleshooting)
- [Team Development Workflow](#team-development-workflow)
- [Production Build Check](#production-build-check)
- [Project Status](#project-status)

---

## Project Overview

The **Pentatone Musical Club Management Portal** is designed to replace scattered/manual club-management tasks with one centralized web platform.

The application supports three account roles:

- `GENERAL_USER`
- `MEMBER`
- `ADMIN`

A newly registered user starts as a `GENERAL_USER`. The user may then submit a membership application with student information and a verification document. After an administrator reviews and approves the request, the account is automatically promoted to `MEMBER`.

Administrators manage the operational content of the club, including membership requests, members, events, auditions, announcements, resources, gallery content, contact messages, and selected account settings.

---

## Main Features

### Public Website

Visitors can:

- View the landing page
- Learn about the club
- Browse published events
- Read announcements
- View audition information
- Browse the gallery
- Use the Contact Us form
- Register an account
- Log in
- Request a password reset

### Authentication

- Email/password registration
- Secure password hashing with bcrypt
- Login/logout
- JWT-based session
- HttpOnly session cookie
- Remember-me option
- Role-based access control
- Forgot Password
- Email-based password reset
- Expiring one-time reset token

### Membership Management

A registered `GENERAL_USER` can:

- Open the user dashboard
- Submit a membership application
- Provide student ID, department, session, current semester, phone number, primary musical skill, and verification proof
- Track membership request status

An `ADMIN` can:

- View membership requests
- Review verification information
- Approve requests
- Reject requests
- Add review notes
- Promote approved users automatically from `GENERAL_USER` to `MEMBER`

### Member Portal

A `MEMBER` can:

- Access the member dashboard
- View profile and membership information
- View upcoming club events
- View announcements
- Access member-only resources
- Download available learning materials through the resource flow
- View audition status

### Events

Public users can:

- View published events
- Open event detail pages
- Follow an external registration URL when provided

Admins can:

- Create events
- Edit events
- Delete events
- Publish/unpublish events
- Mark events as featured
- Manage date, time, venue, description, cover image, type, and external registration URL

### Auditions

Users can:

- View published audition sessions
- Apply to an open audition session
- Submit instrument, experience, video URL, and related details
- View their latest audition status from the dashboard

Admins can:

- Create and manage audition sessions
- View applicants
- Filter applications
- Review applications
- Evaluate applicants using Technical Skill, Rhythm & Timing, Creativity, Stage Presence, and Overall Performance
- Add evaluation notes
- Mark applications as `UNDER_REVIEW`, `APPROVED`, or `REJECTED`

> Audition approval is separate from membership approval. Passing an audition does not automatically create a club member.

### Announcements

Public users can:

- Browse published announcements
- Open announcement details

Admins can:

- Create announcements
- Categorize announcements
- Pin important announcements
- Publish/unpublish announcements
- Manage descriptions, content, venue, and cover image

Announcement categories include:

- Events
- Auditions
- Practice
- General Notice

### Learning Resources

Resources support:

- PDF
- Video
- External Link

Categories include:

- Practice Notes
- Music Theory
- Vocal Training
- Instrument Guides

Levels include:

- Beginner
- Intermediate
- Advanced
- All Levels

Access policy:

- Guest: no access
- `GENERAL_USER`: no access
- `MEMBER`: access
- `ADMIN`: access

The Resources page is role protected. Resource download requests used by the interface also check the authenticated role.

### Gallery

- Public gallery browsing
- Program/event-based gallery organization
- Image/video media support
- Admin gallery management

### Contact Us

Visitors can send full name, email, phone, subject, and message.

Admins can:

- View messages
- See read/unread state
- Mark messages as read/unread
- Delete messages

### Admin Settings

Admin settings currently support:

- Updating administrator full name
- Changing password securely

---

## User Roles and Access

| Feature | Guest | GENERAL_USER | MEMBER | ADMIN |
|---|---:|---:|---:|---:|
| Public website | ✅ | ✅ | ✅ | ✅ |
| Register / Login | ✅ | ✅ | ✅ | ✅ |
| General dashboard | ❌ | ✅ | — | — |
| Membership application | ❌ | ✅ | ❌ | ❌ |
| Member portal | ❌ | ❌ | ✅ | ❌ |
| Member profile | ❌ | ❌ | ✅ | ❌ |
| Events | ✅ | ✅ | ✅ | ✅ |
| Announcements | ✅ | ✅ | ✅ | ✅ |
| Auditions | ✅ view | ✅ apply | ✅ apply/view | ✅ manage |
| Gallery | ✅ | ✅ | ✅ | ✅ |
| Contact Us | ✅ | ✅ | ✅ | ✅ |
| Learning Resources | ❌ | ❌ | ✅ | ✅ |
| Admin dashboard | ❌ | ❌ | ❌ | ✅ |
| Manage members/requests | ❌ | ❌ | ❌ | ✅ |
| Manage events | ❌ | ❌ | ❌ | ✅ |
| Manage auditions | ❌ | ❌ | ❌ | ✅ |
| Manage announcements | ❌ | ❌ | ❌ | ✅ |
| Manage resources | ❌ | ❌ | ❌ | ✅ |
| Manage gallery | ❌ | ❌ | ❌ | ✅ |
| Manage contact messages | ❌ | ❌ | ❌ | ✅ |

---

## Core Workflows

### Registration and Membership

```text
Register
   ↓
GENERAL_USER
   ↓
Login
   ↓
User Dashboard
   ↓
Apply for Membership
   ↓
PENDING
   ↓
Admin Review
   ├── REJECTED
   └── APPROVED
          ↓
        MEMBER
          ↓
     Member Portal
```

### Audition Flow

```text
Admin creates audition session
        ↓
Session is published/open
        ↓
User views Auditions
        ↓
User submits application
        ↓
Admin reviews applicant
        ↓
Admin evaluates performance
        ↓
UNDER_REVIEW / APPROVED / REJECTED
```

### Forgot Password Flow

```text
Login
   ↓
Forgot Password?
   ↓
Enter registered email
   ↓
Secure random reset token generated
   ↓
Only token hash stored in database
   ↓
Reset link sent by email
   ↓
/reset-password?token=...
   ↓
New password + confirmation
   ↓
Token validation + expiry check
   ↓
bcrypt password hash update
   ↓
Reset tokens removed
   ↓
Login with new password
```

Reset links expire after **15 minutes** and are one-time use.

---

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React icons

### Backend

- Next.js App Router
- Next.js Route Handlers / API routes
- Server Components and Client Components
- Zod validation

### Authentication and Security

- `bcryptjs` — password hashing
- `jose` — JWT signing and verification
- HttpOnly authentication cookie
- Role-based authorization
- SHA-256 password-reset token hashing

### Database

- MySQL
- Aiven Cloud MySQL
- `mysql2/promise`
- SSL/TLS connection using Aiven CA certificate
- Shared connection pool

### Email

- Nodemailer
- Gmail SMTP using a Google App Password

---

## Project Structure

```text
pentatone-musical-club/
│
├── certs/
│   └── ca.pem
│
├── database/
│   ├── migrations/
│   │   ├── 001-google-auth.sql
│   │   ├── 002-membership-skill.sql
│   │   ├── 003-gallery.sql
│   │   ├── 004-events.sql
│   │   ├── 005-event-status-override.sql
│   │   ├── 006-auditions.sql
│   │   ├── 007-audition-decimal-scores.sql
│   │   ├── 008-announcements.sql
│   │   ├── 009-resources.sql
│   │   ├── 010-contact-messages.sql
│   │   └── 011-password-reset.sql
│   │
│   ├── init-db.mjs
│   ├── promote-admin.mjs
│   ├── run-migration.mjs
│   ├── run-gallery-migration.mjs
│   ├── run-events-migration.mjs
│   ├── run-event-status-migration.mjs
│   ├── run-auditions-migration.mjs
│   ├── run-audition-decimal-migration.mjs
│   ├── run-announcements-migration.mjs
│   ├── run-resources-migration.mjs
│   ├── run-contact-migration.mjs
│   ├── run-password-reset-migration.mjs
│   ├── schema.sql
│   └── seed.sql
│
├── public/
│   └── uploads/
│
├── storage/
│   └── membership/
│
├── src/
│   ├── app/
│   │   ├── about/
│   │   ├── admin/
│   │   ├── announcements/
│   │   ├── api/
│   │   ├── auditions/
│   │   ├── contact/
│   │   ├── dashboard/
│   │   ├── events/
│   │   ├── forgot-password/
│   │   ├── gallery/
│   │   ├── join-club/
│   │   ├── login/
│   │   ├── register/
│   │   ├── reset-password/
│   │   └── resources/
│   │
│   ├── components/
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── auditions/
│   │   ├── contact/
│   │   ├── events/
│   │   ├── gallery/
│   │   ├── home/
│   │   ├── layout/
│   │   └── member/
│   │
│   └── lib/
│       ├── auth.ts
│       ├── current-user.ts
│       ├── db.ts
│       └── mail.ts
│
├── .env.example
├── .env.local            # local only — never commit
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## Database Overview

Important tables used by the current application include:

- `roles`
- `departments`
- `users`
- `membership_requests`
- `gallery_programs`
- `gallery_media`
- `events`
- `audition_sessions`
- `audition_applications`
- `audition_evaluations`
- `announcements`
- `resources`
- `contact_messages`
- `password_reset_tokens`

Default roles:

```text
GENERAL_USER
MEMBER
ADMIN
```

Default departments seeded by the project:

```text
CSE
EEE
CE
```

---

# Getting Started

## 1. Prerequisites

Install:

- Node.js
- npm
- Git
- Internet connection
- Access to a MySQL database (the project is configured for Aiven Cloud MySQL)

You do **not** need XAMPP when using the shared Aiven database.

---

## 2. Clone the Repository

```bash
git clone https://github.com/Diganta-13/pentatone-musical-club.git
cd pentatone-musical-club
```

---

## 3. Install Dependencies

```bash
npm install
```

Do not copy `node_modules` from another computer.

---

## 4. Create `.env.local`

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
```

### macOS / Linux

```bash
cp .env.example .env.local
```

Then update `.env.local`.

---

## Environment Variables

The complete local configuration used by the current project is:

```env
# DATABASE
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=defaultdb
DB_CA_CERT_PATH=certs/ca.pem

# AUTHENTICATION
AUTH_SECRET=

# PASSWORD RESET EMAIL
MAIL_USER=
MAIL_APP_PASSWORD=
APP_URL=http://localhost:3000
```

### Generate an Authentication Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated value into:

```env
AUTH_SECRET=your_generated_secret
```

Never commit `.env.local` or private credentials.

---

# Database Setup

There are two normal setup scenarios.

## Option A — Existing Team Member / Shared Aiven Database

If the shared Aiven database is already configured and migrated:

1. Clone/pull the latest project.
2. Run `npm install`.
3. Create `.env.local`.
4. Add the shared Aiven credentials.
5. Add `AUTH_SECRET`.
6. Add mail credentials if password-reset email testing is required.
7. Run the project.

**Do not reinitialize the shared database.**

---

## Option B — Fresh Database

If you are creating a completely new database for your own environment:

### Step 1 — Configure database variables

Set the database credentials in `.env.local`.

### Step 2 — Initialize the base schema

```bash
node --env-file=.env.local database/init-db.mjs
```

This creates the base tables and inserts default roles/departments.

### Step 3 — Apply feature migrations

The current base schema already contains the early authentication/membership fields, so for a fresh database based on the current project state, apply the feature migrations with the project runners:

```bash
node --env-file=.env.local database/run-gallery-migration.mjs
node --env-file=.env.local database/run-events-migration.mjs
node --env-file=.env.local database/run-event-status-migration.mjs
node --env-file=.env.local database/run-auditions-migration.mjs
node --env-file=.env.local database/run-audition-decimal-migration.mjs
node --env-file=.env.local database/run-announcements-migration.mjs
node --env-file=.env.local database/run-resources-migration.mjs
node --env-file=.env.local database/run-contact-migration.mjs
node --env-file=.env.local database/run-password-reset-migration.mjs
```

> Run database migrations only against a database you are authorized to modify.

---

# Running the Project

## Development

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Lint

```bash
npm run lint
```

## Production Build Check

```bash
npm run build
```

## Start Production Build

```bash
npm start
```

---

# Creating an Admin Account

There is no public Admin Registration page.

First register a normal user through the website, then run:

```bash
node --env-file=.env.local database/promote-admin.mjs your-email@example.com
```

Only authorized contributors should promote accounts to `ADMIN`.

---

# Password Reset Email Setup

The password-reset system uses Gmail through Nodemailer.

Required variables:

```env
MAIL_USER=your-gmail-address@gmail.com
MAIL_APP_PASSWORD=your_16_character_google_app_password
APP_URL=http://localhost:3000
```

Use a **Google App Password**, not the normal Gmail password.

Typical setup:

1. Enable 2-Step Verification on the sender Google account.
2. Create an App Password.
3. Give it a name such as `Pentatone Website`.
4. Copy the generated 16-character password.
5. Store it in `.env.local`.

If Google displays the App Password in groups such as:

```text
abcd efgh ijkl mnop
```

store it without spaces:

```env
MAIL_APP_PASSWORD=abcdefghijklmnop
```

Never commit this value.

---

# Useful Routes

### Public

```text
/
/about
/events
/announcements
/auditions
/gallery
/contact
/login
/register
/forgot-password
/reset-password
```

### Authenticated User / Member

```text
/dashboard
/dashboard/profile
/resources
```

`/resources` is restricted to `MEMBER` and `ADMIN`.

### Admin

```text
/admin
/admin/members
/admin/requests
/admin/events
/admin/auditions
/admin/announcements
/admin/resources
/admin/messages
/admin/gallery
/admin/settings
```

The exact admin subroutes may expand as the project evolves.

---

# Security Notes

The project currently includes the following security measures:

- Passwords are never stored in plaintext.
- Passwords are hashed with bcrypt.
- Authentication uses signed JWTs.
- Sessions are stored in an HttpOnly cookie.
- Admin routes validate the authenticated role.
- Member-only resources validate user role.
- Membership verification documents are served through admin-authorized logic.
- Password reset tokens are cryptographically random.
- Only a SHA-256 hash of a reset token is stored in the database.
- Reset tokens expire after 15 minutes.
- Reset tokens are deleted after successful password reset.
- Forgot Password does not reveal whether a valid-looking email is registered.
- Input validation is performed with Zod in important API flows.

Never commit secrets or real student verification documents.

---

# File Storage

The project currently uses local file storage for uploaded assets.

### Membership Verification

New membership verification documents are stored outside the public web directory:

```text
storage/membership/
```

These documents should remain private and should never be committed to Git.

Ensure `.gitignore` contains:

```gitignore
/storage/
```

### Other Uploaded Media

Some public site assets/resources are stored under:

```text
public/uploads/
```

For a university/course deployment this local-storage design is sufficient for demonstration. For a larger production deployment, use persistent object storage or another managed file-storage solution.

Because local files are not automatically synchronized between developer computers, a database record created on one machine may reference a local file that does not exist on another machine.

---

# Troubleshooting

## Database connection error

If you see errors such as:

```text
ECONNRESET
```

or another MySQL connection error:

1. Check that the Aiven MySQL service is running.
2. Check your internet connection.
3. Verify `.env.local`.
4. Verify the database host, port, username, password, and database name.
5. Confirm that `certs/ca.pem` exists.
6. Restart the development server:

```bash
npm run dev
```

The application uses a shared MySQL connection pool with a low connection limit to work reliably with the cloud database.

## `Missing required database environment variables`

Check:

```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

Then restart the server.

## `AUTH_SECRET is not configured`

Add:

```env
AUTH_SECRET=your_secret
```

and restart Next.js.

## Password Reset Email Not Sending

Check:

```env
MAIL_USER=
MAIL_APP_PASSWORD=
APP_URL=http://localhost:3000
```

Also verify:

- Google 2-Step Verification is enabled
- The value is a Google App Password
- The App Password is entered without spaces
- Internet access is available

## Reset Link Shows Invalid or Expired

The reset link expires after 15 minutes.

Request a new reset email from:

```text
/forgot-password
```

A previously used token cannot be used again.

## Build Problems

Run:

```bash
npm run build
```

Fix all TypeScript/build errors before submitting or deploying the project.

Do not use `npm audit fix --force` immediately before a presentation or release without reviewing the dependency changes, because forced dependency upgrades may introduce breaking changes.

---

# Team Development Workflow

Before starting:

```bash
git status
git pull origin main
npm install
```

If you have uncommitted work, commit or stash it before pulling.

After making changes:

```bash
npm run build
git status
git add .
git commit -m "describe your changes"
git pull origin main
git push origin main
```

Resolve merge conflicts carefully and test again before pushing.

---

# Important Git Rules

Never push:

```text
.env.local
node_modules/
.next/
storage/
private credentials
database passwords
AUTH_SECRET
MAIL_APP_PASSWORD
student verification documents
```

Before every push:

```bash
git status
```

Review the files being committed.

---

# Production Build Check

Before presentation, deployment, or handoff:

```bash
npm install
npm run build
```

Then run:

```bash
npm run dev
```

Recommended smoke-test flow:

```text
Guest website
   ↓
Register
   ↓
Login
   ↓
GENERAL_USER dashboard
   ↓
Membership application
   ↓
Admin approval
   ↓
MEMBER dashboard
   ↓
Resources
   ↓
Admin modules
   ↓
Forgot Password
   ↓
Email reset
   ↓
Login with new password
```

---

# Project Status

The current project includes the main functionality required for the Pentatone Musical Club Management Portal:

- ✅ Public club website
- ✅ Registration and login
- ✅ Role-based authentication
- ✅ General User dashboard
- ✅ Membership application and verification
- ✅ Membership approval/rejection
- ✅ Automatic member promotion
- ✅ Member dashboard and profile
- ✅ Event management
- ✅ Audition sessions and applications
- ✅ Audition evaluation
- ✅ Announcements
- ✅ Member-only learning resources
- ✅ Gallery
- ✅ Contact Us
- ✅ Admin messages
- ✅ Admin settings
- ✅ Forgot Password
- ✅ Email reset link
- ✅ Secure password reset
- ✅ Production build support

---

## Maintainers / Project Team

**Pentatone Musical Club Management Portal**  
Sylhet Engineering College

Course project contributors include:

- **Trisha Chakroborty**
- **Diganta Halder**

Repository:

```text
https://github.com/Diganta-13/pentatone-musical-club
```

---

## Final Note

This repository is an academic club-management project. Credentials, student verification files, and other private data must be handled responsibly.

For a new developer, the shortest setup path is:

```text
Clone repository
→ npm install
→ create .env.local
→ configure Aiven database + AUTH_SECRET
→ configure Gmail App Password if password reset is needed
→ npm run dev
→ open http://localhost:3000
```
