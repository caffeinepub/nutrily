# DOITEPIC

## Current State
The app is a full-stack PWA nutrition tracker with:
- User login/registration (name, phone, weight, height)
- Dashboard with food log, Smart Coach, health goals (Weight Gain, Weight Loss)
- 500+ food database stored in frontend
- Admin panel showing user list and check-ins
- Backend has basic addFoodItem/deleteFoodItem/getAllFoodItems endpoints
- No food editing, no user-submitted food approval, no CSV upload, no regional management
- Only two user goals: Weight Gain, Weight Loss (no Maintenance)

## Requested Changes (Diff)

### Add
- Admin: Food Database Management tab in admin panel
  - View all food items in a searchable table
  - Add new food item form (name, category, region, calories, protein, carbs, fat, fiber, sugar, serving size, veg/non-veg type, health warning)
  - Edit existing food item inline
  - Delete food item with confirmation
  - CSV bulk upload: parse CSV rows and batch-add food items
  - Regional filter: filter by region (Kerala, South India, North India, Chinese, Arabian, Global)
- Admin: User-submitted food approval queue
  - Users can submit a food suggestion from the food log
  - Admin sees pending submissions and can approve (adds to DB) or reject
- User: "Maintenance" goal added alongside Weight Gain and Weight Loss
  - Maintenance goal card with calorie maintenance tips, balanced diet advice, and activity guidance
- User: Profile setup and dashboard show goal selection (Weight Loss, Muscle Gain, Maintenance)
- Product scope page/section accessible from dashboard showing target audience and goal descriptions

### Modify
- AdminDashboard: Add tabbed navigation (Users tab + Food Database tab + Approvals tab)
- Backend: Add updateFoodItem, submitFoodSuggestion, getFoodSuggestions, approveFoodSuggestion, rejectFoodSuggestion endpoints
- UserProfile type: add optional `goal` field (weightLoss | muscleGain | maintenance)
- ProfileSetup: add goal selection step

### Remove
- Nothing removed

## Implementation Plan
1. Update backend: add updateFoodItem, user food suggestion submit/approve/reject, update UserProfile to include goal field
2. AdminDashboard: add tabs, Food DB tab with full CRUD + CSV upload + regional filter, Approvals tab
3. Dashboard: add Maintenance goal card, update Smart Coach to handle maintenance goal
4. ProfileSetup: add goal selection (Weight Loss, Muscle Gain, Maintenance)
5. FoodLog: add "Suggest a Food" button that opens a lightweight submission form
