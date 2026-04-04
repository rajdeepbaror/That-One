/**
 * Utility Functions
 * Helper functions for template processing, exports, etc.
 */

/**
 * Replace template variables in text
 */
function replaceTemplateVariables(template, data) {
  let result = template;

  const variables = {
    '{request_id}': data.request_id || '',
    '{borrower_name}': data.borrower_name || '',
    '{borrower_email}': data.borrower_email || '',
    '{borrower_phone}': data.borrower_phone || '',
    '{borrower_roll}': data.borrower_roll || '',
    '{borrower_type}': data.borrower_type || '',
    '{borrower_other_details}': data.borrower_other_details || '',
    '{purpose}': data.purpose || '',
    '{start_datetime}': formatDateTimeForEmail(data.start_datetime),
    '{duration_days}': data.duration_days ? data.duration_days.toString() : '',
    '{due_datetime}': formatDateTimeForEmail(data.due_datetime),
    '{club_name}': getSetting('club_name', 'Aero Fabrication Club'),
    '{items_list}': formatItemsList(data.items || [])
  };

  Object.keys(variables).forEach(key => {
    result = result.replace(new RegExp(key.replace(/[{}]/g, '\\$&'), 'g'), variables[key]);
  });

  return result;
}

/**
 * Format datetime for email display
 */
function formatDateTimeForEmail(dateTimeStr) {
  if (!dateTimeStr) return '';

  try {
    const date = new Date(dateTimeStr);
    return Utilities.formatDate(date, 'Asia/Kolkata', 'dd MMM yyyy, hh:mm a');
  } catch (e) {
    return dateTimeStr;
  }
}

/**
 * Format items list as bullet points for email
 */
function formatItemsList(items) {
  if (!items || items.length === 0) return '(No items)';

  let formatted = '';
  items.forEach(item => {
    formatted += `• ${item.item_name} (Quantity: ${item.quantity})`;
    if (item.item_notes) {
      formatted += ` - ${item.item_notes}`;
    }
    formatted += '\n';
  });

  return formatted.trim();
}

/**
 * Generate email content from template
 */
function generateEmailContent(requestData) {
  const subjectTemplate = getSetting('email_subject_template',
    '[AERO INVENTORY] Borrow Declaration - {borrower_name} - {start_datetime}');
  const bodyTemplate = getSetting('email_body_template', getDefaultEmailBodyTemplate());

  const subject = replaceTemplateVariables(subjectTemplate, requestData);
  const body = replaceTemplateVariables(bodyTemplate, requestData);
  const clubEmail = getSetting('club_email', 'aero.fab@iiitdmj.ac.in');

  return {
    to: clubEmail,
    subject: subject,
    body: body
  };
}

/**
 * Get settings for public page
 */
function getPublicSettings() {
  return {
    club_name: getSetting('club_name', 'Aero Fabrication Club'),
    logo_file_id: getSetting('logo_file_id', ''),
    default_duration_days: parseInt(getSetting('default_duration_days', '7'))
  };
}

/**
 * Get all settings (Admin only)
 */
function getAllSettings() {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('edit_settings', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  const sheet = getSheet(SHEETS.SETTINGS);
  const data = sheet.getDataRange().getValues();
  const settings = {};

  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = {
      value: data[i][1],
      description: data[i][2],
      updated_at: data[i][3],
      updated_by: data[i][4]
    };
  }

  return { success: true, settings: settings };
}

/**
 * Update settings (Admin only)
 */
function updateSettings(settingsData) {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('edit_settings', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  try {
    Object.keys(settingsData).forEach(key => {
      setSetting(key, settingsData[key], '', actorEmail);
    });

    return { success: true };
  } catch (error) {
    Logger.log('Error updating settings: ' + error);
    return { success: false, error: 'Failed to update settings' };
  }
}

/**
 * Export requests to CSV
 */
function exportRequestsToCSV(filters, mode) {
  if (!hasPermission('export_data')) {
    return { success: false, error: 'Permission denied' };
  }

  const result = getRequests(filters);
  if (!result.success) return result;

  let csv = '';

  if (mode === 'one_row_per_request') {
    // Header
    csv = 'Request ID,Borrower Name,Email,Phone,Roll,Type,Purpose,Start Date,Due Date,Status,Items,Returned At,Returned By\n';

    // Data rows
    result.requests.forEach(req => {
      const items = getRequestItems(req.request_id);
      const itemsStr = items.map(i => `${i.item_name} (${i.quantity})`).join('; ');

      csv += `"${req.request_id}","${req.borrower_name}","${req.borrower_email}","${req.borrower_phone}","${req.borrower_roll}","${req.borrower_type}","${req.purpose}","${req.start_datetime}","${req.due_datetime}","${req.status}","${itemsStr}","${req.returned_confirmed_at || ''}","${req.returned_confirmed_by || ''}"\n`;
    });
  } else {
    // one_row_per_item mode
    csv = 'Request ID,Borrower Name,Email,Phone,Roll,Type,Purpose,Start Date,Due Date,Status,Item Name,Quantity,Item Notes,Returned At,Returned By\n';

    result.requests.forEach(req => {
      const items = getRequestItems(req.request_id);
      items.forEach(item => {
        csv += `"${req.request_id}","${req.borrower_name}","${req.borrower_email}","${req.borrower_phone}","${req.borrower_roll}","${req.borrower_type}","${req.purpose}","${req.start_datetime}","${req.due_datetime}","${req.status}","${item.item_name}","${item.quantity}","${item.item_notes || ''}","${req.returned_confirmed_at || ''}","${req.returned_confirmed_by || ''}"\n`;
      });
    });
  }

  return {
    success: true,
    csv: csv,
    filename: `borrow_requests_${Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd_HHmmss')}.csv`
  };
}

/**
 * Generate weekly/monthly report data
 */
function generateReport(reportType, startDate, endDate) {
  if (!hasPermission('export_data')) {
    return { success: false, error: 'Permission denied' };
  }

  const filters = {
    start_date: startDate,
    end_date: endDate,
    exclude_archived: false
  };

  const result = getRequests(filters);
  if (!result.success) return result;

  const requests = result.requests;

  // Calculate metrics
  const totalRequests = requests.length;
  const returnedCount = requests.filter(r => r.status === STATUS.RETURNED).length;
  const activeCount = requests.filter(r => r.status === STATUS.ACTIVE).length;
  const overdueCount = requests.filter(r => r.status === STATUS.OVERDUE).length;

  // Most requested items
  const itemCounts = {};
  requests.forEach(req => {
    const items = getRequestItems(req.request_id);
    items.forEach(item => {
      itemCounts[item.item_name] = (itemCounts[item.item_name] || 0) + 1;
    });
  });

  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ item_name: name, count: count }));

  // Top borrowers
  const borrowerCounts = {};
  requests.forEach(req => {
    const key = req.borrower_email;
    if (!borrowerCounts[key]) {
      borrowerCounts[key] = {
        name: req.borrower_name,
        email: req.borrower_email,
        count: 0
      };
    }
    borrowerCounts[key].count++;
  });

  const topBorrowers = Object.values(borrowerCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    success: true,
    report: {
      type: reportType,
      start_date: startDate,
      end_date: endDate,
      metrics: {
        total_requests: totalRequests,
        returned_count: returnedCount,
        active_count: activeCount,
        overdue_count: overdueCount
      },
      top_items: topItems,
      top_borrowers: topBorrowers
    }
  };
}

/**
 * Get week start/end dates (Monday-Sunday)
 */
function getWeekDates(weekOffset) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek; // Monday

  const monday = new Date(now);
  monday.setDate(now.getDate() + diff + (weekOffset * 7));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: getISTDateTime(monday),
    end: getISTDateTime(sunday)
  };
}

/**
 * Get month start/end dates
 */
function getMonthDates(monthOffset) {
  const now = new Date();
  const month = now.getMonth() + monthOffset;
  const year = now.getFullYear() + Math.floor(month / 12);
  const adjustedMonth = ((month % 12) + 12) % 12;

  const start = new Date(year, adjustedMonth, 1, 0, 0, 0, 0);
  const end = new Date(year, adjustedMonth + 1, 0, 23, 59, 59, 999);

  return {
    start: getISTDateTime(start),
    end: getISTDateTime(end)
  };
}

/**
 * Create backup of all data (Admin only)
 */
function createBackup() {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('edit_settings', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  try {
    const ss = getSpreadsheet();
    const backupData = {};

    Object.values(SHEETS).forEach(sheetName => {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        backupData[sheetName] = sheet.getDataRange().getValues();
      }
    });

    const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd_HHmmss');
    const filename = `AeroFab_Backup_${timestamp}.json`;

    return {
      success: true,
      data: JSON.stringify(backupData, null, 2),
      filename: filename
    };
  } catch (error) {
    Logger.log('Error creating backup: ' + error);
    return { success: false, error: 'Failed to create backup' };
  }
}
