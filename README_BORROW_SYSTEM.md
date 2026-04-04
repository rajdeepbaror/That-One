# Aero Fabrication Club - Borrow Request System

A complete, production-ready inventory borrow request and tracking system built with Google Apps Script and Google Sheets. Completely free, no hosting costs, handles 100+ requests per week.

## 🚀 Features

### Public Landing Page (QR #1)
- **Borrow Request Form**: Mobile-first, branded interface
  - Borrower information collection
  - Free-text item names and quantities
  - Automatic request ID generation
  - Email template generation
- **Status Check**: Look up request status by Request ID
- **Dark Mode**: Automatic support for system preferences

### Staff Portal (QR #2)
- **Google Sign-In**: Secure, whitelisted email authentication
- **Role-Based Access**: Admin and Resource Team roles with different permissions
- **Dashboard**:
  - Real-time stats (Total, Active, Overdue, Returned)
  - Sortable request table
  - Advanced filters (status, search, date range)
  - Overdue requests prioritized
- **Request Management**:
  - View full request details
  - Mark as returned with remarks
  - Undo return confirmation (Admin only)
  - Delete requests with required reason
- **Internal Notes**: Staff-only timeline notes
- **User Management**: Add/remove staff members (Admin only)
- **Settings**: Customizable templates and configuration (Admin only)
- **Reports & Export**:
  - CSV export (one row per request OR one row per item)
  - Weekly/monthly reports
  - Top items and borrowers analytics
- **Backup**: Full data backup in JSON format (Admin only)

### Backend Features
- **Overdue Detection**: Automatic status updates based on due date (11:59 PM IST)
- **Audit Logging**: Complete history of all actions
- **Soft Deletes**: Data preservation with deletion tracking
- **Template Engine**: Variable replacement for email templates
- **Data Retention**: Configurable archive policies

## 📋 System Requirements

- Google account
- Access to Google Drive and Google Sheets
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 📦 Installation

See **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** for complete setup instructions.

### Quick Start

1. **Create Google Spreadsheet**
   ```
   1. Go to sheets.google.com
   2. Create new spreadsheet
   3. Note the Spreadsheet ID from URL
   ```

2. **Set Up Apps Script**
   ```
   1. Extensions > Apps Script
   2. Copy code from /apps-script/ folder
   3. Update SPREADSHEET_ID in Code.gs
   4. Run initializeSpreadsheet()
   ```

3. **Configure OAuth**
   ```
   1. Create OAuth Client ID in Google Cloud Console
   2. Update Client ID in Staff.html
   ```

4. **Deploy Web App**
   ```
   1. Deploy > New deployment
   2. Type: Web app
   3. Execute as: Me
   4. Access: Anyone
   ```

5. **Create QR Codes**
   ```
   Public: {web-app-url}?page=public
   Staff:  {web-app-url}?page=staff
   ```

## 📁 Project Structure

```
/apps-script/
  ├── Code.gs           # Main entry point, utilities
  ├── Auth.gs           # Authentication & authorization
  ├── DataAccess.gs     # CRUD operations
  ├── Utils.gs          # Templates, exports, reports
  ├── Public.html       # Public landing page
  └── Staff.html        # Staff portal

/docs/
  ├── DEPLOYMENT.md     # Step-by-step setup guide
  ├── SCHEMA.md         # Database schema documentation
  ├── TEST_PLAN.md      # Comprehensive test cases
  └── SECURITY.md       # Security notes and best practices

BORROW_SYSTEM_OVERVIEW.md  # System overview
README.md                    # This file
```

## 🗄️ Database Schema

The system uses a single Google Spreadsheet with 6 sheets:

1. **Requests**: Main request data (one row per request)
2. **RequestItems**: Line items (one row per item)
3. **Notes**: Internal staff notes
4. **Users**: Whitelisted staff with roles
5. **Settings**: Configuration and templates (key-value pairs)
6. **AuditLog**: Action history

See **[SCHEMA.md](docs/SCHEMA.md)** for detailed column definitions.

## 🔐 Security

- **Authentication**: Google Sign-In with OAuth 2.0
- **Authorization**: Whitelist-based access control
- **Role-Based Permissions**: Admin vs Resource Team
- **Audit Trail**: All sensitive actions logged
- **Data Protection**: Soft deletes, configurable retention
- **No External Dependencies**: All data stays in Google ecosystem

See **[SECURITY.md](docs/SECURITY.md)** for comprehensive security documentation.

## 🧪 Testing

Comprehensive test plan with 12 test suites covering:
- Public form submission and validation
- Authentication and authorization
- Dashboard and filtering
- Request management
- Notes and permissions
- User management
- Settings and templates
- Export and reports
- Backup
- Performance (100+ requests)
- Mobile responsiveness

See **[TEST_PLAN.md](docs/TEST_PLAN.md)** for all test cases.

## 📊 Technical Specifications

### Performance
- **Capacity**: Handles 100+ requests per week easily
- **Limits**: Google Sheets (5M cells), Apps Script (20K executions/day)
- **Latency**: Dashboard loads < 5 seconds with 100 requests
- **Concurrent Users**: Supports multiple simultaneous users

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Timezone
- All timestamps in IST (India Standard Time, UTC+5:30)
- Due dates at 11:59 PM IST

## 🎯 Use Cases

### For Borrowers
1. Scan QR code to open public page
2. Fill borrow request form
3. Get Request ID
4. Copy and email declaration
5. Check status anytime using Request ID

### For Resource Team
1. Sign in to staff portal
2. View all active/overdue requests
3. Add internal notes
4. Mark items as returned
5. Delete fraudulent requests

### For Admins
All Resource Team functions, plus:
- Manage staff users (add/remove)
- Edit email templates and settings
- Undo return confirmations
- Delete notes
- View audit logs
- Export data and create backups

## 🔄 Workflow

```
1. Borrower submits form
   ↓
2. Request created (Status: Active)
   ↓
3. Staff reviews on dashboard
   ↓
4. Borrower emails declaration
   ↓
5. Items are lent out
   ↓
6. [If past due date: Status becomes Overdue]
   ↓
7. Items returned
   ↓
8. Staff marks as "Returned Confirmed"
   ↓
9. Request complete
```

## 🛠️ Customization

### Email Templates
Customize subject and body with these variables:
- `{request_id}`, `{borrower_name}`, `{borrower_email}`
- `{borrower_phone}`, `{borrower_roll}`, `{borrower_type}`
- `{purpose}`, `{start_datetime}`, `{due_datetime}`
- `{duration_days}`, `{items_list}`, `{club_name}`

### Branding
- Upload logo to Google Drive
- Set logo file ID in Settings
- Customize club name
- Update colors in HTML/CSS if needed

### Retention Policy
- Keep forever (default)
- Or archive after N months
- Configurable in Settings

## 📈 Reports & Analytics

### Export Options
- **CSV**: One row per request OR one row per item
- **Date Range**: Filter by start date
- **Status Filter**: Export only Active/Overdue/Returned

### Reports
- **Weekly**: Monday-Sunday metrics
- **Monthly**: Calendar month metrics

**Metrics Include:**
- Total requests, returned count, active count, overdue count
- Most requested items (by count)
- Top borrowers (by request count)

## 🆘 Troubleshooting

### Common Issues

**"Access Denied" Error**
- Verify email is in Users sheet
- Check `is_active` is TRUE
- Ensure role is set

**Google Sign-In Not Working**
- Verify OAuth Client ID
- Check JavaScript origins include `https://script.google.com`
- Clear browser cache

**Requests Not Appearing**
- Check `is_deleted` is FALSE in Requests sheet
- Verify filters on dashboard
- Run `getRequests()` from Apps Script to test

**Email Template Not Working**
- Check Settings sheet for template
- Verify variable syntax: `{variable_name}`
- Test from Apps Script console

See **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** for more troubleshooting.

## 🔧 Maintenance

### Regular Tasks
- **Weekly**: Review overdue requests
- **Monthly**: Export backup
- **Quarterly**: Review audit logs, update users
- **As Needed**: Update templates, add staff

### Updating Code
1. Edit files in Apps Script
2. Save changes
3. Deploy > Manage deployments
4. Edit current deployment
5. New version with description

Web app URL remains the same.

## 📄 License

This is an educational project built for the Aero Fabrication Club at IIIT Delhi Murathganj.

## 🙏 Acknowledgments

Built with:
- Google Apps Script
- Google Sheets (database)
- Google Sign-In (authentication)
- HTML5, CSS3, JavaScript (frontend)

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT.md](docs/DEPLOYMENT.md) troubleshooting section
2. Review Google Apps Script documentation
3. Check execution logs for errors

## 🚦 Status

- ✅ Core functionality complete
- ✅ All requirements met
- ✅ Documentation complete
- ✅ Test plan ready
- ✅ Security reviewed
- ✅ Production-ready

## 📝 Changelog

### Version 1.0.0 (2026-04-04)
- Initial release
- Public borrow request form
- Staff portal with dashboard
- Request management
- User management
- Settings and templates
- Reports and exports
- Backup functionality
- Complete documentation

---

**Built for Aero Fabrication Club, IIITDMJ**
*Empowering makers through accessible inventory management* ✈️🔧
