<?php
/**
 * Online Complaint Registration and Management System
 * Logout Page (PHP / MySQL)
 * SmartBridge College Project Deliverable
 */

require_once 'config.php';

// Empty and clear session states
$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();

header("Location: index.php");
exit;
?>
