// Simple test to check if the student route is working
fetch('http://localhost:8000/api/get-student-exam')
  .then(response => response.json())
  .then(data => console.log('API Response:', data))
  .catch(error => console.error('API Error:', error));