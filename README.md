Pentatone Musical Club

Web application for Pentatone Musical Club, Sylhet Engineering College.

This project is built with Next.js, React, TypeScript, Tailwind CSS, MySQL, Aiven Cloud MySQL, bcryptjs, jose, and Zod.

Important Note for Existing Teammates

If you worked on this project before the database/authentication work was added, you do not need to create a new project or set up a local MySQL database.

The project now uses a shared Aiven Cloud MySQL database.

Before continuing development, update your existing local copy using the steps below.

1. Save Your Current Work First

If you have any uncommitted local changes, do not pull immediately.

Check your current status:

git status

If you have important local work, either commit it:

git add .
git commit -m "save local work before syncing"

or temporarily stash it:

git stash

2. Pull the Latest Project Code

From the existing project folder:

git pull origin main

If you used git stash earlier, restore your work after the pull:

git stash pop

Resolve any merge conflicts carefully before continuing.

3. Install the New Dependencies

Database and authentication features added new packages, so run:

npm install

Do not copy node_modules from another computer.

The correct dependencies are installed automatically from package.json.

4. Create Your Local Environment File

Environment secrets are not stored in GitHub.

The repository contains:

.env.example

Create a new file in the project root named:

.env.local

Windows PowerShell

Copy-Item .env.example .env.local

macOS / Linux

cp .env.example .env.local

Your .env.local should contain:

DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=defaultdb
DB_CA_CERT_PATH=certs/ca.pem
AUTH_SECRET=

Ask the project maintainer for the shared development database credentials.

Never commit .env.local or private credentials to GitHub.

5. Aiven Database

The project uses a shared Aiven Cloud MySQL database.

You do not need to:

install XAMPP for this project

create another local MySQL database

recreate existing users, roles, membership requests, or shared development data

The application connects directly to the shared Aiven database using .env.local.

Important

The Aiven Free service may power off after inactivity.

If the application suddenly shows a database connection error, first check whether the Aiven MySQL service is running.

6. SSL Certificate

The required Aiven CA certificate is already included in:

certs/ca.pem

Keep this in .env.local:

DB_CA_CERT_PATH=certs/ca.pem

No additional SSL certificate setup should normally be required.

7. Authentication Secret

The project uses JWT-based authentication with an HttpOnly cookie.

Set:

AUTH_SECRET=

in .env.local.

Use the shared development secret provided by the project maintainer, or another strong development secret if instructed by the team.

Never commit AUTH_SECRET.

8. Start the Development Server

Run:

npm run dev

Then open:

http://localhost:3000

9. Test the Database Connection

After the server starts, open:

http://localhost:3000/api/db-test

If the connection fails, check:

Aiven service is running

.env.local exists

DB credentials are correct

DB_CA_CERT_PATH=certs/ca.pem

internet connection is available

10. Current Account and Membership Flow

The project currently uses:

GENERAL_USER
MEMBER
ADMIN

Main flow:

Register
→ GENERAL_USER
→ Login
→ Dashboard
→ Apply for Membership
→ PENDING
→ Admin Review
→ APPROVED
→ MEMBER

There is no public Admin Registration page.

11. Creating an Admin Account for Development

First create the account normally through the website.

Then promote it:

node --env-file=.env.local database/promote-admin.mjs your-email@example.com

Only authorized contributors should promote accounts to Admin.

12. Membership Verification Uploads

Membership verification files are currently stored locally under:

public/uploads/membership/

These files are ignored by Git.

That means:

database records are shared through Aiven

local uploaded proof files are not shared through GitHub

a proof uploaded on one developer computer may not exist on another

Do not commit student verification documents.

13. Files Not Shared Through GitHub

These should remain local:

.env.local
node_modules/
.next/
public/uploads/membership/*

The repository already contains:

certs/ca.pem

14. Normal Team Workflow

Before starting work:

git pull origin main

After finishing and testing:

git status
git add .
git commit -m "describe your changes"
git pull origin main
git push origin main

Resolve merge conflicts carefully and test again before pushing.

15. Useful Commands

Development:

npm run dev

Lint:

npm run lint

Production build test:

npm run build

Production start:

npm start

16. Security Rules

Never commit or push:

.env.local

database passwords

AUTH_SECRET

private credentials

student verification documents

temporary secret files

If a secret is accidentally pushed, inform the team and rotate it.

17. Current Development Status

Core features currently include:

User registration

Password hashing

Login

JWT HttpOnly session

Logout

General User role

Membership application

Student verification proof upload

Pending membership state

Admin authentication

Admin dashboard

Membership request review

Membership approval

Membership rejection

Automatic GENERAL_USER → MEMBER role update

Member dashboard

Additional Admin modules are being implemented progressively.

Repository

https://github.com/Diganta-13/pentatone-musical-club

Existing Teammate Quick Setup

If you already had an older copy of the project:

Save current work
→ git pull origin main
→ npm install
→ create .env.local
→ add shared Aiven credentials
→ add AUTH_SECRET
→ npm run dev
→ test /api/db-test
→ continue development