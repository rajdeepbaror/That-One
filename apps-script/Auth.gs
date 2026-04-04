/**
 * Authentication and Authorization
 * Handles user verification and role-based permissions
 */

/**
 * Get current user's email (from Google session)
 */
function getCurrentUserEmail() {
  return Session.getActiveUser().getEmail();
}

/**
 * Check if user is authenticated (has valid Google account)
 */
function isAuthenticated() {
  const email = getCurrentUserEmail();
  return email && email.length > 0;
}

/**
 * Get user's role from Users sheet
 * Returns null if user not found or not active
 */
function getUserRole(email) {
  if (!email) email = getCurrentUserEmail();

  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email && data[i][5] === true) {
      return data[i][1]; // role column
    }
  }

  return null;
}

/**
 * Check if user is admin
 */
function isAdmin(email) {
  if (!email) email = getCurrentUserEmail();
  return getUserRole(email) === ROLES.ADMIN;
}

/**
 * Check if user is resource team member
 */
function isResourceTeam(email) {
  if (!email) email = getCurrentUserEmail();
  const role = getUserRole(email);
  return role === ROLES.RESOURCE_TEAM || role === ROLES.ADMIN;
}

/**
 * Check if user has permission for an action
 */
function hasPermission(action, email) {
  if (!email) email = getCurrentUserEmail();
  const role = getUserRole(email);

  if (!role) return false; // Not whitelisted

  const permissions = {
    'view_requests': [ROLES.ADMIN, ROLES.RESOURCE_TEAM],
    'add_note': [ROLES.ADMIN, ROLES.RESOURCE_TEAM],
    'mark_returned': [ROLES.ADMIN, ROLES.RESOURCE_TEAM],
    'delete_request': [ROLES.ADMIN, ROLES.RESOURCE_TEAM],
    'undo_return': [ROLES.ADMIN],
    'delete_note': [ROLES.ADMIN],
    'manage_users': [ROLES.ADMIN],
    'edit_settings': [ROLES.ADMIN],
    'create_admin': [ROLES.ADMIN],
    'export_data': [ROLES.ADMIN, ROLES.RESOURCE_TEAM],
    'view_audit_log': [ROLES.ADMIN]
  };

  return permissions[action] && permissions[action].includes(role);
}

/**
 * Server-side function to verify user and return role
 * Called from client-side after Google Sign-In
 */
function verifyUser() {
  const email = getCurrentUserEmail();

  if (!email) {
    return {
      success: false,
      error: 'Not authenticated'
    };
  }

  const role = getUserRole(email);

  if (!role) {
    return {
      success: false,
      error: 'Access denied. Your email is not whitelisted.'
    };
  }

  const name = getUserName(email) || email;

  return {
    success: true,
    user: {
      email: email,
      role: role,
      name: name
    }
  };
}

/**
 * Add a new user (Admin only)
 */
function addUser(email, role, name) {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('manage_users', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  // Validate role
  if (role !== ROLES.ADMIN && role !== ROLES.RESOURCE_TEAM) {
    return { success: false, error: 'Invalid role' };
  }

  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();

  // Check if user already exists
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return { success: false, error: 'User already exists' };
    }
  }

  const now = getISTDateTime();
  sheet.appendRow([email, role, name, now, actorEmail, true]);

  logAudit('user_added', 'user', email, actorEmail, '', {
    added_email: email,
    role: role,
    name: name
  });

  return { success: true };
}

/**
 * Remove a user (Admin only)
 */
function removeUser(email) {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('manage_users', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  // Cannot remove yourself
  if (email === actorEmail) {
    return { success: false, error: 'Cannot remove yourself' };
  }

  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      // Soft delete - set is_active to false
      sheet.getRange(i + 1, 6).setValue(false);

      logAudit('user_removed', 'user', email, actorEmail, '', {
        removed_email: email
      });

      return { success: true };
    }
  }

  return { success: false, error: 'User not found' };
}

/**
 * Get all users (Admin only)
 */
function getAllUsers() {
  const actorEmail = getCurrentUserEmail();

  if (!hasPermission('manage_users', actorEmail)) {
    return { success: false, error: 'Permission denied' };
  }

  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const users = [];

  for (let i = 1; i < data.length; i++) {
    users.push({
      email: data[i][0],
      role: data[i][1],
      name: data[i][2],
      added_at: data[i][3],
      added_by: data[i][4],
      is_active: data[i][5]
    });
  }

  return { success: true, users: users };
}
