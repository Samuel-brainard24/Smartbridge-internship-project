<?php
/**
 * Online Complaint Registration and Management System
 * Database Configuration & Security Helpers (XAMPP/MySQL)
 * SmartBridge College Project Deliverable
 */

// Establish local session configuration
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "complaint_management_db";

try {
    // Connect to MySQL server first (without database to ensure compatibility)
    $pdo_init = new PDO("mysql:host=$db_host", $db_user, $db_pass);
    $pdo_init->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if not exists
    $pdo_init->exec("CREATE DATABASE IF NOT EXISTS `$db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    
    // Establish connection to specific database
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

} catch (PDOException $e) {
    die("Database Connection failed: " . htmlspecialchars($e->getMessage()));
}

/**
 * XSS Protection helper: Sanitize output strings
 */
function sanitize($str) {
    return htmlspecialchars(trim($str), ENT_QUOTES, 'UTF-8');
}

/**
 * Auto-generate Complaint Number sequentially: CMP-YYYY-XXXX
 */
function generateComplaintId($pdo) {
    $year = date('Y');
    $prefix = "CMP-" . $year . "-";
    
    $stmt = $pdo->prepare("SELECT id FROM complaints WHERE id LIKE :prefix ORDER BY id DESC LIMIT 1");
    $stmt->execute(['prefix' => $prefix . '%']);
    $row = $stmt->fetch();
    
    $next_num = 1;
    if ($row) {
        $last_id = $row['id'];
        $last_num = (int)substr($last_id, 9);
        $next_num = $last_num + 1;
    }
    
    return $prefix . str_pad($next_num, 4, "0", STR_PAD_LEFT);
}

/**
 * Create Audit Activity Logs (for administrators)
 */
function logAdminActivity($pdo, $admin_id, $action, $target) {
    try {
        $stmt = $pdo->prepare("INSERT INTO admin_activity_logs (admin_id, action, target) VALUES (?, ?, ?)");
        $stmt->execute([$admin_id, $action, $target]);
    } catch (PDOException $e) {
        // Fail silently in production or log error
    }
}
?>
