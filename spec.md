# DOITEPIC

## Current State
Login requires Internet Identity (id.ai), an external registration popup. After II login, new users fill out a ProfileSetup form (name, phone, weight, height, gender, goal).

## Requested Changes (Diff)

### Add
- useLocalAuth hook: localStorage-based auth (name + phone as identity)
- Combined login+register flow: new users fill all profile fields; returning users just enter name + phone

### Modify
- LoginPage.tsx: replace II button with name+phone form
- App.tsx: replace useInternetIdentity with useLocalAuth
- Data hooks: user-specific data stored in localStorage; food database queries stay backend-based
- Admin modal: no longer calls II login

### Remove
- Internet Identity dependency for regular users
- Separate ProfileSetup step after login

## Implementation Plan
1. Create useLocalAuth.ts hook storing profile in localStorage
2. Update LoginPage.tsx with name+phone form (full fields for new users)
3. Update App.tsx to use useLocalAuth
4. Update user-specific hooks to use localStorage
5. Remove ProfileSetup from App flow
