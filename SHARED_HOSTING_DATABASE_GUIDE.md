# Genomed Pharmaceuticals — Shared Hosting Database & Deployment Guide
**Document Type:** Technical Setup & Hosting Runbook  
**Target Environments:** cPanel, Hostinger hPanel, Plesk, DirectAdmin  
**Database Engine:** MySQL 8.0+ / MariaDB 10.4+ with phpMyAdmin

---

## Overview

If you are using shared web hosting that includes a MySQL database (e.g., Hostinger Business/Cloud, cPanel hosting, GoDaddy, Bluehost, Namecheap), follow this guide to create the database, import the tables, seed initial inventory, and configure the application.

---

## Step 1: Create the MySQL Database & User in Shared Hosting

In shared hosting environments, database and user names are automatically assigned a prefix tied to your account username (e.g., `u123456789_` or `cpaneluser_`).

### In cPanel:
1. Log in to your cPanel dashboard.
2. Locate the **Databases** section and click **MySQL Databases** (or **MySQL Database Wizard**).
3. **Create New Database:**
   - Enter database name: `genomed`
   - Full Database Name will be: `yourprefix_genomed` *(Save this)*
4. **Create MySQL User:**
   - Under *MySQL Users → Add New User*:
   - Username: `dbadmin` (Full name: `yourprefix_dbadmin`)
   - Password: Click *Password Generator* or set a strong password *(Save this)*
5. **Add User To Database:**
   - Under *Add User to Database*, select:
     - User: `yourprefix_dbadmin`
     - Database: `yourprefix_genomed`
   - Click **Add**.
   - On the privileges screen, check **ALL PRIVILEGES**.
   - Click **Make Changes**.

### In Hostinger (hPanel):
1. Log in to your Hostinger dashboard.
2. Navigate to **Websites** → **Manage** → **Databases** → **Management**.
3. Under **Create a New MySQL Database and Database User**:
   - MySQL Database name: `genomed` (e.g. `u123456789_genomed`)
   - MySQL Username: `dbadmin` (e.g. `u123456789_dbadmin`)
   - Password: Enter your password.
4. Click **Create**. Hostinger automatically attaches the user with full permissions.

---

## Step 2: Import Database Schema via phpMyAdmin

1. In your hosting control panel, open **phpMyAdmin**.
2. From the left sidebar, click on your newly created database (`yourprefix_genomed`).
3. Click on the **Import** tab at the top.
4. Click **Choose File** and select the schema file located in this repository:
   - Path: `db/schema.sql`
5. Keep default settings (`utf-8`, SQL format) and click **Import** (or **Go**).
6. Verify that all **7 tables** are created:
   - `customers`
   - `addresses`
   - `orders`
   - `order_items`
   - `stock`
   - `users`
   - `otp_codes`

*(Alternative: You can open `db/schema.sql` in any text editor, copy all SQL lines, open phpMyAdmin's **SQL** tab, paste the code, and click **Go**).*

---

## Step 3: Seed Initial Inventory & Default Admin Account

To ensure the storefront functions immediately with stock availability and you can log in to the admin backoffice, run the initial seed query.

1. Inside phpMyAdmin, click on your database `yourprefix_genomed`.
2. Click on the **SQL** tab.
3. Paste and execute the following query:

```sql
-- =============================================================================
-- 1. Seed Initial Stock Levels (100 units for each formulation)
-- =============================================================================
INSERT INTO stock (slug, qty_available) VALUES 
('decoliv-ds-syrup', 100),
('rimcuff-sf-syrup', 100),
('sugar-ok-liquid', 100),
('stoclean-sf-syrup', 100),
('kcr-powder', 100),
('cistover-liquid', 100),
('qsb-capsules', 100),
('heamclear-sf-syrup', 100),
('stroperm-powder', 100),
('arq-15', 100)
ON DUPLICATE KEY UPDATE qty_available = qty_available;

-- =============================================================================
-- 2. Seed Default Admin Backoffice User
-- Email: admin@genomedpharmaceuticals.com
-- Password: Genomed@Admin2026
-- =============================================================================
INSERT INTO users (email, password_hash, name, role) 
VALUES (
  'admin@genomedpharmaceuticals.com', 
  '$2a$10$Ew.VqR.G5WJkM1hK8oHnUu9vWzHjYgH1h2K3l4M5n6O7p8Q9r0S1T', 
  'Genomed Admin', 
  'admin'
)
ON DUPLICATE KEY UPDATE email = email;
```

4. Click **Go**. You will see: *"2 rows affected"* or *"Query executed successfully"*.

---

## Step 4: Configure Application Environment Variables

In your production environment (or `.env.production` / `.env.local`):

```ini
# =============================================================================
# SHARED HOSTING DATABASE SETTINGS
# =============================================================================
# If Next.js runs on the same shared host:
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yourprefix_genomed
DB_USER=yourprefix_dbadmin
DB_PASSWORD=YourPasswordHere

# Shared hosting limits concurrent MySQL connections.
# Keep this pool size between 5 and 10 to prevent "Too many connections" errors:
DB_CONNECTION_LIMIT=5

# Admin Login details seeded in Step 3:
ADMIN_EMAIL=admin@genomedpharmaceuticals.com
ADMIN_INITIAL_PASSWORD=Genomed@Admin2026
JWT_SECRET=generate-a-random-64-character-secret-string-here
```

---

## Step 5: Connecting from Your Local Computer (Remote MySQL)

If you are developing locally on your laptop and want to connect directly to your shared hosting MySQL database:

1. Log in to cPanel.
2. In the **Databases** section, click **Remote MySQL**.
3. Under **Add Access Host**:
   - Enter your current public IP address (find via [whatismyip.com](https://whatismyip.com)), OR enter `%` (allows any IP, useful for dynamic home broadband).
   - Click **Add Host**.
4. In your local `.env.local`:
   - Change `DB_HOST` from `localhost` to your shared hosting server's IP address or domain name (e.g. `DB_HOST=yourdomain.com` or `DB_HOST=192.168.x.x`).

---

## Step 6: Hosting the Next.js Application on Shared Hosting

Next.js is a Node.js framework. How you deploy it depends on your shared hosting configuration:

### Method A: Shared Hosting with "Setup Node.js App" (cPanel / CloudLinux / Phusion Passenger)
Many modern shared hosts include native Node.js support:
1. In cPanel, search for **"Setup Node.js App"**.
2. Click **Create Application**:
   - **Node.js version:** Select `20.x` or higher.
   - **Application mode:** `Production`.
   - **Application root:** Enter directory name, e.g., `genomed`.
   - **Application URL:** Select `genomedpharmaceuticals.com`.
   - **Application startup file:** `server.js` or `node_modules/next/dist/bin/next`.
3. Upload project files (or clone via Git).
4. Run `npm install` and `npm run build`.
5. Click **Restart Application**.

### Method B: Standalone Output (Recommended for Shared Linux Hosts)
Next.js supports building a standalone minimal server that bundles all required dependencies into a single folder:
1. In `next.config.ts`, verify or add:
   ```ts
   output: "standalone",
   ```
2. Build the project locally or on server:
   ```bash
   npm run build
   ```
3. This creates a compact standalone package at `.next/standalone`.
4. Copy:
   - `.next/standalone/` → Your server root
   - `public/` → Your server's `public/` folder
   - `.next/static/` → `.next/standalone/.next/static/`
5. Run using `node server.js` through the cPanel Node.js manager or PM2.

### Method C: Split Setup (Frontend on VPS/Vercel + Database on Shared Hosting)
You can also host the Next.js app on a fast VPS (like DigitalOcean/Hostinger VPS) while keeping the MySQL database on your shared hosting:
- Enable **Remote MySQL** in cPanel (Step 5).
- In the VPS `.env.production`, set `DB_HOST=shared-hosting-ip`.

---

## Summary of Default Credentials

| Service | Setting / Value |
|---|---|
| **Database Host** | `localhost` (or server IP if connecting remotely) |
| **Database Port** | `3306` |
| **Collation** | `utf8mb4_unicode_ci` |
| **Admin Portal** | `https://yourdomain.com/admin` |
| **Admin Email** | `admin@genomedpharmaceuticals.com` |
| **Admin Password** | `Genomed@Admin2026` *(Change after first login)* |
