# DOITEPIC

## Current State
App has streaks/points tracked per user locally and synced to backend via `useCallerStreak`. Weekly Missions with XP are in `WeeklyMissionsCard`. Dashboard shows `StreakWidget` with current/best streak and total points. No leaderboard exists yet.

## Requested Changes (Diff)

### Add
- `Leaderboard.tsx` component showing top users ranked by: streak days, total points, and weekly XP
- Leaderboard tab/page accessible from Dashboard via a navbar button or dashboard CTA card
- Tabs: "Streaks", "Points", "Weekly XP"
- Each row shows rank (#1, #2...), avatar initials, name, score, and milestone badge if applicable
- Top 3 highlighted with gold/silver/bronze styling
- Current user row is highlighted differently
- Data source: frontend-simulated leaderboard using localStorage users + current user's real data (since backend getAllUsers is available)
- Leaderboard CTA card on Dashboard below StreakWidget

### Modify
- `Dashboard.tsx`: add leaderboard page state, render `Leaderboard` component when active, add CTA card
- `Navbar.tsx`: add Trophy icon button for leaderboard

### Remove
- Nothing

## Implementation Plan
1. Create `src/frontend/src/components/Leaderboard.tsx` with tabs (Streaks / Points / Weekly XP), ranked rows, top-3 podium styling, current user highlight
2. Update `Dashboard.tsx` to import and route to Leaderboard, add CTA card
3. Update `Navbar.tsx` to add a Trophy icon button that opens leaderboard
