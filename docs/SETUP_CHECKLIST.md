# Quick Setup Checklist

Use this checklist when deploying the Borrow Request System.

## ☐ Pre-Deployment

- [ ] Create Google Spreadsheet
- [ ] Note Spreadsheet ID: `_______________________`
- [ ] Create Google Cloud Project
- [ ] Enable Google+ API
- [ ] Create OAuth Client ID: `_______________________`

## ☐ Apps Script Setup

- [ ] Open Extensions > Apps Script from spreadsheet
- [ ] Create 6 files: Code.gs, Auth.gs, DataAccess.gs, Utils.gs, Public.html, Staff.html
- [ ] Copy code from repository to each file
- [ ] Update `SPREADSHEET_ID` in Code.gs
- [ ] Update admin email in `initializeSpreadsheet()` function
- [ ] Update OAuth Client ID in Staff.html
- [ ] Save all files

## ☐ Initialize Database

- [ ] Run `initializeSpreadsheet()` function
- [ ] Authorize script permissions
- [ ] Verify 6 sheets created in spreadsheet
- [ ] Check Users sheet has initial admin
- [ ] Verify Settings sheet has default values

## ☐ Deploy Web App

- [ ] Deploy > New deployment
- [ ] Type: Web app
- [ ] Execute as: Me
- [ ] Who has access: Anyone
- [ ] Click Deploy
- [ ] Copy Web App URL: `_______________________`

## ☐ Create QR Codes

- [ ] Generate QR for Public URL: `{url}?page=public`
- [ ] Generate QR for Staff URL: `{url}?page=staff`
- [ ] Print QR codes
- [ ] Test scanning with mobile device

## ☐ Configure Settings

- [ ] Upload club logo to Google Drive
- [ ] Note logo File ID: `_______________________`
- [ ] Sign in to Staff Portal as admin
- [ ] Go to Settings
- [ ] Set:
  - [ ] Club name
  - [ ] Club email
  - [ ] Logo File ID
  - [ ] Default duration
  - [ ] Email subject template
  - [ ] Email body template
- [ ] Save settings

## ☐ Add Staff Members

- [ ] Go to Manage Users
- [ ] Add each staff member:
  - [ ] Name: __________ Email: __________ Role: __________
  - [ ] Name: __________ Email: __________ Role: __________
  - [ ] Name: __________ Email: __________ Role: __________
  - [ ] Name: __________ Email: __________ Role: __________

## ☐ Testing

### Public Page
- [ ] Open public URL
- [ ] Verify club name and logo appear
- [ ] Submit test borrow request
- [ ] Verify Request ID generated
- [ ] Copy email template
- [ ] Use "Check Status" to find request
- [ ] Verify status shows correctly

### Staff Portal
- [ ] Sign in as admin
- [ ] Verify dashboard loads
- [ ] See test request in table
- [ ] Click request to view details
- [ ] Add a test note
- [ ] Mark request as returned
- [ ] Verify status updates

### Permissions
- [ ] Try signing in with non-whitelisted account (should fail)
- [ ] Sign in as Resource Team member
- [ ] Verify cannot access:
  - [ ] Manage Users
  - [ ] Settings
  - [ ] Backup
- [ ] Verify can access:
  - [ ] Dashboard
  - [ ] Request details
  - [ ] Add notes
  - [ ] Mark returned

## ☐ Production Deployment

- [ ] Delete all test requests
- [ ] Create backup of clean state
- [ ] Distribute QR codes to club
- [ ] Announce system to members
- [ ] Train staff on using portal
- [ ] Set up weekly review schedule

## ☐ Post-Deployment

- [ ] Monitor first 10 requests
- [ ] Verify email templates work correctly
- [ ] Check overdue detection after first due date
- [ ] Test export functionality with real data
- [ ] Create first weekly report
- [ ] Schedule first backup

## Troubleshooting Contacts

**Script Issues:**
- Google Apps Script Execution Logs: Extensions > Apps Script > Executions
- Google Cloud Console: https://console.cloud.google.com

**Common Issues:**
1. "Access Denied" → Check Users sheet, verify email and is_active
2. "Not authorized" → Re-authorize script permissions
3. Sign-in not working → Verify OAuth Client ID
4. Requests not showing → Check filters on dashboard

## Important URLs

- **Spreadsheet**: https://docs.google.com/spreadsheets/d/`{SPREADSHEET_ID}`/edit
- **Apps Script**: https://script.google.com
- **Google Cloud Console**: https://console.cloud.google.com
- **Public Page**: `{WEB_APP_URL}?page=public`
- **Staff Portal**: `{WEB_APP_URL}?page=staff`

## Notes

```
Deployment Date: _______________
Deployed By: _______________
Version: 1.0.0
```

---

✅ **All steps completed!** System is ready for production use.
