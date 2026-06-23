# Admin User Preferences And Security Design

## Goal

Complete the admin user detail subpages `users/[id]/preferences` and `users/[id]/security` so an administrator can manage the selected user's preferences, set a new password directly, and disable MFA when needed.

## Scope

This design covers:

- The two missing admin pages under `apps/web/app/pages/(admin)/admin/users/[id]/`
- New admin-facing Vue modules under `apps/web/app/components/modules/users/`
- Minimal backend API additions required for admin security actions

This design does not cover:

- Email-based password reset flows
- Admin-triggered MFA setup or enrollment
- Changes to the self-service preferences and security pages beyond reuse of patterns

## Existing Context

The admin user detail shell in `apps/web/app/pages/(admin)/admin/users/[id].vue` already loads the selected user with `profile` and `preferences` included, then provides a `UserContextKey` with:

- `user: Ref<UserDTO>`
- `refresh(): Promise<void>`

`users/[id]/profile.vue` already shows the intended frontend pattern:

- Keep the page thin
- Use `injectStrict(UserContextKey)` in the page
- Pass concrete props into admin-specific modules

The current codebase also already supports:

- Admin update of `/users/:id/profile`
- Admin update of `/users/:id/preferences`
- Admin avatar upload and delete via `/users/:id/avatar`

The missing pieces are:

- The admin preferences page UI
- The admin security page UI
- Admin endpoints for setting another user's password and disabling another user's MFA

## User Experience

### Admin Preferences Page

The `users/[id]/preferences` page should render a `UContainer` with one card for user preferences:

- Language
- Timezone

The interaction should match the style of the existing self-service preferences pages:

- The card uses `LayoutPageCardHeader`
- Inputs use existing common input components
- Saving shows success/error toasts
- After save, the page refreshes from the server and resets form dirty state

Theme selection is intentionally excluded because the current self-service theme setting is local UI state, not persisted in `UserPreferencesDTO`.

### Admin Security Page

The `users/[id]/security` page should render a `UContainer` with two cards:

- Set password
- Disable MFA

The password card should let an admin:

- Enter a new password
- Confirm the new password
- Save only when the form is valid and dirty

The MFA card should let an admin:

- See whether MFA is enabled for the selected user
- Disable MFA when it is enabled
- Avoid rendering a destructive action when MFA is already disabled

This page should not ask the admin for:

- The target user's current password
- An OTP code from the target user

That keeps admin actions operationally useful and clearly distinct from self-service security flows.

## Frontend Design

### Page Structure

`apps/web/app/pages/(admin)/admin/users/[id]/preferences.vue`

- Inject `user` and `refresh` via `injectStrict(UserContextKey)`
- Render a `UContainer`
- Render the new admin preferences module when `user.preferences` exists

`apps/web/app/pages/(admin)/admin/users/[id]/security.vue`

- Inject `user` and `refresh` via `injectStrict(UserContextKey)`
- Render a `UContainer`
- Render the new admin password module
- Render the new admin MFA module

The page should not own submission logic. It should only read injected context and pass props into modules, matching the existing `users/[id]/profile.vue` structure.

### New Admin Preferences Module

Add a new component such as:

- `apps/web/app/components/modules/users/preferences/general/index.vue`

Responsibilities:

- Accept `userId` and `preferences` as props
- Build a local editable form from `updateUserPreferencesSchema`
- Render language and timezone fields
- Submit `PATCH /users/:id/preferences`
- Call injected `refresh()`
- Reset local form state from refreshed server data
- Show admin-specific success/error toasts

This component should follow the same architectural pattern as:

- `components/modules/users/preferences/profile/index.vue`

It should not depend on `authStore` or `useLocales`, because those are for the currently logged-in user's own preferences.

### New Admin Password Module

Add a new component such as:

- `apps/web/app/components/modules/users/security/password/index.vue`

Responsibilities:

- Accept `userId` as prop
- Use a dedicated admin password schema with:
  - `password`
  - `confirmPassword`
- Track dirty state using the same form helpers already used elsewhere
- Submit to the new admin password endpoint
- Clear the form after success
- Show admin-specific success/error toasts

This component should visually mirror the self-service password card, but the form model is different because there is no `currentPassword` field and no OTP flow.

### New Admin MFA Module

Add a new component such as:

- `apps/web/app/components/modules/users/security/mfa/index.vue`

Responsibilities:

- Accept `userId` and `isEnabled` as props
- Show the current state
- Offer a disable action only when MFA is enabled
- Submit to the new admin MFA disable endpoint
- Call injected `refresh()`
- Show success/error toasts

The component should be small. It does not need the setup/QR flow used by self-service MFA components.

## Backend Design

### Admin Password Endpoint

Add an admin-only endpoint under `UsersController`:

- `PATCH /users/:id/password`

Request body:

- `password`

Behavior:

- Requires the same admin user update policy class already used for other admin user mutations
- Sets the target user's password directly
- Updates password metadata consistently with existing password update logic
- Returns the updated user DTO

Implementation should reuse existing password hashing and persistence logic rather than duplicating it in the controller.

### Admin MFA Disable Endpoint

Add an admin-only endpoint under `UsersController`:

- `POST /users/:id/mfa/disable`

Behavior:

- Requires the same admin user update policy class already used for other admin user mutations
- Disables MFA for the target user without requiring the target user's OTP
- Clears any stored MFA secret or enabled state consistently with existing MFA disable behavior
- Returns the updated user DTO

Implementation should reuse service-layer MFA logic where possible, but must support admin operation on an arbitrary user id.

## Data Flow

### Preferences Save

1. Admin opens `users/[id]/preferences`
2. Page injects `user` from `UserContextKey`
3. Preferences module initializes local schema state from `user.preferences`
4. Admin edits language/timezone
5. Module sends `PATCH /users/:id/preferences`
6. Module awaits injected `refresh()`
7. UI resets to the latest server state and clears dirty state

### Password Set

1. Admin opens `users/[id]/security`
2. Password module initializes empty local form state
3. Admin enters and confirms the new password
4. Module sends `PATCH /users/:id/password`
5. Success toast is shown
6. Form is cleared and dirty state resets

### MFA Disable

1. Admin opens `users/[id]/security`
2. MFA module receives `user.isMfaEnabled`
3. Admin clicks disable
4. Module sends `POST /users/:id/mfa/disable`
5. Module awaits injected `refresh()`
6. UI updates to disabled state and shows success toast

## Validation And Error Handling

### Preferences

- Use `updateUserPreferencesSchema`
- Preserve existing inline validation behavior from the shared form utilities
- Show a generic submission error toast if the request fails

### Password

- Use a dedicated schema requiring:
  - non-empty password
  - confirmation match
- Reuse the existing API error handling pattern where helpful
- Do not keep the entered password in the form after a successful save

### MFA

- Disable action must be guarded in the UI when MFA is already off
- API errors should surface through the shared toast/error handling pattern

## Files Likely To Change

Frontend:

- `apps/web/app/pages/(admin)/admin/users/[id]/preferences.vue`
- `apps/web/app/pages/(admin)/admin/users/[id]/security.vue`
- `apps/web/app/components/modules/users/preferences/general/index.vue`
- `apps/web/app/components/modules/users/security/password/index.vue`
- `apps/web/app/components/modules/users/security/mfa/index.vue`
- Possibly a new admin password schema file in the web app if no suitable schema exists
- Locale files if admin-specific translation keys are added

Backend:

- `apps/api/src/modules/users/users.controller.ts`
- `apps/api/src/modules/users/users.service.ts`
- `apps/api/src/modules/auth/password/password.service.ts` or a shared helper extracted from it
- `apps/api/src/modules/auth/mfa/mfa.service.ts`
- DTO files for admin password update if a dedicated request type is needed

## Testing Strategy

### Frontend

- Verify both pages render correctly from injected user context
- Verify save buttons enable only when forms are valid and dirty
- Verify success paths call `refresh()` where required
- Verify password form clears after success
- Verify MFA disable action disappears or becomes inactive after refresh

### Backend

- Verify admins can update `/users/:id/preferences`
- Verify admins can set `/users/:id/password`
- Verify admins can call `/users/:id/mfa/disable`
- Verify non-admins are rejected by policy checks
- Verify disabling MFA clears the enabled state on the target user

## Risks And Constraints

- The self-service security components are not suitable for direct reuse because they are bound to `authStore`, `currentPassword`, and OTP flows.
- Theme selection should not be copied into admin preferences because it is not part of `UserPreferencesDTO`.
- Password and MFA admin APIs should be small and explicit; trying to overload the self-service auth endpoints would blur responsibilities and make future maintenance harder.

## Recommended Implementation Order

1. Add admin preferences page and module using the already existing `/users/:id/preferences` endpoint
2. Add admin password endpoint and password module
3. Add admin MFA disable endpoint and MFA module
4. Wire the security page and verify full refresh behavior
