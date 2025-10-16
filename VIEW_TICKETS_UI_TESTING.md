# 🎫 View Tickets UI - Testing Guide

## What Was Added

### ✅ New Features

1. **ViewTicketsModal Component** - Full-featured modal for viewing exam tickets
2. **"View Tickets" Button** - Added to active exams in Dashboard
3. **API Integration** - Connected to `/api/exam-tickets/{exam_id}` endpoint

---

## 📁 Files Modified/Created

### Created
- `frontend/src/components/ViewTicketsModal.jsx` - New modal component

### Modified
- `frontend/src/pages/admin/Dashboard.jsx` - Added button and modal integration

---

## 🎨 UI Features

### Statistics Cards (Top Section)
- **Total Tickets** - Blue card showing total tickets generated
- **Available** - Green card showing unclaimed tickets
- **Used** - Orange card showing assigned tickets  
- **Usage %** - Purple card showing percentage of tickets claimed

### Search & Filter
- **Search bar** - Find by ticket number, student name, or candidate number
- **Status filter** - Show all, available only, or used only
- **Copy Available** - Copy all available ticket numbers to clipboard
- **Export CSV** - Download all tickets as CSV file

### Tickets Table
- Ticket Number (in blue, monospace font)
- Status (Available/Used with colored badges)
- Student Name (if assigned)
- Candidate Number
- Department
- Assigned At (date and time)

### Actions
- **Copy Available Tickets** - Quickly copy all available tickets to give to students
- **Export to CSV** - Download ticket data for record-keeping
- **Search** - Real-time filtering of tickets
- **Status Filter** - Quick toggle between all/available/used

---

## 🚀 How to Test

### Step 1: Access the Dashboard
1. Log in as level admin or super admin
2. Go to **Admin Dashboard**
3. Look at the exams table

### Step 2: Find an Active Exam
- Look for exams with **"Active"** status badge (green)
- You'll see a blue **"Tickets"** button next to the "Terminate" button

### Step 3: Click "View Tickets"
- Click the **"Tickets"** button
- The ViewTicketsModal should open

### Step 4: Verify Statistics
Check that the statistics cards show:
- ✅ Total tickets matches enrolled students count
- ✅ Available + Used = Total
- ✅ Percentage calculation is correct

### Step 5: Test Search
1. Type a ticket number in search bar
2. Verify only matching tickets appear
3. Type a student name
4. Verify filtering works
5. Clear search - all tickets should reappear

### Step 6: Test Filters
1. Select **"Available Only"** from dropdown
2. Verify only green "Available" badges show
3. Select **"Used Only"**
4. Verify only orange "Used" badges show
5. Select **"All Tickets"**
6. Verify all tickets appear

### Step 7: Test Copy Feature
1. Click **"Copy Available"** button
2. Alert should say "Copied X available ticket numbers to clipboard!"
3. Paste (Ctrl+V) in a text editor
4. Verify you see comma-separated ticket numbers

### Step 8: Test CSV Export
1. Click **"Export CSV"** button
2. File should download as `exam_X_tickets.csv`
3. Open in Excel/Sheets
4. Verify columns: Ticket Number, Status, Student Name, Candidate Number, Department, Assigned At

### Step 9: Close Modal
1. Click **"Close"** button at bottom
2. Or click **X** button at top right
3. Modal should close and return to dashboard

---

## 🎯 Expected Results

### For Newly Activated Exam (No Students Logged In Yet)
```
Statistics:
- Total: 50 (or your enrolled student count)
- Available: 50
- Used: 0
- Usage: 0%

Table:
- All 50 tickets show "Available" status
- All "Student Name" columns show "Not assigned"
- All "Assigned At" columns show "-"
```

### After Some Students Log In (e.g., 5 out of 50)
```
Statistics:
- Total: 50
- Available: 45
- Used: 5
- Usage: 10%

Table:
- 5 tickets show "Used" status with student info
- 45 tickets show "Available" status
- Available tickets sorted to top of list
```

### After All Students Log In
```
Statistics:
- Total: 50
- Available: 0
- Used: 50
- Usage: 100%

Table:
- All tickets show "Used" status
- All have student names and assignment times
```

---

## 🧪 Testing Scenarios

### Scenario 1: Admin Wants to Give Tickets to Students

**Steps:**
1. Open Tickets modal
2. Click "Copy Available"
3. Paste into text editor
4. Select first 10 ticket numbers
5. Give these to first 10 students

**Expected:**
- Clipboard contains comma-separated ticket numbers
- Easy to select and distribute

---

### Scenario 2: Check Who Has Logged In

**Steps:**
1. Open Tickets modal
2. Select "Used Only" filter
3. Review the list

**Expected:**
- Only students who logged in appear
- Can see their names and login times
- Can verify correct students are taking exam

---

### Scenario 3: Find a Specific Student's Ticket

**Steps:**
1. Open Tickets modal
2. Type student name in search
3. View their ticket number

**Expected:**
- Student's row appears
- Can see their ticket number and login time
- Can help student if they forgot their ticket

---

### Scenario 4: Export for Records

**Steps:**
1. Open Tickets modal
2. Click "Export CSV"
3. Save file
4. Open in Excel

**Expected:**
- All ticket data exported
- Can keep for audit trail
- Can analyze usage patterns

---

### Scenario 5: Monitor Exam Progress

**Steps:**
1. Open Tickets modal during exam
2. Check Usage % statistic
3. Refresh to see updates

**Expected:**
- Can see % of students who started
- Can identify if students are having login issues
- Can track exam participation in real-time

---

## 🎨 UI Elements to Verify

### Modal Header
- ✅ Blue gradient background
- ✅ Ticket icon visible
- ✅ Course name displayed
- ✅ X button to close

### Statistics Cards
- ✅ 4 cards in a row (responsive on mobile)
- ✅ Large numbers visible
- ✅ Icons on right side
- ✅ Color coded (blue, green, orange, purple)

### Controls Row
- ✅ Search input on left (takes full width on mobile)
- ✅ Filter dropdown next to search
- ✅ Copy button (green)
- ✅ Export button (blue)

### Table
- ✅ Scrollable if many tickets
- ✅ Ticket numbers in monospace font
- ✅ Status badges colored correctly
- ✅ Student info aligned properly
- ✅ Dates formatted nicely

### Footer
- ✅ Tip message visible
- ✅ Close button on right
- ✅ Gray background

---

## 🐛 Common Issues & Solutions

### Issue: "View Tickets" button not appearing

**Cause:** Exam not activated

**Solution:** Only active exams show the button. Activate an exam first.

---

### Issue: Modal shows "No tickets found"

**Causes:**
1. Exam was activated with old system (before ticket update)
2. Exam has no enrolled students

**Solutions:**
1. Terminate and re-activate exam to use new ticket system
2. Enroll students in course first

---

### Issue: Modal loading forever

**Cause:** Network error or auth token expired

**Solution:** 
1. Check browser console for errors
2. Refresh page to get new token
3. Verify backend is running

---

### Issue: Search not working

**Cause:** May be searching wrong field

**Solution:** Search works on:
- Ticket numbers
- Student names  
- Candidate numbers

Try searching each of these.

---

### Issue: CSV export empty

**Cause:** No tickets in database

**Solution:** Activate an exam first to generate tickets

---

## ✅ Acceptance Criteria

Before marking as complete, verify:

- [ ] "View Tickets" button appears on active exams
- [ ] Modal opens when button is clicked
- [ ] Statistics cards show correct counts
- [ ] All tickets display in table
- [ ] Search filters tickets correctly
- [ ] Status filter works (all/available/used)
- [ ] Copy feature copies ticket numbers
- [ ] CSV export downloads successfully
- [ ] Modal closes properly
- [ ] UI is responsive on mobile
- [ ] Loading states work
- [ ] Error handling works (try with invalid exam ID)

---

## 📊 Sample Data for Testing

### Available Tickets Display
```
123456  Available  -               -           -              -
234567  Available  -               -           -              -
345678  Available  -               -           -              -
```

### Used Tickets Display
```
123456  Used  John Doe     ST2024001  Comp Sci  Oct 15, 3:00 PM
234567  Used  Jane Smith   ST2024002  Comp Sci  Oct 15, 3:05 PM
```

---

## 🚀 Next Steps After Testing

Once UI is verified:

1. ✅ **Test with real exam** - Activate exam and verify tickets generate
2. ✅ **Test student login** - Have student log in and verify ticket marked as used
3. ✅ **Test real-time updates** - Refresh modal after students log in
4. ✅ **Test CSV export** - Verify exported data is complete
5. ✅ **Get user feedback** - Ask level admins if UI is intuitive

---

## 📞 Quick Testing Commands

### Backend Check
```bash
# Check if tickets exist for exam 5
curl http://localhost:8000/api/exam-tickets/5 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Check (Browser Console)
```javascript
// Fetch tickets
fetch('/api/exam-tickets/5', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
})
.then(r => r.json())
.then(console.log)
```

---

## 🎓 Training for Level Admins

### Quick Guide for Users

**To view exam tickets:**
1. Go to Dashboard
2. Find active exam
3. Click blue "Tickets" button
4. View statistics and ticket list

**To give tickets to students:**
1. Open Tickets modal
2. Click "Copy Available"
3. Paste in text editor
4. Distribute to students

**To check exam progress:**
1. Open Tickets modal
2. Look at "Usage %" statistic
3. See how many students started

**To keep records:**
1. Open Tickets modal
2. Click "Export CSV"
3. Save file for your records

---

## ✨ Success Indicators

The UI is working correctly when you can:

✅ Open modal with one click
✅ See ticket statistics immediately  
✅ Search and find tickets quickly
✅ Copy available tickets to clipboard
✅ Export data to CSV
✅ Identify which students logged in
✅ Monitor exam progress in real-time

---

**Status:** Ready for Testing  
**Created:** October 15, 2025  
**Component:** ViewTicketsModal.jsx  
**Integration:** Dashboard.jsx
