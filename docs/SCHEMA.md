# Google Sheets Database Schema

## Sheet 1: Requests

One row per borrow request.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| request_id | String | Unique ID (auto-generated) | REQ-20260404-0001 |
| borrower_name | String | Full name | Rajesh Kumar |
| borrower_email | String | Email address | rajesh@iiitdmj.ac.in |
| borrower_phone | String | Phone number | +91-9876543210 |
| borrower_roll | String | Roll number or ID | 2021BCS001 |
| borrower_type | String | Type dropdown value | IIITDMJ Student |
| borrower_other_details | String | Additional details (optional) | Final year, hostel A |
| purpose | String | Purpose of borrowing | Project demonstration |
| start_datetime | ISO DateTime | Submission timestamp (IST) | 2026-04-04T10:30:00+05:30 |
| duration_days | Integer | Duration in days | 3 |
| due_datetime | ISO DateTime | Due date (11:59 PM IST) | 2026-04-07T23:59:00+05:30 |
| status | String | Active / Overdue / Returned Confirmed | Active |
| item_count | Integer | Number of items | 3 |
| returned_confirmed_at | ISO DateTime | Return timestamp | 2026-04-06T14:20:00+05:30 |
| returned_confirmed_by | String | Staff email who confirmed | staff@iiitdmj.ac.in |
| return_remarks | String | Optional return notes | All items in good condition |
| is_archived | Boolean | Archive flag | FALSE |
| is_deleted | Boolean | Soft delete flag | FALSE |
| deleted_at | ISO DateTime | Deletion timestamp | |
| deleted_by | String | Staff email who deleted | |
| deletion_reason | String | Required reason for deletion | Duplicate request |
| created_at | ISO DateTime | Row creation time | 2026-04-04T10:30:00+05:30 |
| updated_at | ISO DateTime | Last update time | 2026-04-04T10:30:00+05:30 |

## Sheet 2: RequestItems

One row per item in a request.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| item_id | String | Unique item ID | ITEM-20260404-0001 |
| request_id | String | Foreign key to Requests | REQ-20260404-0001 |
| item_name | String | Free text item name | Arduino Uno R3 |
| quantity | Integer | Quantity (> 0) | 2 |
| item_notes | String | Optional notes | With USB cable |
| created_at | ISO DateTime | Row creation time | 2026-04-04T10:30:00+05:30 |

## Sheet 3: Notes

One row per internal staff note.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| note_id | String | Unique note ID | NOTE-20260404-0001 |
| request_id | String | Foreign key to Requests | REQ-20260404-0001 |
| note_text | String | Note content | Borrower called to confirm pickup |
| author_email | String | Staff email | staff@iiitdmj.ac.in |
| author_name | String | Staff display name | Dr. Singh |
| created_at | ISO DateTime | Note timestamp | 2026-04-04T11:00:00+05:30 |
| is_deleted | Boolean | Soft delete flag | FALSE |
| deleted_at | ISO DateTime | Deletion timestamp | |
| deleted_by | String | Admin who deleted | admin@iiitdmj.ac.in |

## Sheet 4: Users

Whitelisted staff members.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| email | String | Google account email (unique) | staff@iiitdmj.ac.in |
| role | String | Admin / Resource Team | Resource Team |
| name | String | Display name | Dr. Arun Singh |
| added_at | ISO DateTime | When added | 2026-04-01T09:00:00+05:30 |
| added_by | String | Admin who added them | admin@iiitdmj.ac.in |
| is_active | Boolean | Active status | TRUE |

## Sheet 5: Settings

Configuration and templates (key-value pairs).

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| setting_key | String | Setting identifier | club_name |
| setting_value | String | Setting value | Aero Fabrication Club |
| description | String | Human-readable description | Name of the club |
| updated_at | ISO DateTime | Last update | 2026-04-01T09:00:00+05:30 |
| updated_by | String | Admin who updated | admin@iiitdmj.ac.in |

### Default Settings Keys

- `club_name`: "Aero Fabrication Club"
- `club_email`: "aero.fab@iiitdmj.ac.in"
- `logo_file_id`: Google Drive file ID for logo
- `default_duration_days`: "7"
- `retention_policy`: "forever" or "archive_after_months"
- `retention_months`: "12"
- `email_subject_template`: "[AERO INVENTORY] Borrow Declaration - {borrower_name} - {start_datetime}"
- `email_body_template`: [Multi-line email template with variables]

## Sheet 6: AuditLog

Action history log.

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| log_id | String | Unique log ID | LOG-20260404-0001 |
| action_type | String | return_confirmed / deleted / setting_changed / note_deleted | return_confirmed |
| target_type | String | request / setting / note | request |
| target_id | String | ID of target | REQ-20260404-0001 |
| actor_email | String | Who performed action | staff@iiitdmj.ac.in |
| actor_name | String | Display name | Dr. Singh |
| timestamp | ISO DateTime | When action occurred | 2026-04-06T14:20:00+05:30 |
| details | JSON String | Action details | {"old_status":"Active","new_status":"Returned Confirmed"} |
| reason | String | Optional reason | Items checked and verified |

## Indexes and Performance

For optimal performance with ~100 requests/week:
- Use `request_id` as primary lookup key
- Filter by `status` and `is_deleted` for dashboard views
- Sort by `due_datetime` for overdue checks
- Index by `borrower_email` for borrower lookup in status check

## Data Integrity

- All IDs are auto-generated with format: `PREFIX-YYYYMMDD-NNNN`
- Timestamps are ISO 8601 with IST timezone (+05:30)
- Soft deletes preserve data (use `is_deleted` flag)
- Audit log is append-only (never deleted)
- Foreign keys are enforced in application logic
