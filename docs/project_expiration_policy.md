# Project Expiration Policy

## Overview
This document describes the 3-hour project expiration policy implemented in the OrderzHouse platform. This policy ensures that clients must review and accept/reject freelancer offers for their projects within 3 hours of project creation.

## Policy Details

### Time Frame
- All projects in "bidding" status automatically expire after 3 hours from their creation time
- The expiration is calculated from the `created_at` timestamp of the project

### Automatic Expiration Process
- A cron job runs every 30 minutes to check for expired projects
- Projects that are in "bidding" status and older than 3 hours are automatically marked as "expired"
- Clients receive a notification immediately upon project creation confirming the 3-hour window
- Clients receive a reminder notification 1 hour before project expiration

### User Interface Indicators
- Clients see a countdown timer showing how much time is left before a project expires
- A clear notice is displayed on both client and admin project pages explaining the 3-hour rule
- Expired projects are displayed with a gray status badge

### Business Logic Enforcement
1. **Project Creation**:
   - When a client creates a project, they immediately receive a notification confirming the project is active
   - The notification clearly states they have 3 hours to review and accept/reject freelancer offers

2. **Expiration Reminder**:
   - Clients receive a reminder notification 1 hour before project expiration
   - The reminder clearly states that the project will automatically expire and be removed if no action is taken

3. **Automatic Expiration**:
   - Projects that are not acted upon within 3 hours are automatically marked as "expired"
   - Expired projects are no longer available for freelancers to submit offers

## Implementation Details

### Backend Changes
- Added `autoExpireOldProjects` function to check for 3-hour expiration
- Created cron job that runs every 30 minutes to check for expired projects
- Added project creation notification with 3-hour policy information
- Added project expiration reminder notification (1 hour before expiration)
- Enhanced database queries to include expiration time calculations

### Frontend Changes
- Added expiration countdown timers to project listings
- Added prominent notices about the 3-hour rule
- Updated status display to include "expired" state
- Added error handling for expired project operations

## Benefits
- Encourages timely decision-making by clients
- Keeps the platform dynamic with fresh projects
- Prevents stale projects from cluttering the system
- Improves overall user experience by setting clear expectations

## Error Handling
When users attempt to interact with expired projects, they receive clear error messages explaining:
- That the project has expired
- The 3-hour policy requirement
- That they need to create a new project if still interested

## Future Considerations
- Admin override capability for special circumstances
- Email notifications before project expiration
- Configurable expiration periods for different service categories