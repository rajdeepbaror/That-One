/**
 * Data Access Layer
 * Handles all CRUD operations for requests, items, and notes
 */

/**
 * Create a new borrow request (PUBLIC - no auth required)
 */
function createBorrowRequest(requestData) {
  try {
    const requestId = generateId('REQ');
    const now = getISTDateTime();
    const startDateTime = now;
    const dueDateTime = calculateDueDateTime(startDateTime, requestData.duration_days);

    const requestsSheet = getSheet(SHEETS.REQUESTS);

    // Add main request row
    requestsSheet.appendRow([
      requestId,
      requestData.borrower_name,
      requestData.borrower_email,
      requestData.borrower_phone,
      requestData.borrower_roll,
      requestData.borrower_type,
      requestData.borrower_other_details || '',
      requestData.purpose,
      startDateTime,
      requestData.duration_days,
      dueDateTime,
      STATUS.ACTIVE,
      requestData.items.length,
      '', // returned_confirmed_at
      '', // returned_confirmed_by
      '', // return_remarks
      false, // is_archived
      false, // is_deleted
      '', // deleted_at
      '', // deleted_by
      '', // deletion_reason
      now, // created_at
      now  // updated_at
    ]);

    // Add items
    const itemsSheet = getSheet(SHEETS.REQUEST_ITEMS);
    requestData.items.forEach(item => {
      const itemId = generateId('ITEM');
      itemsSheet.appendRow([
        itemId,
        requestId,
        item.item_name,
        item.quantity,
        item.item_notes || '',
        now
      ]);
    });

    return {
      success: true,
      request_id: requestId,
      start_datetime: startDateTime,
      due_datetime: dueDateTime
    };
  } catch (error) {
    Logger.log('Error creating request: ' + error);
    return {
      success: false,
      error: 'Failed to create request: ' + error.message
    };
  }
}

/**
 * Get request by ID (PUBLIC for status check)
 */
function getRequestById(requestId, includeNotes = false) {
  const requestsSheet = getSheet(SHEETS.REQUESTS);
  const data = requestsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === requestId && !data[i][17]) { // not deleted
      const request = {
        request_id: data[i][0],
        borrower_name: data[i][1],
        borrower_email: data[i][2],
        borrower_phone: data[i][3],
        borrower_roll: data[i][4],
        borrower_type: data[i][5],
        borrower_other_details: data[i][6],
        purpose: data[i][7],
        start_datetime: data[i][8],
        duration_days: data[i][9],
        due_datetime: data[i][10],
        status: data[i][11],
        item_count: data[i][12],
        returned_confirmed_at: data[i][13],
        returned_confirmed_by: data[i][14],
        return_remarks: data[i][15],
        is_archived: data[i][16]
      };

      // Update status if overdue
      if (isOverdue(request.due_datetime, request.status)) {
        request.status = STATUS.OVERDUE;
        requestsSheet.getRange(i + 1, 12).setValue(STATUS.OVERDUE);
      }

      // Get items
      request.items = getRequestItems(requestId);

      // Get notes if requested and user has permission
      if (includeNotes && hasPermission('view_requests')) {
        request.notes = getRequestNotes(requestId);
      }

      return { success: true, request: request };
    }
  }

  return { success: false, error: 'Request not found' };
}

/**
 * Get items for a request
 */
function getRequestItems(requestId) {
  const itemsSheet = getSheet(SHEETS.REQUEST_ITEMS);
  const data = itemsSheet.getDataRange().getValues();
  const items = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === requestId) {
      items.push({
        item_id: data[i][0],
        item_name: data[i][2],
        quantity: data[i][3],
        item_notes: data[i][4]
      });
    }
  }

  return items;
}

/**
 * Get notes for a request (staff only)
 */
function getRequestNotes(requestId) {
  if (!hasPermission('view_requests')) {
    return [];
  }

  const notesSheet = getSheet(SHEETS.NOTES);
  const data = notesSheet.getDataRange().getValues();
  const notes = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === requestId && !data[i][6]) { // not deleted
      notes.push({
        note_id: data[i][0],
        note_text: data[i][2],
        author_email: data[i][3],
        author_name: data[i][4],
        created_at: data[i][5]
      });
    }
  }

  // Sort by created_at descending (newest first)
  notes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return notes;
}

/**
 * Get all requests with filters (staff only)
 */
function getRequests(filters) {
  if (!hasPermission('view_requests')) {
    return { success: false, error: 'Permission denied' };
  }

  const requestsSheet = getSheet(SHEETS.REQUESTS);
  const data = requestsSheet.getDataRange().getValues();
  const requests = [];

  for (let i = 1; i < data.length; i++) {
    // Skip deleted requests
    if (data[i][17]) continue;

    // Skip archived if filter says so
    if (filters && filters.exclude_archived && data[i][16]) continue;

    const request = {
      request_id: data[i][0],
      borrower_name: data[i][1],
      borrower_email: data[i][2],
      borrower_phone: data[i][3],
      borrower_roll: data[i][4],
      borrower_type: data[i][5],
      borrower_other_details: data[i][6],
      purpose: data[i][7],
      start_datetime: data[i][8],
      duration_days: data[i][9],
      due_datetime: data[i][10],
      status: data[i][11],
      item_count: data[i][12],
      returned_confirmed_at: data[i][13],
      returned_confirmed_by: data[i][14],
      return_remarks: data[i][15],
      is_archived: data[i][16]
    };

    // Update status if overdue
    if (isOverdue(request.due_datetime, request.status)) {
      request.status = STATUS.OVERDUE;
      requestsSheet.getRange(i + 1, 12).setValue(STATUS.OVERDUE);
    }

    // Apply status filter
    if (filters && filters.status && request.status !== filters.status) {
      continue;
    }

    // Apply date range filter
    if (filters && filters.start_date) {
      const reqDate = new Date(request.start_datetime);
      const filterStart = new Date(filters.start_date);
      if (reqDate < filterStart) continue;
    }

    if (filters && filters.end_date) {
      const reqDate = new Date(request.start_datetime);
      const filterEnd = new Date(filters.end_date);
      if (reqDate > filterEnd) continue;
    }

    // Apply search filter (borrower fields and items)
    if (filters && filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesBorrower =
        request.borrower_name.toLowerCase().includes(searchLower) ||
        request.borrower_email.toLowerCase().includes(searchLower) ||
        request.borrower_phone.includes(searchLower) ||
        request.borrower_roll.toLowerCase().includes(searchLower);

      if (!matchesBorrower) {
        // Check items
        const items = getRequestItems(request.request_id);
        const matchesItems = items.some(item =>
          item.item_name.toLowerCase().includes(searchLower)
        );

        if (!matchesItems) continue;
      }
    }

    requests.push(request);
  }

  // Sort by due date (overdue first, then soonest due)
  requests.sort((a, b) => {
    if (a.status === STATUS.OVERDUE && b.status !== STATUS.OVERDUE) return -1;
    if (a.status !== STATUS.OVERDUE && b.status === STATUS.OVERDUE) return 1;
    if (a.status === STATUS.RETURNED && b.status !== STATUS.RETURNED) return 1;
    if (a.status !== STATUS.RETURNED && b.status === STATUS.RETURNED) return -1;
    return new Date(a.due_datetime) - new Date(b.due_datetime);
  });

  return { success: true, requests: requests };
}

/**
 * Mark request as returned (staff only)
 */
function markRequestReturned(requestId, returnRemarks) {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('mark_returned', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  const requestsSheet = getSheet(SHEETS.REQUESTS);
  const data = requestsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === requestId) {
      const now = getISTDateTime();
      const actorName = getUserName(actorEmail) || actorEmail;

      // Update status and return info
      requestsSheet.getRange(i + 1, 12).setValue(STATUS.RETURNED);
      requestsSheet.getRange(i + 1, 14).setValue(now);
      requestsSheet.getRange(i + 1, 15).setValue(actorEmail);
      requestsSheet.getRange(i + 1, 16).setValue(returnRemarks || '');
      requestsSheet.getRange(i + 1, 23).setValue(now); // updated_at

      // Log the action
      logAudit('return_confirmed', 'request', requestId, actorEmail, returnRemarks, {
        old_status: data[i][11],
        new_status: STATUS.RETURNED,
        returned_at: now,
        return_remarks: returnRemarks || ''
      });

      return { success: true };
    }
  }

  return { success: false, error: 'Request not found' };
}

/**
 * Undo return confirmation (Admin only)
 */
function undoReturnConfirmation(requestId) {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('undo_return', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  const requestsSheet = getSheet(SHEETS.REQUESTS);
  const data = requestsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === requestId) {
      const now = getISTDateTime();
      const oldStatus = data[i][11];

      // Determine new status (check if overdue)
      const newStatus = isOverdue(data[i][10], null) ? STATUS.OVERDUE : STATUS.ACTIVE;

      // Clear return info
      requestsSheet.getRange(i + 1, 12).setValue(newStatus);
      requestsSheet.getRange(i + 1, 14).setValue('');
      requestsSheet.getRange(i + 1, 15).setValue('');
      requestsSheet.getRange(i + 1, 16).setValue('');
      requestsSheet.getRange(i + 1, 23).setValue(now); // updated_at

      // Log the action
      logAudit('return_undone', 'request', requestId, actorEmail, '', {
        old_status: oldStatus,
        new_status: newStatus
      });

      return { success: true };
    }
  }

  return { success: false, error: 'Request not found' };
}

/**
 * Delete request (staff only)
 */
function deleteRequest(requestId, reason) {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('delete_request', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  if (!reason || reason.trim().length === 0) {
    return { success: false, error: 'Deletion reason is required' };
  }

  const requestsSheet = getSheet(SHEETS.REQUESTS);
  const data = requestsSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === requestId) {
      const now = getISTDateTime();

      // Soft delete
      requestsSheet.getRange(i + 1, 18).setValue(true); // is_deleted
      requestsSheet.getRange(i + 1, 19).setValue(now); // deleted_at
      requestsSheet.getRange(i + 1, 20).setValue(actorEmail); // deleted_by
      requestsSheet.getRange(i + 1, 21).setValue(reason); // deletion_reason
      requestsSheet.getRange(i + 1, 23).setValue(now); // updated_at

      // Log the action
      logAudit('request_deleted', 'request', requestId, actorEmail, reason, {
        borrower_name: data[i][1],
        borrower_email: data[i][2]
      });

      return { success: true };
    }
  }

  return { success: false, error: 'Request not found' };
}

/**
 * Add note to request (staff only)
 */
function addNote(requestId, noteText) {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('add_note', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  if (!noteText || noteText.trim().length === 0) {
    return { success: false, error: 'Note text is required' };
  }

  const noteId = generateId('NOTE');
  const now = getISTDateTime();
  const actorName = getUserName(actorEmail) || actorEmail;

  const notesSheet = getSheet(SHEETS.NOTES);
  notesSheet.appendRow([
    noteId,
    requestId,
    noteText.trim(),
    actorEmail,
    actorName,
    now,
    false, // is_deleted
    '', // deleted_at
    ''  // deleted_by
  ]);

  return { success: true, note_id: noteId };
}

/**
 * Delete note (Admin only)
 */
function deleteNote(noteId) {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('delete_note', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  const notesSheet = getSheet(SHEETS.NOTES);
  const data = notesSheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === noteId) {
      const now = getISTDateTime();

      // Soft delete
      notesSheet.getRange(i + 1, 7).setValue(true); // is_deleted
      notesSheet.getRange(i + 1, 8).setValue(now); // deleted_at
      notesSheet.getRange(i + 1, 9).setValue(actorEmail); // deleted_by

      // Log the action
      logAudit('note_deleted', 'note', noteId, actorEmail, '', {
        request_id: data[i][1],
        note_text: data[i][2]
      });

      return { success: true };
    }
  }

  return { success: false, error: 'Note not found' };
}
