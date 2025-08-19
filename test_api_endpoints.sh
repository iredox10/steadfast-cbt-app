#!/bin/bash
# This is a simple test script to check if the API endpoints are working
# You would run this from the command line with curl

echo "=== TESTING API ENDPOINTS ==="
echo

echo "1. Testing get-invigilator endpoint:"
curl -s http://localhost/api/get-invigilator/3 | jq '.'
echo

echo "2. Testing invigilator students endpoint:"
curl -s http://localhost/api/invigilator/students/1 | jq '.'
echo