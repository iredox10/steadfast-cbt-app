# 🎫 How Level Admins Can Access Exam Tickets

## Quick Answer

Level admins can access exam tickets through the **API endpoint**:

```
GET /api/exam-tickets/{exam_id}
```

**Example:** `http://your-domain/api/exam-tickets/5`

---

## 📍 Current Access Methods

### Method 1: Using API Endpoint (Available Now ✅)

**Endpoint:** `/api/exam-tickets/{exam_id}`

**Request:**
```bash
curl -X GET http://localhost:8000/api/exam-tickets/5 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "exam": {
    "id": 5,
    "course_id": 7,
    "activated": "yes",
    "activated_date": "2025-10-15T14:30:00.000000Z"
  },
  "statistics": {
    "total": 50,
    "available": 45,
    "used": 5,
    "percentage_used": 10.0
  },
  "tickets": [
    {
      "id": 1,
      "ticket_no": "123456",
      "is_used": false,
      "status": "Available",
      "assigned_to_student_id": null,
      "assigned_at": null,
      "student": null,
      "created_at": "2025-10-15T14:30:00.000000Z"
    },
    {
      "id": 2,
      "ticket_no": "234567",
      "is_used": true,
      "status": "Used",
      "assigned_to_student_id": 15,
      "assigned_at": "2025-10-15T15:00:00.000000Z",
      "student": {
        "id": 15,
        "candidate_no": "ST2024001",
        "full_name": "John Doe",
        "department": "Computer Science",
        "programme": "HND"
      },
      "created_at": "2025-10-15T14:30:00.000000Z"
    }
  ]
}
```

---

### Method 2: Using Browser Console (Quick Check)

1. Go to admin dashboard
2. Open browser console (F12)
3. Run this JavaScript:

```javascript
fetch('/api/exam-tickets/5', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token'),
    'Accept': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Total Tickets:', data.statistics.total);
  console.log('Available:', data.statistics.available);
  console.log('Used:', data.statistics.used);
  console.table(data.tickets);
});
```

---

### Method 3: Using Database Query (Direct)

```sql
-- See all tickets for exam ID 5
SELECT 
    et.ticket_no,
    et.is_used,
    CASE WHEN et.is_used THEN 'Used' ELSE 'Available' END as status,
    s.full_name as assigned_to,
    s.candidate_no,
    et.assigned_at
FROM exam_tickets et
LEFT JOIN students s ON et.assigned_to_student_id = s.id
WHERE et.exam_id = 5
ORDER BY et.is_used ASC, et.ticket_no ASC;
```

---

### Method 4: Using PHP Script (Testing)

```php
php -r "
require 'vendor/autoload.php';
\$app = require 'bootstrap/app.php';
\$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

\$tickets = App\Models\ExamTicket::where('exam_id', 5)
    ->with('student')
    ->get();

echo 'Total: ' . \$tickets->count() . PHP_EOL;
echo 'Available: ' . \$tickets->where('is_used', false)->count() . PHP_EOL;
echo 'Used: ' . \$tickets->where('is_used', true)->count() . PHP_EOL;

foreach (\$tickets as \$ticket) {
    echo sprintf(
        '%s - %s - %s' . PHP_EOL,
        \$ticket->ticket_no,
        \$ticket->is_used ? 'USED' : 'AVAILABLE',
        \$ticket->student ? \$ticket->student->full_name : 'Unassigned'
    );
}
"
```

---

## 🖥️ Frontend UI (Coming Soon)

We can add a UI component to the admin dashboard:

### Option A: Add "View Tickets" Button to Dashboard

**Location:** Dashboard.jsx (Exam row)

**Button:**
```jsx
<button 
  onClick={() => viewTickets(exam.id)}
  className="px-3 py-1 bg-blue-600 text-white rounded"
>
  View Tickets
</button>
```

---

### Option B: Add Tickets Page in Sidebar

**New Route:** `/exam-tickets/:examId`

**Sidebar Link:**
```jsx
<Link to={`/exam-tickets/${activeExamId}`}>
  <FaTicketAlt /> View Tickets
</Link>
```

---

### Option C: Add Modal to Existing Pages

**Trigger:** Click "View Tickets" anywhere an exam is displayed

**Shows:**
- Total tickets generated
- Available vs Used count
- List of all tickets with status
- Student info for used tickets

---

## 📋 What Information Is Available?

### Exam-Level Statistics
- **Total tickets** generated
- **Available tickets** (not yet claimed)
- **Used tickets** (assigned to students)
- **Percentage used**

### Individual Ticket Details
- **Ticket number** (6-digit code)
- **Status** (Available / Used)
- **Assigned student** (if used)
  - Student name
  - Candidate number
  - Department
  - Programme
- **Assignment time** (when ticket was claimed)
- **Creation time** (when ticket was generated)

---

## 🎯 Use Cases for Level Admins

### 1. **Check Available Tickets**
*"How many tickets are still available for students?"*

```javascript
// API call will return: statistics.available
```

### 2. **Find Unused Tickets to Give to Students**
*"What ticket numbers can I give to students who haven't logged in?"*

```javascript
// Filter tickets where is_used = false
data.tickets.filter(t => !t.is_used).map(t => t.ticket_no)
// Result: ["123456", "234567", "345678", ...]
```

### 3. **See Which Students Have Logged In**
*"Who has already claimed a ticket?"*

```javascript
// Filter tickets where is_used = true
data.tickets.filter(t => t.is_used).map(t => ({
  ticket: t.ticket_no,
  student: t.student.full_name
}))
```

### 4. **Monitor Exam Progress**
*"What percentage of students have started the exam?"*

```javascript
// Check statistics.percentage_used
console.log(`${data.statistics.percentage_used}% of students have logged in`);
```

---

## 🔧 Implementation Examples

### Example 1: React Component to Display Tickets

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { path } from '../utils/path';

const ExamTickets = ({ examId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, [examId]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${path}/exam-tickets/${examId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading tickets...</div>;
  if (!data) return <div>No tickets found</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Exam Tickets</h2>
      
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded">
          <div className="text-3xl font-bold">{data.statistics.total}</div>
          <div className="text-gray-600">Total Tickets</div>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <div className="text-3xl font-bold">{data.statistics.available}</div>
          <div className="text-gray-600">Available</div>
        </div>
        <div className="bg-orange-100 p-4 rounded">
          <div className="text-3xl font-bold">{data.statistics.used}</div>
          <div className="text-gray-600">Used</div>
        </div>
      </div>

      {/* Tickets Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Ticket No</th>
            <th className="p-2">Status</th>
            <th className="p-2">Student</th>
            <th className="p-2">Candidate No</th>
            <th className="p-2">Assigned At</th>
          </tr>
        </thead>
        <tbody>
          {data.tickets.map(ticket => (
            <tr key={ticket.id} className="border-b">
              <td className="p-2 font-mono">{ticket.ticket_no}</td>
              <td className="p-2">
                <span className={`px-2 py-1 rounded ${
                  ticket.is_used ? 'bg-orange-200' : 'bg-green-200'
                }`}>
                  {ticket.status}
                </span>
              </td>
              <td className="p-2">{ticket.student?.full_name || '-'}</td>
              <td className="p-2">{ticket.student?.candidate_no || '-'}</td>
              <td className="p-2">
                {ticket.assigned_at 
                  ? new Date(ticket.assigned_at).toLocaleString() 
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExamTickets;
```

---

### Example 2: Quick Stats Modal

```jsx
const TicketStatsModal = ({ examId, onClose }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get(`${path}/exam-tickets/${examId}`)
      .then(res => setStats(res.data.statistics));
  }, [examId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Ticket Statistics</h3>
        {stats && (
          <>
            <p>Total: {stats.total}</p>
            <p>Available: {stats.available}</p>
            <p>Used: {stats.used}</p>
            <p>Usage: {stats.percentage_used}%</p>
          </>
        )}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded">
          Close
        </button>
      </div>
    </div>
  );
};
```

---

## 🚀 Quick Start for Testing

### 1. Test the API Endpoint

```bash
# Replace 5 with your actual exam ID
curl http://localhost:8000/api/exam-tickets/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Or use Postman/Insomnia

- **Method:** GET
- **URL:** `http://localhost:8000/api/exam-tickets/5`
- **Headers:** 
  - `Authorization: Bearer YOUR_TOKEN`
  - `Accept: application/json`

### 3. Or add a simple button in Dashboard.jsx

```jsx
const viewTickets = async (examId) => {
  try {
    const res = await axios.get(`${path}/exam-tickets/${examId}`);
    console.log('Tickets:', res.data);
    alert(`Total: ${res.data.statistics.total}, Available: ${res.data.statistics.available}`);
  } catch (err) {
    console.error(err);
  }
};

// Add this button next to Activate/Terminate buttons
<button onClick={() => viewTickets(exam.id)}>
  View Tickets
</button>
```

---

## 📊 Expected Output Examples

### After Activating Exam (50 students enrolled)

```json
{
  "statistics": {
    "total": 50,
    "available": 50,
    "used": 0,
    "percentage_used": 0
  }
}
```

### After 5 Students Log In

```json
{
  "statistics": {
    "total": 50,
    "available": 45,
    "used": 5,
    "percentage_used": 10.0
  }
}
```

### After Exam Completed (All 50 students)

```json
{
  "statistics": {
    "total": 50,
    "available": 0,
    "used": 50,
    "percentage_used": 100.0
  }
}
```

---

## ✅ Summary

**Current Solution:**
- ✅ API endpoint created: `/api/exam-tickets/{exam_id}`
- ✅ Returns all tickets with status and student info
- ✅ Includes statistics (total, available, used)
- ✅ Protected with authentication
- ✅ Works now - no frontend needed

**Next Steps (Optional):**
- [ ] Add "View Tickets" button to Dashboard
- [ ] Create dedicated Tickets page
- [ ] Add ticket export (CSV/PDF)
- [ ] Real-time ticket status updates

**For now, level admins can:**
1. Use the API endpoint directly
2. Use browser console to fetch tickets
3. Use database queries
4. Use the verification script: `php verify_ticket_system.php`

---

## 📞 Need Help?

**To view tickets right now:**
```bash
# Get active exam ID from dashboard
# Then run:
curl http://localhost:8000/api/exam-tickets/YOUR_EXAM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Or in browser console:**
```javascript
fetch('/api/exam-tickets/5', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
}).then(r => r.json()).then(console.log)
```

This will show you all tickets immediately!
