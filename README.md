# IPEIN Student Voice

A bilingual (French/English) suggestion platform for IPEIN students, built with React, Vite and Supabase.

## Included
- Student suggestion form with anonymous or named submissions
- French / English interface
- Categories: academics, campus/facilities, events, sports, administration, other
- Private delegate login and dashboard
- Filter submissions, update status, add private admin notes, delete submissions
- QR code that points to the deployed website and can be downloaded as SVG
- Row Level Security: visitors can submit but cannot read submissions; only the configured delegate email can access the dashboard

## 1. Create the database
1. Create a project at https://supabase.com.
2. Open **SQL Editor** in your Supabase project.
3. Open `supabase/schema.sql`.
4. Replace every occurrence of `DELEGATE_EMAIL` with the exact email address you will use as delegate.
5. Run the SQL script.

## 2. Create the delegate login
1. In Supabase, open **Authentication → Users**.
2. Add a user with the same delegate email.
3. Set a strong password and keep it private.
4. Disable public sign-ups in **Authentication → Settings** if the setting is available. The delegate user should be created by the project owner, not by students.

## 3. Configure the website
1. Copy `.env.example` to `.env`.
2. In Supabase, open **Project Settings → API**.
3. Copy the Project URL into `VITE_SUPABASE_URL`.
4. Copy the publishable/anon key into `VITE_SUPABASE_ANON_KEY`. Never use a `service_role` or secret key in this frontend.
5. Optional: set `VITE_PUBLIC_SITE_URL` to your final deployed website address.

## 4. Run locally
Install Node.js (LTS), then in this folder run:

```bash
npm install
npm run dev
```

Open the local address printed by Vite. The website will work locally once the Supabase environment variables are configured.

## 5. Deploy (free tiers may be available)
Recommended: https://vercel.com or https://netlify.com.
- Import this project from a GitHub repository, or upload/deploy it using the provider's supported workflow.
- Add the same three environment variables in the hosting dashboard.
- Build command: `npm run build`
- Output directory: `dist`
- Deploy.
- Add your deployed domain to Supabase Authentication → URL Configuration if prompted.

## 6. Generate your QR code
After deployment, open the website and go to **Delegate dashboard → QR code**. The code points to the live website address. Download the SVG and print it for classroom doors, noticeboards or student groups.

## Privacy and safety notes
- Anonymous submissions store no student name or class.
- Named submissions store only the name and class the student chooses to provide.
- The delegate dashboard is protected by Supabase Auth and database Row Level Security.
- Do not share your delegate password or Supabase secret/service-role key.
- Tell students what information is collected and how suggestions will be used. Avoid promising absolute anonymity if your institution's hosting/network logs may retain technical metadata.
- This project does not send email notifications by default. Check the dashboard to review new submissions.
