# Nutrily

## Current State
Nutrily is a health and nutrition tracking app with food logging, calorie tracking, macro breakdown, water intake, meal quality scoring, health metrics, and a Kerala food database. The Dashboard is the main screen after login.

## Requested Changes (Diff)

### Add
- A new "Goals" section/tab in the Dashboard with two options: **Weight Gain** and **Weight Loss**
- For each goal, show:
  - Recommended **Exercises** (list with brief description)
  - Recommended **Diet** tips (foods to eat/avoid)
  - **Sleep** guidelines
  - **Motivational Quotes** carousel or section below the plan details

### Modify
- Dashboard to include the new Goals tab/section alongside existing features

### Remove
- Nothing removed

## Implementation Plan
1. Create a new `GoalsSection.tsx` frontend component with two goal cards (Weight Gain / Weight Loss)
2. Each card expands or navigates to show exercises, diet tips, sleep advice, and motivational quotes
3. Add the GoalsSection to the Dashboard component
4. All content is static (no backend changes needed)
