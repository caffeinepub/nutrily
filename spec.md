# DOITEPIC

## Current State
- Navbar: shows only the DoitEpic logo image, no text title beside it
- Food database: 500+ items, but lacks affordable healthy snacks and boiled/steamed foods
- WeightGainStatusPage: Diet Plan tab has 2 plans — Muscle Gain + Vegetarian Muscle Gain
- WeightLossStatusPage: Meal tab shows foods-to-eat/avoid lists only, no structured diet plans
- GoalsSection: Maintenance section has general tips but no structured diet plans

## Requested Changes (Diff)

### Add
- Navbar: "Do It EPIC" styled text title next to the logo (bold, with EPIC in accent/brand color)
- ~25 affordable healthy snacks and boiled/steamed foods to foodDatabase.ts (boiled eggs, steamed idli, boiled chana, boiled sweet potato, steamed fish, sprouts, etc.)
- Weight Gain: 3 new diet plan tabs: Kerala Bulking Plan (ideas-based), High-Calorie Mass Builder (ideas-based), My Food Log Plan (derived from user's logged foods)
- Weight Loss: Diet Plan tab with 3+ structured plans: Kerala Clean Cut, Calorie Deficit Plan, My Food Log Plan
- Maintenance: Diet Plan tab in GoalsSection with 3 structured plans: Balanced Kerala Plan, Mediterranean-Style Plan, My Food Log Plan

### Modify
- Navbar logo section: add branded title text beside logo
- WeightGainStatusPage DIET_TABS: expand from 2 → 5 tabs
- WeightLossStatusPage: rename "meal" tab to "diet" and add plan selector with 3 options
- GoalsSection maintenance card: add diet plans sub-section

### Remove
- Nothing removed

## Implementation Plan
1. Navbar.tsx — add "Do It <span>EPIC</span>" styled text after the logo img
2. foodDatabase.ts — append ~25 boiled/steamed/healthy snack items
3. WeightGainStatusPage.tsx — add 3 new diet plan components + expand DIET_TABS
4. WeightLossStatusPage.tsx — add diet plan tab with 3 structured plans
5. GoalsSection.tsx — add diet plan section to maintenance card
