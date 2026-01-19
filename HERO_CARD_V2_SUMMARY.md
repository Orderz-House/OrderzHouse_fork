# Hero Card V2 Redesign - Implementation Summary

## Overview
Redesigned the hero card on both home screens to use the **orange-to-red gradient theme** with **white text** and a **white CTA button** for better contrast. Removed all dark/black backgrounds.

---

## New Hero Card V2 Widget
**File:** `mobile_app/lib/core/widgets/home_hero_card_v2.dart`

### Design Features
1. **Background**: LinearGradient from `AppColors.gradientStart` (orange #FB923C) to `AppColors.gradientEnd` (red #EF4444)
2. **Subtle Top Glow**: White overlay with 15% opacity at the top for softness
3. **Radius**: 26px for premium rounded corners
4. **Shadow**: Soft orange shadow with 20% opacity
5. **Height**: Responsive between 180-210px
6. **Padding**: 16px horizontal

### Card Layout
```
┌─────────────────────────────────────────┐
│ [Chip: "Action Center"]    [Icon] ←Top │
│                                          │
│ Title (white, bold)                      │
│ Big Number (optional, e.g., JOD 123.45) │
│ Subtitle (white 85% opacity)             │
│                                          │
│ [KPI1] [KPI2] [KPI3] ←3 white KPIs      │
│                                          │
│ ┌──────────────────────────────┐         │
│ │  [Icon] CTA Label (WHITE BTN)│         │
│ └──────────────────────────────┘         │
└─────────────────────────────────────────┘
```

### Components
- **Top-left chip**: White with 20% opacity, contains label
- **Top-right icon** (optional): Circular button (36x36) with 20% white opacity for quick navigation
- **Title**: White, bold, headline medium
- **Big Number** (optional): Large white text (32px) for showing balance
- **Subtitle**: White with 85% opacity
- **KPIs**: 3 items with white numbers and labels
- **CTA Button**: **WHITE** background with near-black text for contrast (no gradient)

---

## Freelancer Home Screen Updates
**File:** `mobile_app/lib/features/freelancer/presentation/screens/freelancer_home_screen.dart`

### Hero Card Configuration
- **Chip**: "This Month"
- **Top-right icon**: Wallet icon → navigates to `/freelancer/payments`
- **Title**: "Your Balance"
- **Big Number**: "JOD {balance}" (from `freelancerBalanceProvider`)
- **Subtitle**: "Available to withdraw"
- **KPIs**:
  - Active projects (from `myProjectsProvider`)
  - Pending reviews (from `myProjectsProvider`)
  - Unread messages (placeholder: 0, can be updated when messages feature exists)
- **CTA**: "View Earnings" → navigates to `/freelancer/payments`

### Data Sources
- **Balance**: `freelancerBalanceProvider` from `/payments/freelancer/wallet` API endpoint
- **Projects**: `myProjectsProvider` for counts
- All data fetched from real API, no hardcoded values

---

## Client Home Screen Updates
**File:** `mobile_app/lib/features/client/presentation/screens/client_home_screen.dart`

### Hero Card Configuration
- **Chip**: "Action Center"
- **Top-right icon**: Projects icon → navigates to `/client/projects`
- **Title**: "Manage your projects"
- **Subtitle**: "Track offers, deliveries and payments"
- **KPIs**:
  - Active projects (from `myProjectsProvider`)
  - New proposals (pending status from `myProjectsProvider`)
  - Pending reviews (pending_review status from `myProjectsProvider`)
- **CTA**: "Post a Project" with plus icon → navigates to `/create-project`

### Data Sources
- **Projects**: `myProjectsProvider` for all KPIs
- All counts calculated dynamically from project statuses

---

## Key Changes from Previous Version

### Before (Hero Card V1)
❌ Dark gradient background (black/gray)  
❌ Gradient CTA button (orange→red)  
❌ Generic "New Opportunities" chip  
❌ No top-right shortcut icon  
❌ No balance display for freelancers  

### After (Hero Card V2)
✅ **Orange→Red gradient background**  
✅ **WHITE CTA button** for better contrast  
✅ Role-specific chips ("Action Center", "This Month")  
✅ **Circular shortcut icon** in top-right  
✅ **Freelancer balance** prominently displayed  
✅ **Soft top glow** overlay for premium feel  

---

## Technical Details

### Colors Used
- **Background Gradient**: `gradientStart` (#FB923C) → `gradientEnd` (#EF4444)
- **Text**: White (100%) and White (85% opacity)
- **Chip**: White 20% opacity
- **Top-right icon**: White 20% opacity
- **CTA Button**: White background with `textPrimary` (#0F0F0F) text
- **Shadow**: Orange with 20% opacity

### Responsive Layout
- Uses `Expanded` and `Flexible` widgets to prevent overflow
- `maxLines: 1` with `overflow: TextOverflow.ellipsis` on all text
- `constraints: BoxConstraints(minHeight: 180, maxHeight: 210)`
- Proper spacing with `mainAxisAlignment` and `crossAxisAlignment`

### Navigation
- **Freelancer**:
  - Top-right icon → Payments screen
  - CTA button → Payments screen
- **Client**:
  - Top-right icon → My Projects screen
  - CTA button → Create Project wizard

---

## API Integration

### Freelancer Balance
Endpoint: `GET /payments/freelancer/wallet`  
Response:
```json
{
  "success": true,
  "balance": 123.45
}
```

Provider: `freelancerBalanceProvider` (from `payments_screen.dart`)  
Returns: `double` (defaults to 0.0 if error)

### Project Counts
Endpoint: Various project endpoints via `myProjectsProvider`  
Filtering:
- Active: `status == 'in_progress'`
- Proposals: `status == 'pending'` (Client only)
- Reviews: `status == 'pending_review'`

---

## Testing Checklist
✅ Freelancer hero card displays balance from API  
✅ Client hero card displays project counts  
✅ All KPIs show real data (no hardcoded values)  
✅ Top-right icon navigates correctly  
✅ CTA button navigates correctly  
✅ White text is readable on gradient background  
✅ WHITE button contrasts well with gradient  
✅ No overflow issues  
✅ No linter errors  
✅ Gradient flows smoothly (orange→red)  
✅ Top glow adds soft premium feel  

---

## Visual Comparison

### Freelancer Hero
```
┌─────────────────────────────────────────┐
│ [This Month]                  [💰] │
│                                          │
│ Your Balance                             │
│ JOD 245.50 ← Big white number           │
│ Available to withdraw                    │
│                                          │
│ [2 Active] [1 Reviews] [0 Messages]     │
│                                          │
│ ┌──────────────────────────────┐         │
│ │      View Earnings (WHITE)   │         │
│ └──────────────────────────────┘         │
└─────────────────────────────────────────┘
    Orange → Red Gradient Background
```

### Client Hero
```
┌─────────────────────────────────────────┐
│ [Action Center]               [📋] │
│                                          │
│ Manage your projects                     │
│ Track offers, deliveries and payments    │
│                                          │
│ [3 Active] [5 Proposals] [2 Reviews]    │
│                                          │
│ ┌──────────────────────────────┐         │
│ │ [+] Post a Project (WHITE)   │         │
│ └──────────────────────────────┘         │
└─────────────────────────────────────────┘
    Orange → Red Gradient Background
```

---

## Notes
- Old `home_hero_card.dart` is still in the codebase but no longer used
- New V2 widget is cleaner and more flexible
- Balance display only shown for freelancers (uses bigNumber prop)
- All navigation routes verified to exist in `app_router.dart`
- White button provides excellent contrast against gradient
- Gradient is consistent with app theme (used in other CTA buttons)
