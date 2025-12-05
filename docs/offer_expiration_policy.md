# Offer Expiration Policy

## Overview
This document describes the 24-hour offer expiration policy implemented in the OrderzHouse platform. This policy ensures that clients must accept or reject freelancer offers within 24 hours of submission.

## Policy Details

### Time Frame
- All pending offers automatically expire after 24 hours from their submission time
- The expiration is calculated from the `created_at` timestamp of the offer

### Automatic Expiration Process
- A cron job runs every 30 minutes to check for expired offers
- Offers that are pending and older than 24 hours are automatically marked as "expired"
- Offers for projects that are no longer in "bidding" status are also expired

### User Interface Indicators
- Clients see a countdown timer showing how much time is left before an offer expires
- A clear notice is displayed on both client and admin offer pages explaining the 24-hour rule
- Expired offers are displayed with a gray status badge

### Business Logic Enforcement
1. **Submitting New Offers**: 
   - Freelancers cannot submit a new offer for a project if they already have a pending offer
   - However, if their existing offer has expired (older than 24 hours), they can submit a new one

2. **Accepting/Rejecting Offers**:
   - Clients cannot accept or reject offers that have expired
   - An error message is displayed if they attempt to act on an expired offer

3. **Cancelling Offers**:
   - Freelancers cannot cancel offers that have expired
   - An error message is displayed if they attempt to cancel an expired offer

## Implementation Details

### Backend Changes
- Modified `autoExpireOldOffers` function to check for 24-hour expiration instead of 7 days
- Updated cron job frequency to run every 30 minutes instead of daily
- Added expiration checks to offer submission, approval/rejection, and cancellation functions
- Enhanced database queries to include expiration time calculations

### Frontend Changes
- Added expiration countdown timers to offer listings
- Added prominent notices about the 24-hour rule
- Updated status display to include "expired" state
- Added error handling for expired offer operations

## Benefits
- Encourages timely decision-making by clients
- Keeps the platform dynamic with fresh offers
- Prevents stale offers from cluttering the system
- Improves overall user experience by setting clear expectations

## Error Handling
When users attempt to interact with expired offers, they receive clear error messages explaining:
- That the offer has expired
- The 24-hour policy requirement
- That they need to request a new offer from the freelancer if still interested

## Future Considerations
- Admin override capability for special circumstances
- Email notifications before offer expiration
- Configurable expiration periods for different service categories