# DOITEPIC

## Current State
- UserProfile stores: name, phone, weightKg, heightCm, goal — but NO gender field (despite the UI collecting it)
- Smart Coach uses BMR but without gender-differentiated equations
- No streak or points system exists
- Admin can see join times but no streak data

## Requested Changes (Diff)

### Add
- `gender` field (`#male | #female`) to UserProfile backend type
- Streak tracking: `UserStreak` record per user — currentStreak (days), longestStreak, totalPoints, lastActiveDate
- `getCallerStreak` and `updateStreak` backend calls
- Admin can query all user streaks
- Frontend: Gender-aware BMR (Mifflin-St Jeor: male uses +5, female uses -161 constant)
- Frontend: Gender-specific macro targets (male: protein 1.8g/kg, fat 25-30%; female: protein 1.6g/kg, fat 28-35%, slightly higher fat for hormonal health)
- Frontend: Gender-specific food and exercise recommendations in Smart Coach
- Frontend: Streak widget on dashboard showing flame icon, current streak days, total points
- Frontend: Points awarded for: logging food (+5 pts), completing daily check-in (+10 pts), hitting calorie goal (+15 pts), 7-day streak bonus (+50 pts)
- Frontend: Streak milestone badges (3-day, 7-day, 30-day)
- Admin panel: Show streak and points data per user in the Users tab

### Modify
- UserProfile type: add `gender: ?Text` field (optional to preserve existing users)
- ProfileSetup: gender selector already in UI, ensure it saves to backend
- Smart Coach: use gender in BMR + macro calculations
- Dashboard My Stats: show gender-adjusted BMR and calorie targets

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend to add gender to UserProfile and add UserStreak type + CRUD
2. Update frontend ProfileSetup to save gender field
3. Update Smart Coach logic with gender-differentiated BMR and macro ranges
4. Add streak widget to dashboard
5. Wire points: food log save, check-in save, calorie goal hit
6. Admin Users tab: show streak/points column
