# Test Plan

## Test Environment Setup

1. Create a test Google Spreadsheet following deployment guide
2. Initialize with sample data
3. Create test user accounts for different roles

## Sample Test Data

### Test Users

| Email | Role | Name |
|-------|------|------|
| admin@example.com | Admin | Test Admin |
| staff1@example.com | Resource Team | Staff Member 1 |
| staff2@example.com | Resource Team | Staff Member 2 |

### Test Borrowers

| Name | Email | Phone | Roll | Type |
|------|-------|-------|------|------|
| Rahul Kumar | rahul.k@student.ac.in | +91-9876543210 | 2021BCS001 | IIITDMJ Student |
| Priya Singh | priya.s@student.ac.in | +91-9876543211 | 2022BEC042 | IIITDMJ Student |
| Dr. Anil Sharma | anil.sharma@iiitdmj.ac.in | +91-9876543212 | FAC-ENG-101 | IIITDMJ Staff |
| External User | external@company.com | +91-9876543213 | EXT-001 | External / Other |

### Test Items

- Arduino Uno R3
- Raspberry Pi 4
- 3D Printer Filament (PLA)
- Soldering Iron Kit
- Multimeter
- Oscilloscope
- Breadboard
- Jumper Wires Set
- Power Supply Unit
- Hot Glue Gun

## Test Cases

### 1. Public Landing Page Tests

#### TC-1.1: Borrow Form Submission (Valid)
**Steps:**
1. Open public landing page
2. Fill all required fields with valid data
3. Add 3 items with quantities
4. Submit form

**Expected Result:**
- Success message displays
- Request ID is generated (format: REQ-YYYYMMDD-NNNN)
- Start date/time shows current time (IST)
- Due date shows correct calculation
- Email template is displayed
- Can copy email to clipboard

**Status:** [ ] Pass [ ] Fail

#### TC-1.2: Borrow Form Validation
**Steps:**
1. Try to submit form without filling required fields
2. Try to submit with invalid email
3. Try to submit with quantity = 0
4. Try to submit without any items

**Expected Result:**
- Browser validation prevents submission
- Appropriate error messages shown

**Status:** [ ] Pass [ ] Fail

#### TC-1.3: Status Check (Valid Request ID)
**Steps:**
1. Click "Check Status"
2. Enter a valid Request ID
3. Submit

**Expected Result:**
- Request details displayed
- Status badge shown correctly
- Items list displayed
- Start and due dates shown
- NO internal notes visible

**Status:** [ ] Pass [ ] Fail

#### TC-1.4: Status Check (Invalid Request ID)
**Steps:**
1. Click "Check Status"
2. Enter invalid Request ID
3. Submit

**Expected Result:**
- Error message: "Request not found"

**Status:** [ ] Pass [ ] Fail

#### TC-1.5: Dark Mode Support
**Steps:**
1. Enable dark mode in OS/browser
2. Reload public page

**Expected Result:**
- Page switches to dark theme
- All elements remain readable
- Contrast is maintained

**Status:** [ ] Pass [ ] Fail

### 2. Authentication Tests

#### TC-2.1: Staff Portal - Whitelisted User Login
**Steps:**
1. Open staff portal URL
2. Click Google Sign-In
3. Sign in with whitelisted account

**Expected Result:**
- Successfully signed in
- Main dashboard displays
- User name and role shown in sidebar

**Status:** [ ] Pass [ ] Fail

#### TC-2.2: Staff Portal - Non-Whitelisted User Login
**Steps:**
1. Open staff portal URL
2. Sign in with non-whitelisted Google account

**Expected Result:**
- Error message: "Access denied. Your email is not whitelisted."
- Remains on login screen

**Status:** [ ] Pass [ ] Fail

#### TC-2.3: Staff Portal - Sign Out
**Steps:**
1. Sign in successfully
2. Click "Sign Out" in sidebar

**Expected Result:**
- Signed out successfully
- Redirected to login screen

**Status:** [ ] Pass [ ] Fail

### 3. Dashboard Tests

#### TC-3.1: View All Requests
**Steps:**
1. Sign in as Resource Team member
2. View dashboard

**Expected Result:**
- All non-deleted requests shown
- Stats cards display correct counts
- Table shows: Request ID, Borrower, Phone, Type, Dates, Status, Item count
- Overdue requests appear first
- Then due soon
- Then others

**Status:** [ ] Pass [ ] Fail

#### TC-3.2: Filter by Status
**Steps:**
1. Set status filter to "Active"
2. Apply filter

**Expected Result:**
- Only Active requests shown
- Stats update accordingly

**Status:** [ ] Pass [ ] Fail

#### TC-3.3: Search Functionality
**Steps:**
1. Enter borrower name in search box
2. Wait for results

**Expected Result:**
- Only matching requests shown
- Search works on: name, email, phone, request ID

**Status:** [ ] Pass [ ] Fail

#### TC-3.4: Date Range Filter
**Steps:**
1. Set start date
2. Set end date
3. Apply filters

**Expected Result:**
- Only requests in date range shown

**Status:** [ ] Pass [ ] Fail

#### TC-3.5: Refresh Dashboard
**Steps:**
1. Click Refresh button

**Expected Result:**
- Data reloads from server
- Stats update
- Table refreshes

**Status:** [ ] Pass [ ] Fail

### 4. Request Detail Tests

#### TC-4.1: View Request Details
**Steps:**
1. Click on any request row in dashboard

**Expected Result:**
- Modal opens with full request details
- All borrower fields shown
- All items listed with quantities
- Internal notes displayed (if any)
- Action buttons shown based on status and role

**Status:** [ ] Pass [ ] Fail

#### TC-4.2: Mark Request as Returned (Resource Team)
**Steps:**
1. Open Active request
2. Click "Mark Returned Confirmed"
3. Enter optional remarks
4. Confirm

**Expected Result:**
- Status changes to "Returned Confirmed"
- Timestamp and staff identity recorded
- Success message shown
- Dashboard updates

**Status:** [ ] Pass [ ] Fail

#### TC-4.3: Undo Return (Admin Only)
**Steps:**
1. Sign in as Admin
2. Open Returned request
3. Click "Undo Return"
4. Confirm

**Expected Result:**
- Status changes back to Active or Overdue (based on due date)
- Return info cleared
- Dashboard updates

**Status:** [ ] Pass [ ] Fail

#### TC-4.4: Undo Return (Resource Team - Should Fail)
**Steps:**
1. Sign in as Resource Team
2. Open Returned request

**Expected Result:**
- "Undo Return" button NOT visible

**Status:** [ ] Pass [ ] Fail

#### TC-4.5: Delete Request
**Steps:**
1. Open any request
2. Click "Delete Request"
3. Enter deletion reason
4. Confirm

**Expected Result:**
- Request soft-deleted (is_deleted = TRUE)
- Disappears from dashboard
- Audit log entry created
- Reason stored

**Status:** [ ] Pass [ ] Fail

#### TC-4.6: Delete Request (No Reason)
**Steps:**
1. Click "Delete Request"
2. Leave reason blank
3. Try to confirm

**Expected Result:**
- Error: "Deletion reason is required"

**Status:** [ ] Pass [ ] Fail

### 5. Notes Tests

#### TC-5.1: Add Note (Resource Team)
**Steps:**
1. Open request
2. Click "Add Note"
3. Enter note text
4. Submit

**Expected Result:**
- Note appears in timeline
- Author name and timestamp shown
- Note text displayed correctly

**Status:** [ ] Pass [ ] Fail

#### TC-5.2: Delete Note (Admin)
**Steps:**
1. Sign in as Admin
2. Open request with notes
3. Click "Delete" on a note
4. Confirm

**Expected Result:**
- Note soft-deleted
- Disappears from timeline

**Status:** [ ] Pass [ ] Fail

#### TC-5.3: Delete Note (Resource Team - Should Fail)
**Steps:**
1. Sign in as Resource Team
2. Open request with notes

**Expected Result:**
- Delete button NOT visible on notes

**Status:** [ ] Pass [ ] Fail

### 6. Overdue Logic Tests

#### TC-6.1: Request Becomes Overdue
**Steps:**
1. Create request with duration = 0 days
2. Wait for due datetime to pass
3. Refresh dashboard

**Expected Result:**
- Status changes from Active to Overdue
- Status badge shows red
- Request appears in "Overdue" section at top

**Status:** [ ] Pass [ ] Fail

#### TC-6.2: Return Overdue Request
**Steps:**
1. Mark overdue request as returned

**Expected Result:**
- Status changes to "Returned Confirmed"
- No longer shows as overdue

**Status:** [ ] Pass [ ] Fail

### 7. User Management Tests (Admin Only)

#### TC-7.1: Add New User
**Steps:**
1. Sign in as Admin
2. Go to Manage Users
3. Click "Add User"
4. Fill email, name, role
5. Submit

**Expected Result:**
- User added to Users sheet
- Appears in users table
- Can now sign in to staff portal

**Status:** [ ] Pass [ ] Fail

#### TC-7.2: Add Duplicate User
**Steps:**
1. Try to add user with existing email

**Expected Result:**
- Error: "User already exists"

**Status:** [ ] Pass [ ] Fail

#### TC-7.3: Remove User
**Steps:**
1. Click "Remove" on a user
2. Confirm

**Expected Result:**
- User's is_active set to FALSE
- User can no longer sign in
- Still appears in table as "Inactive"

**Status:** [ ] Pass [ ] Fail

#### TC-7.4: Cannot Remove Self
**Steps:**
1. Try to remove your own account

**Expected Result:**
- Remove button not visible OR
- Error: "Cannot remove yourself"

**Status:** [ ] Pass [ ] Fail

#### TC-7.5: View Users (Resource Team - Should Fail)
**Steps:**
1. Sign in as Resource Team
2. Click "Manage Users"

**Expected Result:**
- Warning: "Admin access required"

**Status:** [ ] Pass [ ] Fail

### 8. Settings Tests (Admin Only)

#### TC-8.1: Update Settings
**Steps:**
1. Sign in as Admin
2. Go to Settings
3. Modify club name, email, templates
4. Save

**Expected Result:**
- Settings saved
- Changes reflected in public page
- Email templates use new values

**Status:** [ ] Pass [ ] Fail

#### TC-8.2: Template Variables
**Steps:**
1. Create a request
2. Check generated email

**Expected Result:**
- All variables replaced correctly:
  - {request_id} → actual ID
  - {borrower_name} → actual name
  - {items_list} → formatted bullet list

**Status:** [ ] Pass [ ] Fail

#### TC-8.3: View Settings (Resource Team - Should Fail)
**Steps:**
1. Sign in as Resource Team
2. Click "Settings"

**Expected Result:**
- Warning: "Admin access required"

**Status:** [ ] Pass [ ] Fail

### 9. Export and Reports Tests

#### TC-9.1: Export CSV (One Row Per Request)
**Steps:**
1. Go to Reports & Export
2. Select "One row per request"
3. Click "Export to CSV"

**Expected Result:**
- CSV file downloads
- One row per request
- Items shown as comma-separated in one cell

**Status:** [ ] Pass [ ] Fail

#### TC-9.2: Export CSV (One Row Per Item)
**Steps:**
1. Select "One row per item"
2. Click "Export to CSV"

**Expected Result:**
- CSV file downloads
- Request repeated for each item
- Each item on separate row

**Status:** [ ] Pass [ ] Fail

#### TC-9.3: Weekly Report
**Steps:**
1. Click "This Week"
2. View results

**Expected Result:**
- Report shows this week's data (Monday-Sunday)
- Metrics: total, active, overdue, returned
- Top items listed
- Top borrowers listed

**Status:** [ ] Pass [ ] Fail

#### TC-9.4: Monthly Report
**Steps:**
1. Click "This Month"
2. View results

**Expected Result:**
- Report shows current month's data
- Same metrics and lists as weekly

**Status:** [ ] Pass [ ] Fail

### 10. Backup Tests (Admin Only)

#### TC-10.1: Download Backup
**Steps:**
1. Sign in as Admin
2. Go to Backup
3. Click "Download Full Backup"

**Expected Result:**
- JSON file downloads
- Contains all sheet data
- Filename includes timestamp

**Status:** [ ] Pass [ ] Fail

### 11. Performance Tests

#### TC-11.1: Load 100 Requests
**Steps:**
1. Create 100 test requests
2. Open dashboard

**Expected Result:**
- Dashboard loads in < 5 seconds
- All data displays correctly
- No errors

**Status:** [ ] Pass [ ] Fail

#### TC-11.2: Search with Many Requests
**Steps:**
1. With 100+ requests loaded
2. Perform search

**Expected Result:**
- Search completes in < 2 seconds
- Correct results shown

**Status:** [ ] Pass [ ] Fail

### 12. Mobile Responsiveness Tests

#### TC-12.1: Public Page on Mobile
**Steps:**
1. Open public page on mobile device
2. Fill out form

**Expected Result:**
- Form is usable
- All fields accessible
- Submit button reachable
- No horizontal scrolling

**Status:** [ ] Pass [ ] Fail

#### TC-12.2: Staff Portal on Mobile
**Steps:**
1. Sign in on mobile
2. View dashboard
3. Open request details

**Expected Result:**
- Sidebar adapts to mobile
- Table scrolls horizontally if needed
- Modal displays correctly
- All actions accessible

**Status:** [ ] Pass [ ] Fail

## Test Execution Schedule

1. **Pre-Deployment**: Run TC-1.* through TC-8.*
2. **Post-Deployment**: Run all test cases
3. **Weekly**: Run TC-11.* (performance)
4. **Monthly**: Full regression (all TCs)

## Bug Reporting Template

```
Bug ID: BUG-NNNN
Test Case: TC-X.Y
Severity: Critical / High / Medium / Low
Description: [What went wrong]
Steps to Reproduce:
1. ...
2. ...
Expected Result: [What should happen]
Actual Result: [What actually happened]
Screenshots: [If applicable]
Environment: [Browser, device, etc.]
```

## Test Sign-Off

Tester Name: ___________________
Date: ___________________
Signature: ___________________

Pass Rate: _____ / _____ tests passed
