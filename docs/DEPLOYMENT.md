# Deployment Guide

## Prerequisites

- Google account
- Access to Google Drive and Google Sheets
- Basic understanding of Google Apps Script

## Step-by-Step Setup

### Step 1: Create the Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Rename it to **"Aero Fabrication Club - Borrow Requests"**
4. Note the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```
5. Copy this ID - you'll need it later

### Step 2: Set Up Google Apps Script Project

1. In your spreadsheet, go to **Extensions > Apps Script**
2. Delete any default code in `Code.gs`
3. Create the following script files by clicking the **+** button next to Files:
   - `Code.gs` (already exists)
   - `Auth.gs`
   - `DataAccess.gs`
   - `Utils.gs`
   - `Public.html`
   - `Staff.html`

4. Copy the contents from the `/apps-script/` folder in this repository to each corresponding file

### Step 3: Configure the Apps Script

1. In `Code.gs`, replace `YOUR_SPREADSHEET_ID_HERE` with your actual Spreadsheet ID:
   ```javascript
   const SPREADSHEET_ID = 'your-actual-spreadsheet-id';
   ```

2. In `Code.gs`, in the `initializeSpreadsheet()` function, replace the default admin email:
   ```javascript
   usersSheet.appendRow([
     'your-email@example.com',  // REPLACE with your Google email
     ROLES.ADMIN,
     'System Admin',
     getISTDateTime(),
     'system',
     true
   ]);
   ```

3. Save all files (Ctrl+S or Cmd+S)

### Step 4: Initialize the Spreadsheet

1. In the Apps Script editor, select the function `initializeSpreadsheet` from the dropdown at the top
2. Click **Run** (▶️ button)
3. You'll be asked to authorize the script:
   - Click **Review Permissions**
   - Choose your Google account
   - Click **Advanced** → **Go to [Project Name] (unsafe)**
   - Click **Allow**
4. Wait for the execution to complete (check the execution log)
5. Go back to your spreadsheet - you should now see 6 sheets created

### Step 5: Set Up Google OAuth Client ID (for Staff Portal)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Go to **APIs & Services > Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth 2.0 Client ID:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
   - Application type: **Web application**
   - Name: "Aero Fabrication Club Staff Portal"
   - Authorized JavaScript origins:
     ```
     https://script.google.com
     ```
   - Click **Create**
   - Copy the **Client ID** (format: `xxxxx.apps.googleusercontent.com`)

5. In `Staff.html`, replace the Client ID:
   ```javascript
   google.accounts.id.initialize({
     client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com', // REPLACE THIS
     callback: handleCredentialResponse
   });
   ```

### Step 6: Deploy as Web App

1. In the Apps Script editor, click **Deploy > New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Fill in the details:
   - **Description**: "Borrow Request System"
   - **Execute as**: **Me** (your email)
   - **Who has access**: **Anyone**
5. Click **Deploy**
6. Copy both URLs:
   - **Web app URL** - This is your main URL
   - You'll use query parameters to access different pages

### Step 7: Create QR Codes

You'll need 2 QR codes:

#### QR Code #1: Public Landing Page
- URL: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?page=public`
- Or simply: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`
- Generate QR at: [QR Code Generator](https://www.qr-code-generator.com/)

#### QR Code #2: Staff Portal
- URL: `https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec?page=staff`
- Generate QR at: [QR Code Generator](https://www.qr-code-generator.com/)

### Step 8: Upload Club Logo (Optional)

1. Upload your club logo to Google Drive
2. Right-click the file → Get link → Set to "Anyone with the link can view"
3. Copy the file ID from the URL:
   ```
   https://drive.google.com/file/d/[FILE_ID]/view
   ```
4. Go to Staff Portal > Settings
5. Paste the File ID in the "Logo File ID" field
6. Save settings

### Step 9: Configure Email Templates (Optional)

1. Go to Staff Portal > Settings
2. Customize:
   - Club name
   - Club email address
   - Email subject template
   - Email body template
3. Use these variables in templates:
   - `{request_id}`
   - `{borrower_name}`, `{borrower_email}`, `{borrower_phone}`, `{borrower_roll}`
   - `{borrower_type}`, `{borrower_other_details}`
   - `{purpose}`
   - `{start_datetime}`, `{duration_days}`, `{due_datetime}`
   - `{items_list}`
   - `{club_name}`

### Step 10: Add Staff Members

1. Sign in to Staff Portal with your admin account
2. Go to **Manage Users**
3. Click **Add User**
4. Enter:
   - Email (must be a Google account)
   - Name
   - Role (Admin or Resource Team)
5. Click **Add User**

## Testing

### Test Public Landing Page

1. Open the public URL (QR Code #1)
2. Fill out the borrow form with test data
3. Submit and verify you receive a Request ID
4. Copy the email template
5. Use "Check Status" to verify the request appears

### Test Staff Portal

1. Open the staff URL (QR Code #2)
2. Sign in with a whitelisted Google account
3. Verify the dashboard shows the test request
4. Click on the request to view details
5. Test actions:
   - Add a note
   - Mark as returned
   - Export to CSV

## Troubleshooting

### Script Not Running

- Check execution logs in Apps Script: **View > Logs**
- Verify the spreadsheet ID is correct
- Ensure you've authorized the script

### Google Sign-In Not Working

- Verify OAuth Client ID is correct
- Check that JavaScript origins include `https://script.google.com`
- Clear browser cache and try again

### "Access Denied" Error

- Verify the user's email is in the Users sheet
- Check that `is_active` is TRUE
- Ensure the role is set correctly

### Requests Not Appearing

- Check the Requests sheet directly for data
- Verify `is_deleted` is FALSE
- Run `getRequests()` from Apps Script to test

### Email Template Not Working

- Check Settings sheet for template
- Verify all variables use correct syntax: `{variable_name}`
- Test template generation from Apps Script console

## Updates and Maintenance

### Updating the Code

1. Go to Apps Script editor
2. Update the relevant `.gs` or `.html` files
3. Save changes
4. Deploy > Manage deployments
5. Click ✏️ edit icon on current deployment
6. Create new version with description
7. Deploy

Note: The web app URL remains the same

### Regular Maintenance

- **Weekly**: Check for overdue requests
- **Monthly**: Export data as backup
- **Quarterly**: Review audit logs
- **As needed**: Update email templates, add users, adjust settings

## Security Best Practices

1. **Limit Admin Access**: Only grant Admin role to trusted staff
2. **Regular Audits**: Review the AuditLog sheet periodically
3. **Backup Data**: Use the Backup feature monthly
4. **Review Users**: Remove inactive staff from Users sheet
5. **Monitor Access**: Check Apps Script execution logs for unusual activity

## Performance Optimization

For 100+ requests per week:
- The system should handle this easily
- If performance degrades, consider archiving old requests (use the archive feature)
- Google Sheets limit: 5 million cells - you're far from this with 100 requests/week

## Support

For issues:
1. Check the troubleshooting section above
2. Review Google Apps Script documentation
3. Check execution logs for error messages
4. Verify all setup steps were completed

## Next Steps

After deployment:
1. Print QR codes and place them in the club
2. Train staff on using the Staff Portal
3. Announce the system to potential borrowers
4. Monitor the first few requests closely
5. Gather feedback and adjust templates/settings as needed
