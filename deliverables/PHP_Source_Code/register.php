<?php
/**
 * Online Complaint Registration and Management System
 * User Registration Page (PHP / MySQL)
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
$success = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = trim($_POST['password']);
    $confirm_password = trim($_POST['confirm_password']);
    $phone = trim($_POST['phone']);
    $address = trim($_POST['address']);

    if (empty($name) || empty($email) || empty($password) || empty($phone) || empty($address)) {
        $error = "All fields are required to register.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "Please provide a valid email format.";
    } elseif (strlen($password) < 6) {
        $error = "Password must be at least 6 characters in length.";
    } elseif ($password !== $confirm_password) {
        $error = "New passwords do not match.";
    } else {
        // Check uniqueness across users and admins
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? UNION SELECT id FROM admins WHERE email = ? LIMIT 1");
        $stmt->execute([strtolower($email), strtolower($email)]);
        
        if ($stmt->fetch()) {
            $error = "This email is already registered.";
        } else {
            // Hash password securely with BCrypt
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            
            try {
                $stmt = $pdo->prepare("INSERT INTO users (name, email, password, phone, address, status) VALUES (:name, :email, :password, :phone, :address, 'active')");
                $stmt->execute([
                    'name' => $name,
                    'email' => strtolower($email),
                    'password' => $hashed_password,
                    'phone' => $phone,
                    'address' => $address
                ]);
                
                $success = "Registration successful! You can now log in.";
            } catch (PDOException $e) {
                $error = "Failed to create account: " . $e->getMessage();
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
    <title>Create Citizen Account - Online CMS</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f8fafc;
            min-height: 100vh;
            display: flex;
            align-items: center;
            padding: 40px 0;
        }
        .register-card {
            border: none;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(59, 130, 246, 0.08);
        }
        .btn-primary {
            background-color: #2563eb;
            border-color: #2563eb;
            font-weight: 600;
        }
    </style>
</head>
<body>

<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-7 col-lg-5">
            <div class="card register-card p-4 p-sm-5">
                <div class="text-center mb-4">
                    <h4 class="fw-bold text-dark m-0">Create Account</h4>
                    <p class="text-muted small">Register a citizen account to file complaints</p>
                </div>

                <?php if (!empty($error)): ?>
                    <div class="alert alert-danger d-flex align-items-center mb-3 py-2">
                        <i class="fa-solid fa-triangle-exclamation me-2"></i>
                        <span class="small"><?= sanitize($error) ?></span>
                    </div>
                <?php endif; ?>

                <?php if (!empty($success)): ?>
                    <div class="alert alert-success d-flex align-items-center mb-3 py-2">
                        <i class="fa-solid fa-circle-check me-2"></i>
                        <span class="small"><?= sanitize($success) ?>. <a href="index.php" class="alert-link">Login here</a></span>
                    </div>
                <?php endif; ?>

                <form method="POST" action="">
                    <div class="mb-3">
                        <label for="name" class="form-label text-secondary small fw-bold">Full Name</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white text-muted"><i class="fa-solid fa-user"></i></span>
                            <input type="text" class="form-control" id="name" name="name" placeholder="John Doe" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="email" class="form-label text-secondary small fw-bold">Email Address</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white text-muted"><i class="fa-solid fa-envelope"></i></span>
                            <input type="email" class="form-control" id="email" name="email" placeholder="john@gmail.com" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="phone" class="form-label text-secondary small fw-bold">Phone Number</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white text-muted"><i class="fa-solid fa-phone"></i></span>
                            <input type="tel" class="form-control" id="phone" name="phone" placeholder="9876543210" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="address" class="form-label text-secondary small fw-bold">Home Address</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white text-muted"><i class="fa-solid fa-map-pin"></i></span>
                            <textarea class="form-control" id="address" name="address" rows="2" placeholder="Building name, Lane, City..." required></textarea>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-sm-6 mb-3">
                            <label for="password" class="form-label text-secondary small fw-bold">Password</label>
                            <input type="password" class="form-control" id="password" name="password" placeholder="Min 6 chars" required>
                        </div>
                        <div class="col-sm-6 mb-3">
                            <label for="confirm_password" class="form-label text-secondary small fw-bold">Confirm Password</label>
                            <input type="password" class="form-control" id="confirm_password" name="confirm_password" placeholder="Re-type password" required>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 rounded-pill mt-2">Create Account</button>
                    
                    <div class="text-center mt-3">
                        <span class="text-muted small">Already registered?</span>
                        <a href="index.php" class="text-decoration-none small fw-bold text-primary ms-1">Sign In</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
