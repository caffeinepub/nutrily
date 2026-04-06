# DOITEPIC

## Current State
The admin panel has a Users tab with role management (Super Admin, Admin, Moderator, User). When the admin tries to change a user's role or ban/suspend them, the action silently fails with a "Failed to update role" toast.

## Requested Changes (Diff)

### Add
- Nothing new to add

### Modify
- **backend/main.mo `savePublicUser`**: Now preserves existing `role`, `status`, and `loginCount` when a user already exists (only updates profile fields). For new users, defaults to `role = "user"`, `status = "active"`, `loginCount = 1`.
- **backend/main.mo `updatePublicUserRole`**: Removed `AccessControl.isAdmin()` guard — the admin panel uses its own hardcoded secret auth, not IC principal auth, so the IC auth guard always blocked this call.
- **backend/main.mo `updatePublicUserStatus`**: Same fix — removed IC auth guard.
- **frontend LoginPage.tsx `syncUserToBackend`**: Now includes `role`, `status`, and `loginCount` fields in the payload (backend type requires all fields).

### Remove
- IC principal auth guards on `updatePublicUserRole` and `updatePublicUserStatus`

## Implementation Plan
1. Backend fixes are done (main.mo patched).
2. Frontend LoginPage fix is done.
3. Validate and deploy.
