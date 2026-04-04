/**
 * Aero Fabrication Club - Borrow Request System
 * Main Apps Script Code
 *
 * This is the entry point for the web application.
 * Deploy as Web App with "Execute as: Me" and "Who has access: Anyone"
 */

// Spreadsheet ID - REPLACE THIS with your actual spreadsheet ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// Sheet names
const SHEETS = {
  REQUESTS: 'Requests',
  REQUEST_ITEMS: 'RequestItems',
  NOTES: 'Notes',
  USERS: 'Users',
  SETTINGS: 'Settings',
  AUDIT_LOG: 'AuditLog'
};

// Roles
const ROLES = {
  ADMIN: 'Admin',
  RESOURCE_TEAM: 'Resource Team'
};

// Request statuses
const STATUS = {
  ACTIVE: 'Active',
  OVERDUE: 'Overdue',
  RETURNED: 'Returned Confirmed'
};

/**
 * Main entry point for GET requests
 * Routes to public or staff pages based on query parameter
 */
function doGet(e) {
  const page = e.parameter.page || 'public';

  if (page === 'staff') {
    return HtmlService.createHtmlOutputFromFile('Staff')
      .setTitle('Staff Portal - Aero Fabrication Club')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    return HtmlService.createHtmlOutputFromFile('Public')
      .setTitle('Borrow Request - Aero Fabrication Club')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
}

/**
 * Get spreadsheet
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

/**
 * Get sheet by name
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  return ss.getSheetByName(sheetName);
}

/**
 * Generate unique ID with format PREFIX-YYYYMMDD-NNNN
 */
function generateId(prefix) {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, 'Asia/Kolkata', 'yyyyMMdd');
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${dateStr}-${randomNum}`;
}

/**
 * Get IST datetime string
 */
function getISTDateTime(date) {
  if (!date) date = new Date();
  return Utilities.formatDate(date, 'Asia/Kolkata', "yyyy-MM-dd'T'HH:mm:ssXXX");
}

/**
 * Get end of day in IST (11:59 PM)
 */
function getEndOfDayIST(date) {
  const formatted = Utilities.formatDate(date, 'Asia/Kolkata', 'yyyy-MM-dd');
  return new Date(formatted + 'T23:59:00+05:30');
}

/**
 * Calculate due datetime from start and duration
 */
function calculateDueDateTime(startDateTime, durationDays) {
  const start = new Date(startDateTime);
  const due = new Date(start.getTime() + (durationDays * 24 * 60 * 60 * 1000));
  return getISTDateTime(getEndOfDayIST(due));
}

/**
 * Check if request is overdue
 */
function isOverdue(dueDateTimeStr, status) {
  if (status === STATUS.RETURNED) return false;
  const now = new Date();
  const due = new Date(dueDateTimeStr);
  return now > due;
}

/**
 * Get setting value
 */
function getSetting(key, defaultValue) {
  const sheet = getSheet(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return data[i][1] || defaultValue;
    }
  }

  return defaultValue;
}

/**
 * Set setting value
 */
function setSetting(key, value, description, userEmail) {
  const sheet = getSheet(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  const now = getISTDateTime();

  // Find existing setting
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      const oldValue = data[i][1];
      sheet.getRange(i + 1, 2).setValue(value);
      sheet.getRange(i + 1, 4).setValue(now);
      sheet.getRange(i + 1, 5).setValue(userEmail);

      // Log the change
      logAudit('setting_changed', 'setting', key, userEmail, '', {
        setting_key: key,
        old_value: oldValue,
        new_value: value
      });

      return;
    }
  }

  // Add new setting
  sheet.appendRow([key, value, description, now, userEmail]);
}

/**
 * Add audit log entry
 */
function logAudit(actionType, targetType, targetId, actorEmail, reason, details) {
  const sheet = getSheet(SHEETS.AUDIT_LOG);
  const logId = generateId('LOG');
  const actorName = getUserName(actorEmail) || actorEmail;
  const timestamp = getISTDateTime();
  const detailsJson = JSON.stringify(details || {});

  sheet.appendRow([
    logId,
    actionType,
    targetType,
    targetId,
    actorEmail,
    actorName,
    timestamp,
    detailsJson,
    reason || ''
  ]);
}

/**
 * Get user name from email
 */
function getUserName(email) {
  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return data[i][2];
    }
  }

  return null;
}

/**
 * Initialize spreadsheet with default data
 * Call this once after creating the spreadsheet
 */
function initializeSpreadsheet() {
  const ss = getSpreadsheet();

  // Create sheets if they don't exist
  Object.values(SHEETS).forEach(sheetName => {
    if (!ss.getSheetByName(sheetName)) {
      ss.insertSheet(sheetName);
    }
  });

  // Initialize Requests sheet
  const requestsSheet = getSheet(SHEETS.REQUESTS);
  if (requestsSheet.getLastRow() === 0) {
    requestsSheet.appendRow([
      'request_id', 'borrower_name', 'borrower_email', 'borrower_phone',
      'borrower_roll', 'borrower_type', 'borrower_other_details', 'purpose',
      'start_datetime', 'duration_days', 'due_datetime', 'status', 'item_count',
      'returned_confirmed_at', 'returned_confirmed_by', 'return_remarks',
      'is_archived', 'is_deleted', 'deleted_at', 'deleted_by', 'deletion_reason',
      'created_at', 'updated_at'
    ]);
  }

  // Initialize RequestItems sheet
  const itemsSheet = getSheet(SHEETS.REQUEST_ITEMS);
  if (itemsSheet.getLastRow() === 0) {
    itemsSheet.appendRow([
      'item_id', 'request_id', 'item_name', 'quantity', 'item_notes', 'created_at'
    ]);
  }

  // Initialize Notes sheet
  const notesSheet = getSheet(SHEETS.NOTES);
  if (notesSheet.getLastRow() === 0) {
    notesSheet.appendRow([
      'note_id', 'request_id', 'note_text', 'author_email', 'author_name',
      'created_at', 'is_deleted', 'deleted_at', 'deleted_by'
    ]);
  }

  // Initialize Users sheet
  const usersSheet = getSheet(SHEETS.USERS);
  if (usersSheet.getLastRow() === 0) {
    usersSheet.appendRow([
      'email', 'role', 'name', 'added_at', 'added_by', 'is_active'
    ]);
    // Add first admin - REPLACE WITH YOUR EMAIL
    usersSheet.appendRow([
      'your-email@example.com',
      ROLES.ADMIN,
      'System Admin',
      getISTDateTime(),
      'system',
      true
    ]);
  }

  // Initialize Settings sheet
  const settingsSheet = getSheet(SHEETS.SETTINGS);
  if (settingsSheet.getLastRow() === 0) {
    settingsSheet.appendRow([
      'setting_key', 'setting_value', 'description', 'updated_at', 'updated_by'
    ]);

    const defaultSettings = [
      ['club_name', 'Aero Fabrication Club', 'Name of the club'],
      ['club_email', 'aero.fab@iiitdmj.ac.in', 'Club email address'],
      ['logo_file_id', '', 'Google Drive file ID for club logo'],
      ['default_duration_days', '7', 'Default duration suggestion in days'],
      ['retention_policy', 'forever', 'Data retention policy'],
      ['retention_months', '12', 'Archive after N months'],
      ['email_subject_template', '[AERO INVENTORY] Borrow Declaration - {borrower_name} - {start_datetime}', 'Email subject template'],
      ['email_body_template', getDefaultEmailBodyTemplate(), 'Email body template']
    ];

    const now = getISTDateTime();
    defaultSettings.forEach(setting => {
      settingsSheet.appendRow([setting[0], setting[1], setting[2], now, 'system']);
    });
  }

  // Initialize AuditLog sheet
  const auditSheet = getSheet(SHEETS.AUDIT_LOG);
  if (auditSheet.getLastRow() === 0) {
    auditSheet.appendRow([
      'log_id', 'action_type', 'target_type', 'target_id', 'actor_email',
      'actor_name', 'timestamp', 'details', 'reason'
    ]);
  }

  Logger.log('Spreadsheet initialized successfully');
}

/**
 * Get default email body template
 */
function getDefaultEmailBodyTemplate() {
  return `Dear {club_name} Team,

I, {borrower_name}, hereby declare that I am borrowing the following items from the {club_name} inventory:

{items_list}

Borrower Details:
- Name: {borrower_name}
- Email: {borrower_email}
- Phone: {borrower_phone}
- Roll Number/ID: {borrower_roll}
- Type: {borrower_type}

Request Details:
- Request ID: {request_id}
- Purpose: {purpose}
- Start Date/Time: {start_datetime}
- Duration: {duration_days} days
- Due Date/Time: {due_datetime}

I acknowledge the following responsibilities:
1. I will take proper care of all borrowed items and ensure they are not damaged or misused.
2. I will return all items by the due date/time mentioned above in the same condition as received.
3. I understand that I am responsible for any loss or damage to the items during the borrowing period.
4. I will inform the club immediately if any item is lost or damaged.

Thank you for providing access to the club inventory.

Best regards,
{borrower_name}`;
}
