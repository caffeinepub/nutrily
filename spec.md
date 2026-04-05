# DOITEPIC

## Current State
The app has 6+ major pages (Dashboard, ThinkEpic, MoveEpic, WeightGainStatusPage, WeightLossStatusPage, NutritionSummaryPage, FoodLogHistory, Leaderboard) plus Login/Registration. Every page renders all content at once with no progressive disclosure, causing extreme visual congestion. Specific issues:
- **Dashboard**: Shows Streak, Health Score, MyStats, Calorie+Macro grid, FoodLog, 3 nav buttons, then 4 collapsible sections (Daily Activities with 3 cards, Progress & Goals with 3 cards, Health Tools with 6 cards, Goals & Community with 2 sections). Even without the collapsible content, the always-visible section is still dense.
- **ThinkEpic** (1664 lines): Seasonal banner + Smart Alerts + Food Safety Timer + Sugar Awareness (3 sub-cards) + Sugar Detox Mode + Visual Scores + Kerala Food Safety Hub (5 expandable items) + "Is This Safe" tool + Health Goal Insights + Fish Freshness Checklist + Habit Insights + Kerala Food Facts + Health Quiz + Food Myth Busters — all visible on the same scroll.
- **MoveEpic** (1834 lines): Audience selector + Home/Gym toggle + Category filter chips + Exercise of the Day + Calorie Burn Calculator + full exercise card grid + Workout History — all on one page.
- **WeightGain/LossStatusPage** (~1400 lines combined): Status cards + diet plan tabs + detailed meal templates all shown inline.
- **NutritionSummaryPage**: Full nutrition breakdown + Nutrient Gap + Meal Timing + Best Day comparison all visible at once.
- **LoginPage** (805 lines): Branding + rotating Health Fact + BMI teaser + feature cards + registration multi-step form all cramped together.

## Requested Changes (Diff)

### Add
- A clean, minimal tab/section navigation inside ThinkEpic so users switch between major sections (Food Safety, Sugar, Kerala Hub, Quiz/Facts) one at a time instead of scrolling through everything.
- A tab bar inside MoveEpic to switch between Plans, Exercise Library, History, and Calculator.
- Section tabs inside WeightGain and WeightLoss pages for Status, Diet Plans, and Tips.
- A tab-based layout inside NutritionSummaryPage for Today, Weekly, and Analysis views.
- Generous whitespace, larger touch targets, and breathing room between sections on every page.
- A single focused "hero" summary card at the top of each page showing the most important number/status.

### Modify
- **Dashboard**: Remove the always-visible MyStats card from the main scroll (keep it accessible via the existing "My Stats" or metrics button). Slim the always-visible area to: greeting, StreakWidget (compact), DailyHealthScore, CalorieTracker (single compact card), FoodLogCard, and the 3-button nav grid. Keep collapsible sections but reduce them to 3 (Daily, Progress, Tools — merge Goals & Community into Progress).
- **ThinkEpic**: Replace the single long scroll with 4 clean tabs at the top: "Alerts" (Smart Alerts + Food Safety Timer), "Sugar" (Sugar Awareness + Detox Mode), "Safety" (Kerala Hub + Is This Safe?), "Learn" (Quiz + Myth Busters + Kerala Facts). Each tab shows only its content.
- **MoveEpic**: Replace the single long scroll with 4 clean tabs: "Plans" (audience selector + home/gym + exercise cards), "Library" (category filter + exercise detail), "History" (workout history log), "Tools" (Exercise of the Day + Calorie Burn Calculator).
- **WeightGainStatusPage / WeightLossStatusPage**: Add 3 tabs at top: "Overview" (status cards + progress), "Diet Plan" (the existing meal template cards), "Tips" (optimization tips + habits checklist).
- **NutritionSummaryPage**: Add 3 tabs: "Today" (macro breakdown + food log summary), "Weekly" (7-day history), "Analysis" (Nutrient Gap + Meal Timing + Best Day).
- **LoginPage**: Simplify to a clean centered layout: logo + tagline + the 3 feature pills (small, compact) + the 2-step registration form. Move the rotating Health Fact to a small subtle banner below the form, not a prominent card. Remove the BMI teaser from login — it belongs on the dashboard after login.
- All section headings: ensure consistent `text-base font-bold` style. Remove redundant sub-headings within cards. Reduce card padding on mobile from `p-4` to `p-3` where content allows.
- All pages: add `pb-24` to main content area to prevent bottom nav overlap.

### Remove
- BMI teaser banner from the Login page.
- Redundant inline sub-sections on ThinkEpic (the long "Health Goal Insights" and "Habit Insights" raw text blocks — replace with the clean "Alerts" tab content).
- The big always-visible `MyStatsCard` from the Dashboard main scroll (keep it in a collapsible).
- Extra vertical spacing between cards — normalize to `space-y-3` max.

## Implementation Plan
1. **LoginPage.tsx**: Simplify layout — compact feature pills, remove BMI teaser, move health fact to a subtle footer note.
2. **Dashboard.tsx**: Move `MyStatsCard` inside the collapsed "Health Tools" section. Reduce always-visible area to 5 elements only. Merge "Goals & Community" into "Progress & Goals" collapsible.
3. **ThinkEpicPage.tsx**: Add 4 tab buttons at the top (`useState` for `activeTab`). Wrap each section group in a conditional render based on the active tab.
4. **WorkoutPage.tsx**: Add 4 tab buttons at the top. Wrap Plans, Library, History, Tools content in conditional renders.
5. **WeightGainStatusPage.tsx + WeightLossStatusPage.tsx**: Add 3 tabs at the top (Overview, Diet Plan, Tips).
6. **NutritionSummaryPage.tsx**: Add 3 tabs (Today, Weekly, Analysis).
7. **Global**: Normalize spacing to `space-y-3`, ensure all pages have `pb-24` on mobile.
