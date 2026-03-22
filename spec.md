# DOITEPIC - Version 28: Local Intelligence + Gamification Upgrade

## Current State
The app has a comprehensive food tracking system with 500+ foods, Smart Coach, streaks/points, gender/age-aware recommendations, offline support, and an 8-tab admin panel. The backend has UserProfile (missing age field), FoodItem (no honesty rating or ingredient breakdown), health metrics, food logs, water intake, diet plans, articles, announcements, and moderation.

## Requested Changes (Diff)

### Add
- **Food Honesty Meter**: `honestyRating` field on FoodItem (clean / moderate / processed) shown as colored badge in food search and log
- **Dish Ingredient Breakdown**: `dishIngredients` field on FoodItem (e.g. biryani → rice 60%, chicken 25%, oil 15%) shown when logging or viewing a dish
- **Natural Language Portions**: Add "1 plate", "1 glass", "1 handful", "1 bowl" as portion options in food log with auto-conversion to grams
- **Daily Health Score (0–100)**: Computed in frontend from protein %, fiber %, water %, and calorie balance. Shown prominently on dashboard as a ring/gauge with breakdown
- **Smart Suggestions Card**: After food logging or on dashboard, show 2–3 real-time tips like "Protein is low → add 2 eggs" based on today's macro gaps
- **Goal Visualization**: Weight trend prediction showing "You'll reach [goal weight] in X days" based on calorie deficit/surplus trend
- **Habit Loop System**: Weekly missions ("Log 5 meals this week", "No junk for 3 days", "Hit water goal 4 days") with progress tracking and XP rewards
- **Micro Coaching Card**: 1 daily tip + 1 action step on dashboard (rotates daily, goal-aware)
- **age field** in UserProfile backend type (currently missing)
- **Weekly Missions** backend: store user mission progress per week

### Modify
- Dashboard layout: integrate Health Score ring, Smart Suggestions, Micro Coaching, Goal Visualization into existing sections
- FoodItem type: add `honestyRating`, `dishIngredients`, `portionPresets` optional fields
- UserProfile type: add `age` field
- Food log entry flow: add natural language portion selector (plate/glass/handful/bowl)
- Food search results: show honesty badge (green/yellow/red dot) next to each food

### Remove
- Nothing removed

## Implementation Plan
1. Update `UserProfile` to include `age: ?Nat` field in backend
2. Update `FoodItem` to include `honestyRating: ?Text`, `dishIngredients: ?Text` optional fields
3. Add `WeeklyMission` type and per-user mission progress tracking to backend
4. Add backend functions: `getUserMissions`, `completeMission`, `resetWeeklyMissions`
5. Frontend: Build `HealthScoreCard` component computing score from today's macros/water
6. Frontend: Build `SmartSuggestionsCard` showing macro gap advice
7. Frontend: Build `GoalVisualizationCard` with weight prediction timeline
8. Frontend: Build `WeeklyMissionsWidget` with progress bars and XP
9. Frontend: Build `MicroCoachingCard` with rotating daily tip and action step
10. Frontend: Update food log unit selector to include plate/glass/handful/bowl with gram equivalents
11. Frontend: Show honesty rating badge in food search dropdown and food log items
12. Frontend: Show dish ingredient breakdown when a complex dish is selected
