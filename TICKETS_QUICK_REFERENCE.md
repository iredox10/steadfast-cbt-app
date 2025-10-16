# 🎫 Tickets System - Quick Reference Guide

## 🚀 Quick Access

### Option 1: From Sidebar (Recommended)
1. Look at left sidebar in any admin page
2. Click **"Tickets"** (ticket icon 🎫)
3. View all active exams with tickets

### Option 2: From Dashboard
1. Go to Dashboard
2. Find active exam
3. Click blue **"Tickets"** button next to "Terminate"

---

## 📍 Where to Find Tickets

### Dedicated Tickets Page
- **URL**: `/admin-tickets/{admin_id}`
- **Shows**: All active exams in card layout
- **Features**: Search, filter, quick access to all tickets
- **Best For**: Overview of multiple exams, distributing tickets

### Dashboard Inline View
- **URL**: `/dashboard/{admin_id}`
- **Shows**: Active exams with inline ticket button
- **Features**: Full exam management + ticket viewing
- **Best For**: Managing exam lifecycle and viewing tickets

---

## 🎯 Common Tasks

### Task 1: Distribute Tickets to Students
```
Tickets Page → Find Exam → View Tickets → Copy Available → Paste & Distribute
```

### Task 2: Check Which Students Logged In
```
Tickets Page → Find Exam → View Tickets → Filter "Used Only" → View List
```

### Task 3: Monitor Exam Progress
```
Tickets Page → Find Exam → View Tickets → Check "Usage %" Statistic
```

### Task 4: Export Ticket Data
```
Tickets Page → Find Exam → View Tickets → Export CSV → Save File
```

### Task 5: Find Specific Student's Ticket
```
Tickets Page → Find Exam → View Tickets → Search Student Name → View Details
```

---

## 🎨 Page Features

### Tickets Page Features
✅ Card-based grid layout  
✅ Search by exam ID or course name  
✅ Only shows active exams  
✅ Quick "View Tickets" button per exam  
✅ Responsive design (mobile-friendly)

### ViewTicketsModal Features
✅ Statistics dashboard (Total, Available, Used, %)  
✅ Search by ticket number, student name, candidate no  
✅ Filter by status (all/available/used)  
✅ Copy available tickets to clipboard  
✅ Export all data to CSV  
✅ Real-time data

---

## 📊 Understanding the Statistics

### Total Tickets
- **Shows**: Number of tickets generated when exam was activated
- **Equals**: Number of enrolled students at activation time

### Available Tickets
- **Shows**: Tickets not yet claimed by students
- **Green color**: Ready to be distributed
- **Decreases**: As students log in

### Used Tickets
- **Shows**: Tickets claimed by students
- **Orange color**: Already assigned
- **Increases**: As students log in

### Usage Percentage
- **Shows**: (Used / Total) × 100
- **Purple color**: Overall progress indicator
- **100%**: All students logged in

---

## 🔍 Search Tips

### In Tickets Page Search
- Search by **exam ID**: "5", "12", "23"
- Search by **course code**: "COM", "MTH", "PHY"
- Search by **course name**: "Introduction", "Calculus"
- Case-insensitive, real-time filtering

### In ViewTicketsModal Search
- Search by **ticket number**: "123456", "234567"
- Search by **student name**: "John", "Jane"
- Search by **candidate number**: "ST2024001"
- All fields searched simultaneously

---

## ⚡ Quick Actions

### Copy Available Tickets
```
1. Open ViewTicketsModal
2. Click "Copy Available" button
3. Paste in text editor (Ctrl+V)
4. Tickets appear as: 123456, 234567, 345678...
5. Distribute to students
```

### Export to CSV
```
1. Open ViewTicketsModal
2. Click "Export CSV" button
3. File downloads as: exam_X_tickets.csv
4. Open in Excel/Sheets
5. Contains: Ticket#, Status, Name, Candidate#, Dept, Assigned At
```

### Filter Tickets
```
1. Open ViewTicketsModal
2. Use status dropdown at top
3. Select "Available Only" or "Used Only"
4. Table updates instantly
```

---

## 🎓 User Roles

### Level Admin
✅ Can access Tickets page  
✅ Can view tickets for exams in their level  
✅ Can copy and export tickets  
✅ Can search and filter

### Super Admin
✅ Can access Tickets page  
✅ Can view tickets for ALL exams  
✅ Can copy and export tickets  
✅ Can search and filter  
✅ Full system access

---

## 📱 Mobile Access

### Mobile Layout
- Cards stack vertically (1 column)
- Search bar full width
- Touch-friendly buttons
- Swipe to close modal
- Responsive table in modal

### Mobile Tips
- Use search to quickly find exams
- Cards are easier to tap than table rows
- Modal scrolls smoothly
- Export CSV works on mobile too

---

## ⚠️ Important Notes

### When Tickets Are Generated
⚙️ **On Exam Activation**: System counts enrolled students and generates exact number of tickets

### When Tickets Are Deleted
🗑️ **On Exam Termination**: All tickets for that exam are deleted from database

### Ticket Persistence
🔒 **Ticket Stays With Student**: Once a student logs in with a ticket, it remains theirs even if:
- Time is extended
- They log out and back in
- Exam is paused (not terminated)

### Active Exams Only
📋 **Tickets Page Filter**: Only shows exams with `activated = 'yes'`  
📋 **Dashboard Button**: "Tickets" button only appears for active exams

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Tickets page is blank | Activate an exam first |
| No "Tickets" link in sidebar | Check you're logged in as admin |
| "View Tickets" does nothing | Check browser console, refresh page |
| Modal shows "No tickets found" | Exam may use old system, terminate and re-activate |
| Search not working | Wait for page to fully load |
| Can't copy tickets | Ensure "Available" tickets exist |
| CSV export empty | Verify tickets were generated |

---

## 🔗 Related Documentation

- **NEW_TICKET_SYSTEM.md** - Technical implementation details
- **TICKET_SYSTEM_QUICK_START.md** - Getting started guide
- **HOW_TO_ACCESS_TICKETS.md** - API access documentation
- **VIEW_TICKETS_UI_TESTING.md** - UI testing procedures
- **TICKETS_PAGE_IMPLEMENTATION.md** - Full feature documentation

---

## 📞 Quick Help

### I need to give tickets to students
→ Go to **Tickets page** → Find exam → Click **"View Tickets"** → Click **"Copy Available"** → Distribute

### I want to see who logged in
→ Go to **Tickets page** → Find exam → Click **"View Tickets"** → Filter **"Used Only"**

### I need to check exam progress
→ Go to **Tickets page** → Find exam → Click **"View Tickets"** → Look at **"Usage %"** card

### I want to export ticket data
→ Go to **Tickets page** → Find exam → Click **"View Tickets"** → Click **"Export CSV"**

### I can't find my exam
→ Use **search bar** at top of Tickets page → Type course name or exam ID

---

## ✅ Cheat Sheet

### Navigation
```
Sidebar → Tickets → View All Active Exams
Dashboard → Active Exam → Tickets Button → View Specific Exam
```

### Workflow
```
Activate Exam → Tickets Generated → Distribute to Students → Students Login → Monitor Usage
```

### Modal Actions
```
Search → Filter → Copy → Export → Close
```

### Common Patterns
```
Need tickets fast? → Tickets Page → Search → Copy
Need to monitor? → Tickets Page → View Tickets → Check %
Need records? → Tickets Page → View Tickets → Export CSV
```

---

**Quick Access URLs**:
- Tickets Page: `http://localhost:5173/admin-tickets/{your_id}`
- Dashboard: `http://localhost:5173/dashboard/{your_id}`

**Keyboard Shortcuts**:
- Copy: `Ctrl+C` (after clicking "Copy Available")
- Search: Click search bar and type
- Close Modal: Click X or "Close" button

---

**Last Updated**: October 15, 2025  
**Status**: ✅ Production Ready  
**Version**: 1.0
