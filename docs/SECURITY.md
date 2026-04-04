# Security Notes

## Overview

This document outlines security considerations and best practices for the Aero Fabrication Club Borrow Request System.

## Authentication & Authorization

### Google Sign-In
- **Public Page**: No authentication required (by design for ease of access)
- **Staff Portal**: Requires Google Sign-In with OAuth 2.0
- **Whitelist-Based Access**: Only pre-approved email addresses can access staff portal

### Role-Based Permissions

| Action | Resource Team | Admin |
|--------|--------------|-------|
| View Requests | ✓ | ✓ |
| Add Notes | ✓ | ✓ |
| Mark Returned | ✓ | ✓ |
| Delete Request | ✓ | ✓ |
| Undo Return | ✗ | ✓ |
| Delete Notes | ✗ | ✓ |
| Manage Users | ✗ | ✓ |
| Edit Settings | ✗ | ✓ |
| View Audit Log | ✗ | ✓ |
| Create Admins | ✗ | ✓ |

### Session Management
- Google handles session management
- No sensitive data stored in browser localStorage
- Sign-out clears session immediately

## Data Protection

### Sensitive Data Handling

**Personal Information Stored:**
- Borrower names
- Email addresses
- Phone numbers
- Roll numbers/IDs

**Protection Measures:**
1. **Access Control**: Only authenticated staff can view borrower data
2. **No Public Exposure**: Status check shows only request details, not full borrower info
3. **Audit Trail**: All access to requests is logged (via Google Apps Script execution logs)

### Data Privacy

1. **Purpose Limitation**: Data used only for inventory management
2. **Data Minimization**: Only collect necessary information
3. **Retention**: Configurable data retention policy
4. **Deletion**: Soft delete preserves audit trail

### Google Sheets Security

**Spreadsheet Permissions:**
- Set to "Restricted" (only specific people can access)
- Never share publicly
- Owner: Club admin account
- Editors: None (access only through Apps Script)

**Best Practices:**
1. Use a dedicated Google account for the club
2. Enable 2-factor authentication on owner account
3. Regularly review sharing settings
4. Use Google Drive's activity log to monitor access

## Apps Script Security

### Execution Permissions

**Deployment Settings:**
- Execute as: **Me** (script owner)
- Who has access: **Anyone**

This means:
- Script runs with owner's permissions
- Anyone can access public page
- But data access is controlled by authentication

### Script Permissions Required

The script needs these permissions:
- Google Sheets: Read/write to database spreadsheet
- External requests: None (no external APIs)
- User email: To verify identity

### Security Review Checklist

- [ ] No hardcoded credentials in code
- [ ] No logging of sensitive data
- [ ] No external API calls without validation
- [ ] Input validation on all user inputs
- [ ] SQL injection not applicable (using Sheets API)

## Input Validation

### Public Form Validation

**Client-Side (HTML5):**
- Required fields enforced
- Email format validation
- Phone number format
- Number fields (quantity, duration)

**Server-Side:**
- All inputs treated as untrusted
- Type checking (integers, strings)
- Length limits on text fields
- HTML escaping for display

### Injection Prevention

**No SQL Injection Risk:**
- Using Google Sheets API (no SQL)
- No direct query construction

**XSS Prevention:**
- User input escaped when displayed in HTML
- Template variables replaced safely
- No eval() or innerHTML with user data

**Command Injection:**
- No system commands executed
- No shell access from Apps Script

## Access Control

### Spreadsheet Access

**Protect Individual Sheets:**
1. Go to each sheet
2. Right-click → Protect sheet
3. Set permissions to "Only you can edit this range"
4. Exception: Allow Apps Script to edit

This prevents accidental manual edits while allowing script access.

### URL Security

**Web App URLs:**
- Public URL: `https://script.google.com/macros/s/{deployment-id}/exec`
- Cannot be guessed (deployment ID is random)
- Deploy URL can be regenerated if compromised

**Recommendation:**
- Use QR codes to distribute URLs
- If URL is compromised, create new deployment

## Audit & Monitoring

### Audit Log

**Logged Actions:**
- Return confirmations
- Request deletions
- Note deletions
- Settings changes
- User additions/removals

**Log Contents:**
- Who: Actor email and name
- What: Action type and details
- When: Timestamp (IST)
- Why: Optional reason
- Target: Request/Note/Setting ID

### Monitoring

**Apps Script Execution Logs:**
- View: Apps Script Editor → Executions
- Shows: All script runs, errors, duration
- Retention: 30 days

**Recommended Monitoring:**
1. Weekly review of AuditLog sheet
2. Check for unauthorized access attempts
3. Review execution logs for errors
4. Monitor unusual activity patterns

## Data Backup & Recovery

### Backup Strategy

**Automated:**
- Google Drive's version history (automatic)
- Restore previous versions: File → Version history

**Manual:**
- Use Backup feature in staff portal (JSON export)
- Schedule: Monthly minimum
- Store: Secure location (encrypted if possible)

### Recovery Procedures

**Accidental Deletion:**
1. Soft delete allows recovery
2. Admin can restore from AuditLog
3. Last resort: Restore from Google Drive version history

**Data Corruption:**
1. Restore from backup JSON
2. Or restore spreadsheet from version history

**Complete Loss:**
1. Create new spreadsheet
2. Run initializeSpreadsheet()
3. Restore data from JSON backup

## Compliance & Best Practices

### GDPR Considerations

If handling EU residents' data:
1. **Consent**: Get explicit consent for data collection
2. **Right to Access**: Provide data export on request
3. **Right to Deletion**: Hard delete on request (not just soft delete)
4. **Data Processing Agreement**: Document how data is processed

### Indian Data Protection

For Indian users (likely majority):
1. **Purpose Limitation**: Use data only for stated purpose
2. **Data Minimization**: Don't collect unnecessary information
3. **Security Safeguards**: Implement measures above
4. **Notification**: Inform borrowers how data is used

### Recommendations

1. **Privacy Notice**: Add to public page explaining:
   - What data is collected
   - How it's used
   - Who can access it
   - How long it's retained

2. **Terms of Use**: Simple statement on public page:
   ```
   By submitting this form, you agree that your information
   will be stored and used for inventory management purposes.
   Your data will be accessible to authorized club staff only.
   ```

## Incident Response

### Security Incident Procedure

**If unauthorized access detected:**
1. **Immediate**: Revoke access (remove from whitelist)
2. **Review**: Check AuditLog for affected requests
3. **Notify**: Inform affected borrowers if data was accessed
4. **Fix**: Close security gap
5. **Document**: Record incident and response

**If deployment URL leaked to malicious actors:**
1. Public page: No risk (designed to be public)
2. Staff page: Remove compromised users from whitelist
3. Create new deployment if needed
4. Update QR codes

### Contact Information

**Security Issues:**
- Email: [club admin email]
- Phone: [club phone number]

## Secure Development Practices

### Code Review

Before deploying updates:
1. Review all code changes
2. Test in development environment first
3. Check for security regressions
4. Verify permissions still appropriate

### Version Control

- Keep backup of previous working version
- Document changes in deployment description
- Test rollback procedure

## Known Limitations

### Not Provided

1. **CAPTCHA**: No bot protection on public form
   - Risk: Spam submissions
   - Mitigation: Monitor for unusual patterns, can add CAPTCHA if needed

2. **Rate Limiting**: No limits on submissions
   - Risk: DoS via many submissions
   - Mitigation: Google Apps Script has quotas (20,000 executions/day)

3. **Email Verification**: Borrower emails not verified
   - Risk: Fake email addresses
   - Mitigation: Staff can call phone number to verify

4. **End-to-End Encryption**: Data not encrypted at rest
   - Risk: Google admin could access data
   - Mitigation: Trust Google's security (industry standard)

### Accepted Risks

1. **Public form access**: Anyone can submit requests
   - Justified: Ease of access for borrowers
   - Control: Staff reviews all requests

2. **No approval workflow**: Requests are immediately active
   - Justified: Trust-based system
   - Control: Staff can delete fraudulent requests

## Future Security Enhancements

**Potential Improvements:**
1. Add CAPTCHA if spam becomes an issue
2. Email verification for borrowers
3. Two-factor authentication for admins
4. More granular permissions
5. IP-based rate limiting
6. Automated suspicious activity detection

## Conclusion

This system is designed for a small-scale, trust-based environment (club). Security measures are proportionate to the risk level and data sensitivity. For 100 requests/week from known community members, the implemented security is appropriate.

**Key Takeaway**: The main security relies on:
1. Whitelist-based staff access
2. Google's infrastructure security
3. Audit logging for accountability
4. Good operational practices (backup, monitoring, incident response)

---

**Document Version**: 1.0
**Last Updated**: 2026-04-04
**Next Review**: 2026-07-04 (Quarterly)
