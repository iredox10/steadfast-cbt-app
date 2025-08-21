<?php
// Test script to check what the API returns
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;

// Create a mock request
$request = Request::create('/api/get-student-exam', 'GET');

// Get the application instance
$app = require_once 'bootstrap/app.php';

// Handle the request
$response = $app->handle($request);

// Output the response
echo "Status Code: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
?>