# DOITEPIC

## Current State
Login page has two separate modes: Login (name + phone) and Register (all fields). New users see an error message and must manually click "Register" to switch. This is confusing and feels like a two-step barrier.

## Requested Changes (Diff)

### Add
- Smart single-entry flow: user enters name + phone, app auto-detects whether they are new or returning
- If returning user: log in immediately
- If new user: seamlessly expand the form in-place to collect age, weight, height, gender, goal -- no tab switching, no error message

### Modify
- LoginPage.tsx: Replace two-mode (login/register) toggle with a single unified smart form
- Step 1: Name + Phone + "Continue" button
- Step 2 (auto-shown for new users): Additional profile fields (age, weight, height, gender, goal) with a "Get Started" button
- Returning users skip Step 2 entirely
- Remove confusing "No account found" error message

### Remove
- Separate "Register" / "Login" toggle links
- Error on first load for new users

## Implementation Plan
1. Redesign LoginPage.tsx with a two-step smart flow
2. Step 1: name + phone; on submit check localStorage -- if user found, log in; if not, reveal Step 2
3. Step 2: age, weight, height, gender, goal; on submit create profile and log in
4. Keep admin modal logic unchanged
