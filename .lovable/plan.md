# Plan: Administrative Subscription Management

Implement a visual subscription status column in the admin mill list and a management card in mill details.

## Changes

### Administrative Interface

1. **Mill List (`src/pages/admin/AdminIndex.tsx`)**
    - Update data fetching to include `subscription_status` from the `profiles` table.
    - Add a "Subscription Status" column to the mills table.
    - Use colored badges for statuses:
        - `pending`: Yellow
        - `active`: Green
        - `suspended`: Red
    - Add a filter dropdown above the table to filter mills by subscription status.

2. **Mill Management (`src/pages/admin/MillDetails.tsx`)**
    - Add a new card "Subscription Management".
    - Display the current status clearly.
    - Add buttons for:
        - "Activate Account" (sets status to `active`).
        - "Suspend Account" (sets status to `suspended`).
    - Add a textarea for `subscription_notes` (manual payment/admin notes).
    - Save changes to the `profiles` table.
    - Log every status change using the `log_admin_access` RPC.

## Technical Details

- **Database Interactions:**
    - `profiles` table: update `subscription_status` and `subscription_notes`.
    - `log_admin_access` RPC: used for auditing admin actions.
- **UI Components:**
    - `Badge` (shadcn/ui) for status display.
    - `Select` / `DropdownMenu` for status filtering.
    - `Button`, `Textarea` for the management card.
    - `toast` for feedback.

## User Review Required

- Confirm the status filter location (above the table, next to the search or title).
- Confirm the subscription management card placement in the `MillDetails` layout.
