<?php
/**
 * Online Complaint Registration and Management System
 * File New Complaint (PHP / MySQL)
 * SmartBridge College Project Deliverable
 */

require_once 'config.php';

// Route guards
if (!isset($_SESSION['user_id']) || $_SESSION['user_role'] !== 'user') {
    header("Location: index.php");
    exit;
}

$user_id = $_SESSION['user_id'];
$error = "";
$success = "";

// Pull categories for select dropdown
try {
    $cat_stmt = $pdo->query("SELECT * FROM complaint_categories ORDER BY name ASC");
    $categories = $cat_stmt->fetchAll();
} catch (PDOException $e) {
    $categories = [];
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $category_id = $_POST['category_id'] ?? '';
    $title = trim($_POST['title'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $priority = $_POST['priority'] ?? 'medium';

    if (empty($category_id) || empty($title) || empty($description)) {
        $error = "All mandatory fields must be filled.";
    } else {
        $image_url = "";
        
        // Handle file upload
        if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
            $fileTmpPath = $_FILES['attachment']['tmp_name'];
            $fileName = $_FILES['attachment']['name'];
            $fileSize = $_FILES['attachment']['size'];
            $fileType = $_FILES['attachment']['type'];
            
            $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'];
            
            if (in_array($fileExtension, $allowedExtensions)) {
                if ($fileSize <= 2 * 1024 * 1024) { // 2MB limit
                    // Ensure local uploads directory exists
                    $uploadDir = './uploads/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    
                    // Generate unique filename to avoid collision
                    $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
                    $dest_path = $uploadDir . $newFileName;
                    
                    if (move_uploaded_file($fileTmpPath, $dest_path)) {
                        $image_url = 'uploads/' . $newFileName;
                    } else {
                        $error = "There was an error moving the uploaded file to directory.";
                    }
                } else {
                    $error = "File size must be less than 2MB.";
                }
            } else {
                $error = "Only JPG, PNG, PDF, or Word files are allowed.";
            }
        }

        if (empty($error)) {
            try {
                $pdo->beginTransaction();
                
                // 1. Generate Sequentially Integrity unique Ticket ID (CMP-YYYY-XXXX)
                $complaint_id = generateComplaintId($pdo);
                
                // 2. Insert into complaints table
                $stmt = $pdo->prepare("INSERT INTO complaints (id, user_id, category_id, title, description, priority, status, image_url) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)");
                $stmt->execute([
                    $complaint_id,
                    $user_id,
                    $category_id,
                    $title,
                    $description,
                    $priority,
                    $image_url
                ]);
                
                // 3. Log initial step in timeline table
                $time_stmt = $pdo->prepare("INSERT INTO complaint_timeline (complaint_id, status, description) VALUES (?, 'pending', 'Complaint registered successfully by citizen')");
                $time_stmt->execute([$complaint_id]);
                
                $pdo->commit();
                $success = "Complaint registered successfully! Your Ticket ID is: " . $complaint_id;
            } catch (PDOException $e) {
                $pdo->rollBack();
                $error = "Database transaction failed: " . $e->getMessage();
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
    <title>File New Complaint - Citizen Panel</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .sidebar { background-color: #0f172a; min-height: 100vh; color: #94a3b8; }
        .sidebar .nav-link { color: #94a3b8; font-size: 14px; font-weight: 500; border-radius: 8px; margin-bottom: 4px; }
        .sidebar .nav-link.active, .sidebar .nav-link:hover { background-color: #1e293b; color: white; }
    </style>
</head>
<body>

<div class="container-fluid">
    <div class="row">
        <!-- Sidebar Navigation -->
        <div class="col-md-3 col-lg-2 sidebar p-4 d-none d-md-block">
            <h5 class="text-white fw-bold mb-4"><i class="fa-solid fa-square-check me-2 text-primary"></i>CMS Panel</h5>
            <div class="mb-3 small text-secondary font-semibold uppercase tracking-wider">Citizen Nav</div>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link" href="dashboard.php"><i class="fa-solid fa-chart-pie me-2"></i>Dashboard</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" href="register-complaint.php"><i class="fa-solid fa-plus-circle me-2"></i>File Ticket</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="complaint-history.php"><i class="fa-solid fa-history me-2"></i>My History</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="logout.php"><i class="fa-solid fa-sign-out-alt me-2"></i>Sign Out</a>
                </li>
            </ul>
        </div>

        <!-- Main Workspace -->
        <div class="col-md-9 col-lg-10 p-4 p-md-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="fw-bold text-dark m-0">File New Complaint</h3>
                    <p class="text-muted small">Register public or municipal infrastructure grievances with detail mapping</p>
                </div>
                <a href="dashboard.php" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-arrow-left me-1"></i>Back to Dashboard</a>
            </div>

            <?php if (!empty($error)): ?>
                <div class="alert alert-danger py-2 small mb-4">
                    <i class="fa-solid fa-triangle-exclamation me-2"></i><?= sanitize($error) ?>
                </div>
            <?php endif; ?>

            <?php if (!empty($success)): ?>
                <div class="alert alert-success py-2 small mb-4">
                    <i class="fa-solid fa-circle-check me-2"></i><?= sanitize($success) ?>
                </div>
            <?php endif; ?>

            <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
                <form method="POST" action="" enctype="multipart/form-data">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="category_id" class="form-label text-secondary small fw-bold">Select Category <span class="text-danger">*</span></label>
                            <select class="form-select" id="category_id" name="category_id" required>
                                <option value="">-- Choose Category --</option>
                                <?php foreach ($categories as $cat): ?>
                                    <option value="<?= $cat['id'] ?>"><?= sanitize($cat['name']) ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="priority" class="form-label text-secondary small fw-bold">Severity Priority</label>
                            <select class="form-select" id="priority" name="priority">
                                <option value="low">Low Priority (Minor Inconvenience)</option>
                                <option value="medium" selected>Medium Priority (Operational Disturbance)</option>
                                <option value="high">High Priority (Severe Outage / Risk)</option>
                                <option value="critical">Critical Priority (Immediate Threat / Danger)</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="title" class="form-label text-secondary small fw-bold">Complaint Title <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="title" name="title" placeholder="Brief subject (e.g., Water leakage at lane 4)" required>
                    </div>

                    <div class="mb-3">
                        <label for="description" class="form-label text-secondary small fw-bold">Detailed Description <span class="text-danger">*</span></label>
                        <textarea class="form-control" id="description" name="description" rows="5" placeholder="Explain the issue thoroughly, mentioning landmarks, approximate timeline, and current impact..." required></textarea>
                    </div>

                    <div class="mb-4">
                        <label for="attachment" class="form-label text-secondary small fw-bold">Upload Supporting Image / Document (Max 2MB)</label>
                        <input class="form-control" type="file" id="attachment" name="attachment">
                        <div class="form-text small">Accepted Formats: JPEG, PNG, PDF, Docx. Evidence speeds up response time.</div>
                    </div>

                    <div class="d-flex justify-content-end gap-2">
                        <button type="reset" class="btn btn-outline-secondary px-4">Clear Form</button>
                        <button type="submit" class="btn btn-primary px-5"><i class="fa-solid fa-paper-plane me-1"></i>File Complaint</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
