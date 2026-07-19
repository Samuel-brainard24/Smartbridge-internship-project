<?php
/**
 * Online Complaint Registration and Management System
 * Unified Login Portal (PHP / MySQL)
 * SmartBridge College Project Deliverable
 */

require_once 'config.php';

// Redirect if already logged in
if (isset($_SESSION['user_id'])) {
    if ($_SESSION['user_role'] === 'admin') {
        header("Location: admin-dashboard.php");
    } else {
        header("Location: dashboard.php");
    }
    exit;
}

$error = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);

    if (empty($email) || empty($password)) {
        $error = "Please fill in all credential fields.";
    } else {
        // 1. Check Citizens (users table)
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => strtolower($email)]);
        $user = $stmt->fetch();

        if ($user) {
            // Verify password using modern BCrypt hashing
            if (password_verify($password, $user['password'])) {
                if ($user['status'] === 'suspended') {
                    $error = "Your account has been suspended. Please contact core administration.";
                } else {
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['user_name'] = $user['name'];
                    $_SESSION['user_email'] = $user['email'];
                    $_SESSION['user_role'] = 'user';
                    
                    header("Location: dashboard.php");
                    exit;
                }
            } else {
                $error = "Invalid email or password provided.";
            }
        } else {
            // 2. Check Administrators (admins table)
            $stmt = $pdo->prepare("SELECT * FROM admins WHERE email = :email LIMIT 1");
            $stmt->execute(['email' => strtolower($email)]);
            $admin = $stmt->fetch();

            if ($admin && password_verify($password, $admin['password'])) {
                $_SESSION['user_id'] = $admin['id'];
                $_SESSION['user_name'] = $admin['name'];
                $_SESSION['user_email'] = $admin['email'];
                $_SESSION['user_role'] = 'admin';
                $_SESSION['admin_role'] = $admin['role'];

                header("Location: admin-dashboard.php");
                exit;
            } else {
                $error = "Invalid email or password credentials.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign In - Online Complaint Management System</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Google Fonts & FontAwesome -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        .login-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.08);
        }
        .btn-primary {
            background-color: #2563eb;
            border-color: #2563eb;
            padding: 10px 24px;
            font-weight: 600;
        }
        .btn-primary:hover {
            background-color: #1d4ed8;
            border-color: #1d4ed8;
        }
        .logo-circle {
            height: 52px;
            width: 52px;
            background-color: #2563eb;
            color: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            margin: 0 auto 16px auto;
            box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
        }
    </style>
</head>
<body>

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-5 col-lg-4">
            <div class="card login-card p-4 p-sm-5">
                <div class="text-center mb-4">
                    <div class="logo-circle">
                        <i class="fa-solid fa-square-check"></i>
                    </div>
                    <h4 class="fw-bold text-dark m-0">CMS Portal</h4>
                    <p class="text-muted small">Complaint Management and tracking</p>
                </div>

                <?php if (!empty($error)): ?>
                    <div class="alert alert-danger d-flex align-items-center mb-3 py-2" role="alert">
                        <i class="fa-solid fa-triangle-exclamation me-2"></i>
                        <span class="small"><?= sanitize($error) ?></span>
                    </div>
                <?php endif; ?>

                <form method="POST" action="">
                    <div class="mb-3">
                        <label for="email" class="form-label text-secondary small fw-bold">Email Address</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white text-muted"><i class="fa-solid fa-envelope"></i></span>
                            <input type="email" class="form-control" id="email" name="email" placeholder="e.g. name@domain.com" required>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="d-flex justify-content-between">
                            <label for="password" class="form-label text-secondary small fw-bold">Password</label>
                            <a href="forgot.php" class="text-decoration-none small fw-bold text-primary">Forgot?</a>
                        </div>
                        <div class="input-group">
                            <span class="input-group-text bg-white text-muted"><i class="fa-solid fa-lock"></i></span>
                            <input type="password" class="form-control" id="password" name="password" placeholder="••••••••" required>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-full w-100 rounded-pill mb-3">Sign In</button>
                    
                    <div class="text-center mt-3">
                        <span class="text-muted small">New to CMS?</span>
                        <a href="register.php" class="text-decoration-none small fw-bold text-primary ms-1">Create Account</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
