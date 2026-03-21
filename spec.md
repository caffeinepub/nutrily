# Nutrily

## Current State
- Users log in via Internet Identity and set a profile (name only)
- Dashboard shows food log, calorie tracking, water intake, health metrics, goals (weight gain/loss)
- Admin role via authorization component
- 50+ Kerala + common foods in database

## Requested Changes (Diff)

### Add
- Extended UserProfile: name, phone number, weight (kg), height (cm)
- ProfileSetup collects all four fields on first login
- Users can update weight/height anytime from their dashboard (shown prominently in their space)
- Daily follow-up tracking entries per user: diet log status, exercises done, water glasses, sleep hours
- Admin dashboard page: lists all registered users with their profile details (name, phone, weight, height) and latest daily follow-up status (diet, exercise, water, sleep) in a structured follow-up format table/cards
- Users can submit a daily check-in: what they ate (diet notes), exercises done today, water glasses, sleep hours last night

### Modify
- UserProfile type extended with phone, weight, height
- ProfileSetup form updated to collect phone, weight, height in addition to name
- Dashboard shows user's weight and height stats prominently
- saveCallerUserProfile accepts updated profile including new fields

### Remove
- Nothing removed

## Implementation Plan
1. Backend: extend UserProfile with phone, weightKg, heightCm
2. Backend: add DailyCheckIn type (date, dietNotes, exercisesDone, waterGlasses, sleepHours) per user
3. Backend: saveDailyCheckIn, getMyCheckIns, getAllUsersWithCheckIns (admin only), getAllUsers (admin only)
4. Frontend: update ProfileSetup to collect name, phone, weight, height
5. Frontend: show weight & height card prominently on user dashboard
6. Frontend: add DailyCheckIn form on dashboard (diet notes, exercise, water, sleep)
7. Frontend: admin dashboard route - shows all users in follow-up table with latest check-in status
