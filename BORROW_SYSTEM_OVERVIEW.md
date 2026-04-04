# Aero Fabrication Club - Borrow Request System

## System Overview

This is a complete, production-ready borrow request system for the Aero Fabrication Club (IIITDMJ) built using Google Apps Script and Google Sheets.

## Features

- **Public Landing Page**: QR-accessible borrow form with status check
- **Staff Portal**: Role-based access for Admin and Resource Team
- **Request Management**: Active/Overdue/Returned status tracking
- **Internal Notes**: Staff-only timeline notes
- **Return Confirmation**: Track return with timestamps and staff identity
- **Export & Reports**: CSV/PDF exports with weekly/monthly reports
- **Google Sign-In**: Whitelisted email authentication
- **Audit Log**: Complete history of actions

## Architecture

### Google Sheets Structure
Single spreadsheet with 6 sheets:
1. **Requests** - Main request data
2. **RequestItems** - Line items for each request
3. **Notes** - Internal staff notes
4. **Users** - Whitelisted staff with roles
5. **Settings** - Templates and configuration
6. **AuditLog** - Action history

### URLs
- **Public URL**: Landing page (borrow form + status check)
- **Staff URL**: Staff dashboard (requires Google Sign-In)

## File Structure

```
/apps-script/
  Code.gs           - Main Apps Script backend
  Public.html       - Public landing page
  Staff.html        - Staff portal
  Utils.gs          - Utility functions
  Auth.gs           - Authentication logic
  DataAccess.gs     - Sheet data operations
  Reports.gs        - Export and report generation

/docs/
  DEPLOYMENT.md     - Setup and deployment guide
  SCHEMA.md         - Detailed sheet schemas
  TEST_PLAN.md      - Testing guide
  SECURITY.md       - Security notes
```

## Quick Start

See `DEPLOYMENT.md` for complete setup instructions.

## Technology Stack

- **Backend**: Google Apps Script
- **Database**: Google Sheets
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Auth**: Google Sign-In (OAuth 2.0)
- **Hosting**: Apps Script Web App (completely free, no sleep)
