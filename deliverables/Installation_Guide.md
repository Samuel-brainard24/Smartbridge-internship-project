# XAMPP Installation & Setup Guide
**Online Complaint Registration and Management System**
*SmartBridge College Project Implementation Guide*

Follow these steps to deploy and execute the PHP/MySQL version of this platform on a local Windows, macOS, or Linux system utilizing XAMPP.

---

## Prerequisites
1. **XAMPP Server** (PHP 8.0+ and MySQL/MariaDB) installed.
   - Download XAMPP from: [https://www.apachefriends.org/index.html](https://www.apachefriends.org/index.html)
2. A web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).

---

## Step 1: Copy Source Files to `htdocs`
1. Locate your XAMPP installation directory (typically `C:\xampp\` on Windows or `/Applications/XAMPP/` on macOS).
2. Open the `htdocs` folder.
3. Create a new directory inside `htdocs` named `complaint-portal` (so the path looks like `C:\xampp\htdocs\complaint-portal\`).
4. Copy all files inside the `/deliverables/PHP_Source_Code/` directory of this workspace and paste them directly into your new `C:\xampp\htdocs\complaint-portal\` folder.
5. Create a folder named `uploads` inside your `complaint-portal` directory (i.e. `C:\xampp\htdocs\complaint-portal\uploads\`). This directory will host images/documents uploaded by citizens.

---

## Step 2: Boot Up Apache & MySQL Services
1. Open the **XAMPP Control Panel** on your computer.
2. Click the **Start** button next to the **Apache** service.
3. Click the **Start** button next to the **MySQL** service.
4. Ensure both modules turn green, indicating they are listening on their default ports (`80`/`443` for Apache, `3306` for MySQL).

---

## Step 3: Set Up the Database in phpMyAdmin
1. Open your web browser and navigate to: `http://localhost/phpmyadmin/`
2. Click the **Databases** tab in the top navigation panel.
3. Create a new database named exactly `complaint_management_db` and choose `utf8mb4_unicode_ci` as the collation. Click **Create**.
4. Select `complaint_management_db` from the left sidebar.
5. Click on the **Import** tab at the top.
6. Click **Choose File** and select the `/deliverables/database.sql` file provided in the project workspace.
7. Scroll down to the bottom and click the **Import** (or **Go**) button.
8. Once the database is successfully imported, you will see a list of tables:
   - `users`
   - `admins`
   - `complaint_categories`
   - `complaints`
   - `complaint_timeline`
   - `notifications`
   - `admin_activity_logs`

---

## Step 4: Verify Database Connection Configuration
1. Open the `C:\xampp\htdocs\complaint-portal\config.php` file in any text editor (VS Code, Notepad, etc.).
2. Confirm the credentials match your local MySQL configuration:
   ```php
   $db_host = "localhost";
   $db_user = "root";   // Default XAMPP user
   $db_pass = "";       // Default XAMPP password is empty
   $db_name = "complaint_management_db";
   ```
3. Save any modifications.

---

## Step 5: Execute and Test the Application
1. In your web browser, navigate to: `http://localhost/complaint-portal/`
2. You will be greeted by the secure login screen.
3. To test the citizen flow, click **Create Account**, fill in your details, and register. Then sign in.
4. To test the administrator flow:
   - The database comes pre-seeded with an administrator account for instant access.
   - **Admin Username / Email:** `admin@portal.gov.in`
   - **Admin Password:** `admin123` (PDO hashes match).
5. File a test ticket, change its status in the database, and verify the timeline logs updating!

---

## Troubleshooting Common Issues

### 1. `PDOException: Database Connection Failed`
- **Cause:** Apache or MySQL service is not running in XAMPP.
- **Solution:** Re-open XAMPP Control Panel, stop and start the services, and ensure port `3306` is not being blocked by another MySQL installation or utility on your computer.

### 2. `Upload folder is not writeable`
- **Cause:** Restricted folder permissions on macOS/Linux.
- **Solution:** Execute `chmod -R 755 /Applications/XAMPP/xamppfiles/htdocs/complaint-portal/uploads` in your terminal to allow files upload.

### 3. `Maximum upload size exceeded`
- **Cause:** PHP limits in `php.ini`.
- **Solution:** In XAMPP Control Panel, click on **Config** next to Apache, select `php.ini`, search for `upload_max_filesize` and change it to `10M`, then restart Apache.
