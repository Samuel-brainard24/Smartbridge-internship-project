-- ==========================================
-- Online Complaint Registration and Management System
-- Database Schema for MySQL / XAMPP
-- SmartBridge College Project Deliverable
-- ==========================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `complaint_management_db`
--
CREATE DATABASE IF NOT EXISTS `complaint_management_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `complaint_management_db`;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(15) NOT NULL,
  `address` TEXT NOT NULL,
  `profile_pic` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('superadmin', 'moderator', 'support') DEFAULT 'moderator',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_admins_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `complaint_categories`
--
CREATE TABLE IF NOT EXISTS `complaint_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--
CREATE TABLE IF NOT EXISTS `complaints` (
  `id` VARCHAR(20) PRIMARY KEY, -- format: CMP-YYYY-XXXX (e.g. CMP-2026-0001)
  `user_id` INT NOT NULL,
  `category_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  `status` ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
  `image_url` LONGTEXT DEFAULT NULL, -- Support base64 or file upload path
  `assigned_to` INT DEFAULT NULL, -- Admin ID who is handling the complaint
  `rating` INT DEFAULT NULL, -- User rating (1 to 5) after resolution
  `feedback` TEXT DEFAULT NULL, -- User feedback comments
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`category_id`) REFERENCES `complaint_categories` (`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`assigned_to`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  INDEX `idx_complaints_user` (`user_id`),
  INDEX `idx_complaints_status` (`status`),
  INDEX `idx_complaints_priority` (`priority`),
  INDEX `idx_complaints_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `complaint_timeline`
-- (Acts as complaint_status tracking history)
--
CREATE TABLE IF NOT EXISTS `complaint_timeline` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `complaint_id` VARCHAR(20) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `description` TEXT NOT NULL,
  `updated_by_admin` INT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`complaint_id`) REFERENCES `complaints` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`updated_by_admin`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `message` TEXT NOT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user_read` (`user_id`, `is_read`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_activity_logs`
--
CREATE TABLE IF NOT EXISTS `admin_activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `target` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- SEED DATA FOR DEMONSTRATION & TESTING
-- =========================================================

--
-- Seed Complaint Categories
--
INSERT INTO `complaint_categories` (`id`, `name`, `description`) VALUES
(1, 'Water Supply', 'Issues related to pipeline leaks, water shortage, dirty water, or billing discrepancies.'),
(2, 'Electricity', 'Power outages, fluctuating voltage, broken streetlights, or dangerous wiring.'),
(3, 'Roads & Infrastructure', 'Potholes, broken footpaths, blocked drains, or structural damage to public utilities.'),
(4, 'Sanitation & Garbage', 'Garbage accumulation, uncleaned streets, overflowing drains, or public toilets maintenance.'),
(5, 'Security & Public Safety', 'Suspicious activities, lack of patrolling, public nuisance, or safety concerns.');

--
-- Seed Admins (Passwords: 'admin123' hashed using standard PHP password_hash BCrypt)
--
INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Super Admin', 'admin@complaints.com', '$2y$10$p0bYhXoQ.N3bX5vN1iUuNOnH2vQ6XN3/hDHe4Y2Uscz3i9x9Ea4mG', 'superadmin'),
(2, 'Support Specialist', 'support@complaints.com', '$2y$10$p0bYhXoQ.N3bX5vN1iUuNOnH2vQ6XN3/hDHe4Y2Uscz3i9x9Ea4mG', 'support');

--
-- Seed Users (Passwords: 'user123' hashed using standard PHP password_hash BCrypt)
--
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `address`, `status`) VALUES
(1, 'John Doe', 'john@gmail.com', '$2y$10$uSq2U4I86vY9FmsF25G00OmS0Z93wM8Pz5e5r67HwU32K6g1.GvO6', '9876543210', '123, Green Valley Apartments, Sector 4, Metro City', 'active'),
(2, 'Sarah Jenkins', 'sarah@gmail.com', '$2y$10$uSq2U4I86vY9FmsF25G00OmS0Z93wM8Pz5e5r67HwU32K6g1.GvO6', '8765432109', 'A-45, Sunrise Heights, Park Lane, Metro City', 'active');

--
-- Seed Complaints
--
INSERT INTO `complaints` (`id`, `user_id`, `category_id`, `title`, `description`, `priority`, `status`, `assigned_to`, `rating`, `feedback`, `created_at`) VALUES
('CMP-2026-0001', 1, 1, 'Burst Water Pipeline in Sector 4', 'There is a major burst in the main water supply pipeline near Green Valley block B gate. Hundreds of gallons of clean drinking water are being wasted, and the water pressure in our apartment has dropped to zero.', 'high', 'resolved', 1, 5, 'Thank you! The municipal team came within 3 hours and successfully repaired the pipeline. Excellent response.', '2026-07-15 10:30:00'),
('CMP-2026-0002', 1, 2, 'Non-functioning Streetlights on main road', 'All streetlights from block C corner to Sector 4 park have been broken/non-functioning for the last 4 days. It is pitch dark at night, posing safety issues for senior citizens and women walking late.', 'medium', 'in_progress', 2, NULL, NULL, '2026-07-17 14:15:00'),
('CMP-2026-0003', 2, 4, 'Uncleaned Garbage Pile in Park Lane', 'The public dump container has overflowed, and garbage is scattered all over the lane. It is attracting stray dogs and spreading a terrible stench throughout the neighborhood. Please clear this immediately.', 'critical', 'pending', NULL, NULL, NULL, '2026-07-18 09:00:00');

--
-- Seed Complaint Timelines
--
INSERT INTO `complaint_timeline` (`complaint_id`, `status`, `description`, `updated_by_admin`, `created_at`) VALUES
('CMP-2026-0001', 'pending', 'Complaint registered successfully.', NULL, '2026-07-15 10:30:00'),
('CMP-2026-0001', 'in_progress', 'Complaint assigned to Super Admin. Dispatching engineering team to the location.', 1, '2026-07-15 11:45:00'),
('CMP-2026-0001', 'resolved', 'Water line repaired, welded, and pressure restored. Verified with local residents.', 1, '2026-07-15 14:20:00'),

('CMP-2026-0002', 'pending', 'Complaint registered successfully.', NULL, '2026-07-17 14:15:00'),
('CMP-2026-0002', 'in_progress', 'Assigned to Support Specialist. Notified electricity board for street light lamp replacements.', 2, '2026-07-18 10:00:00'),

('CMP-2026-0003', 'pending', 'Complaint registered successfully.', NULL, '2026-07-18 09:00:00');

--
-- Seed Notifications
--
INSERT INTO `notifications` (`user_id`, `message`, `is_read`, `created_at`) VALUES
(1, 'Your complaint CMP-2026-0001 status has been updated to In Progress.', 1, '2026-07-15 11:45:00'),
(1, 'Your complaint CMP-2026-0001 status has been resolved! Please leave your feedback.', 0, '2026-07-15 14:20:00'),
(1, 'Your complaint CMP-2026-0002 status has been updated to In Progress.', 0, '2026-07-18 10:00:00');

--
-- Seed Activity Logs
--
INSERT INTO `admin_activity_logs` (`admin_id`, `action`, `target`, `created_at`) VALUES
(1, 'assigned_complaint', 'Assigned CMP-2026-0001 to self', '2026-07-15 11:45:00'),
(1, 'resolved_complaint', 'Resolved water pipe issue CMP-2026-0001', '2026-07-15 14:20:00'),
(2, 'assigned_complaint', 'Assigned CMP-2026-0002 to self', '2026-07-18 10:00:00');

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
