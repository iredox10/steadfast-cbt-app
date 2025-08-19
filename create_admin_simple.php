<?php

// Load environment variables
if (file_exists(__DIR__.'/.env')) {
    $lines = file(__DIR__.'/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

// Database configuration from .env
$dbHost = $_ENV['DB_HOST'] ?? '127.0.0.1';
$dbPort = $_ENV['DB_PORT'] ?? 5432;
$dbName = $_ENV['DB_DATABASE'] ?? 'laravel';
$dbUser = $_ENV['DB_USERNAME'] ?? 'laravel';
$dbPass = $_ENV['DB_PASSWORD'] ?? 'secret';

try {
    echo "Connecting to database...\n";
    
    // Connect to PostgreSQL database
    $pdo = new PDO("pgsql:host=$dbHost;port=$dbPort;dbname=$dbName", $dbUser, $dbPass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Creating new admin user...\n";
    
    // Hash the password
    $hashedPassword = password_hash('password', PASSWORD_DEFAULT);
    
    // Insert the admin user directly
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, password, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute(['Administrator', 'admin@example.com', $hashedPassword, 'admin', 'active']);
    
    echo "SUCCESS: Admin user created!\n";
    echo "Email: admin@example.com\n";
    echo "Password: password\n";
    echo "Please change the password after first login.\n";
    
} catch (Exception $e) {
    echo "ERROR: Failed to create admin user: " . $e->getMessage() . "\n";
    exit(1);
}