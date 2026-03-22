# DOITEPIC

## Current State
- CalorieTrackerCard receives real `calories` from today's food logs but shows hardcoded fake weekly bar chart (WEEKLY = [1820, 2100, 1950, ...]) that never reflects actual data
- FoodLogCard shows logged entries and calculates calories from `foodMap` lookup by `foodName`
- MacroBreakdownCard receives real `protein`, `carbs`, `fat` from food log totals
- Data flow: `useTodayFoodLogs()` → `foodEntries` → `totals` → cards

## Requested Changes (Diff)

### Add
- Real daily calorie summary in CalorieTrackerCard (today consumed vs goal, with animated ring)
- Clear "No food logged yet" empty state messaging in FoodLogCard with a CTA
- Total macro summary row in MacroBreakdownCard showing combined kcal contribution
- A daily calorie total row at the bottom of FoodLogCard

### Modify
- CalorieTrackerCard: Remove hardcoded WEEKLY fake bars; replace with today's real data ring + a simple message showing calories left; keep the progress ring already working
- FoodLogCard: Add a footer row showing total calories logged today across all meals
- MacroBreakdownCard: Show calorie equivalent beside each macro (protein 4kcal/g, carbs 4kcal/g, fat 9kcal/g) so user sees contribution

### Remove
- The WEEKLY hardcoded array and the fake weekly bar chart section from CalorieTrackerCard

## Implementation Plan
1. Update CalorieTrackerCard to remove fake bars, keep ring gauge with today's consumed/goal, add a clean stat grid showing Consumed / Goal / Remaining
2. Update FoodLogCard to show daily total calories footer
3. Update MacroBreakdownCard to show kcal contribution per macro row
