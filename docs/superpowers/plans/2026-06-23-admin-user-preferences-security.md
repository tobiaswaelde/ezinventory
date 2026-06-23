# Admin User Preferences And Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the admin user preferences and security pages so admins can edit language/timezone, set a user's password directly, and disable a user's MFA.

**Architecture:** Keep admin pages thin and driven by `UserContextKey`, move page behavior into dedicated `modules/users/...` components, and add only the missing admin API endpoints required by the new security actions. Reuse existing schemas, shared inputs, and service logic where possible instead of bending self-service `auth` flows to fit admin use cases.

**Tech Stack:** Nuxt 4, Vue 3, Nuxt UI, NestJS 11, Prisma, Jest, Zod

---

### Task 1: Admin Preferences Page

**Files:**
- Create: `apps/web/app/components/modules/users/preferences/general/index.vue`
- Modify: `apps/web/app/pages/(admin)/admin/users/[id]/preferences.vue`

- [ ] **Step 1: Write the failing UI wiring check**

Inspect the existing target page and confirm it is still a placeholder before editing:

```bash
sed -n '1,120p' 'apps/web/app/pages/(admin)/admin/users/[id]/preferences.vue'
```

Expected: the file only contains the `users -> preferences` placeholder.

- [ ] **Step 2: Implement the admin preferences module**

Create a dedicated admin preferences card that accepts `userId` and `preferences`, uses `updateUserPreferencesSchema`, renders language and timezone fields, submits `PATCH /users/:id/preferences`, calls injected `refresh()`, and resets local state from the latest props.

- [ ] **Step 3: Replace the placeholder page**

Update the page so it mirrors `users/[id]/profile.vue`:

- inject `user` via `injectStrict(UserContextKey)`
- read `userId` from route params
- render a `UContainer`
- render the new module when `user.preferences` exists

- [ ] **Step 4: Verify the page references are in place**

Run:

```bash
rg -n "ModulesUsersPreferencesGeneral|injectStrict\\(UserContextKey\\)" \
  'apps/web/app/pages/(admin)/admin/users/[id]/preferences.vue' \
  'apps/web/app/components/modules/users/preferences/general/index.vue'
```

Expected: both files reference the new admin module and `injectStrict(UserContextKey)`.

### Task 2: Admin Security Backend

**Files:**
- Modify: `apps/api/src/modules/users/users.controller.ts`
- Modify: `apps/api/src/modules/users/users.service.ts`
- Modify: `apps/api/src/modules/auth/mfa/mfa.service.ts`
- Create: `apps/api/src/types/modules/user/update-user-password.dto.ts`
- Create: `apps/api/src/modules/users/users.service.spec.ts`

- [ ] **Step 1: Write the failing backend tests**

Add focused Jest coverage for:

- setting another user's password through `UsersService`
- disabling another user's MFA through `MfaService`

Run:

```bash
pnpm --filter @exinventory/api test -- users.service.spec.ts
```

Expected: FAIL because the new admin methods and DTO wiring do not exist yet.

- [ ] **Step 2: Add the admin password DTO and service method**

Create a minimal DTO with a `password` field and add a `setPassword`-style method on `UsersService` that:

- verifies the target user exists
- hashes the new password
- updates `password` and `passwordChangedAt`
- returns the updated payload with `profile` and `preferences`

- [ ] **Step 3: Add the admin MFA disable service method**

Extend `MfaService` with an admin-facing disable path that:

- verifies the target user exists
- rejects when MFA is already disabled
- clears `isMfaEnabled` and `mfaSecret`
- returns the updated payload

- [ ] **Step 4: Expose the admin controller endpoints**

Add controller endpoints for:

- `PATCH /users/:id/password`
- `POST /users/:id/mfa/disable`

Both must reuse the same `CaslAction.Update` policy pattern as the existing admin user mutation endpoints.

- [ ] **Step 5: Verify backend tests pass**

Run:

```bash
pnpm --filter @exinventory/api test -- users.service.spec.ts
```

Expected: PASS.

### Task 3: Admin Security Frontend

**Files:**
- Create: `apps/web/app/components/modules/users/security/password/index.vue`
- Create: `apps/web/app/components/modules/users/security/mfa/index.vue`
- Modify: `apps/web/app/pages/(admin)/admin/users/[id]/security.vue`

- [ ] **Step 1: Write the failing UI wiring check**

Inspect the target page and confirm it is still a placeholder:

```bash
sed -n '1,120p' 'apps/web/app/pages/(admin)/admin/users/[id]/security.vue'
```

Expected: placeholder content only.

- [ ] **Step 2: Implement the admin password card**

Create a card that:

- accepts `userId`
- validates `password` plus `confirmPassword`
- tracks dirty state
- submits `PATCH /users/:id/password`
- clears the form and shows a success toast on completion

- [ ] **Step 3: Implement the admin MFA card**

Create a card that:

- accepts `userId` and `isEnabled`
- shows enabled/disabled state
- offers a disable button only when MFA is enabled
- submits `POST /users/:id/mfa/disable`
- calls injected `refresh()`

- [ ] **Step 4: Replace the security page placeholder**

Update the page to:

- inject `user` via `injectStrict(UserContextKey)`
- read `userId` from route params
- render a `UContainer`
- render the two new security modules

- [ ] **Step 5: Verify UI references are in place**

Run:

```bash
rg -n "ModulesUsersSecurityPassword|ModulesUsersSecurityMfa|injectStrict\\(UserContextKey\\)" \
  'apps/web/app/pages/(admin)/admin/users/[id]/security.vue' \
  'apps/web/app/components/modules/users/security/password/index.vue' \
  'apps/web/app/components/modules/users/security/mfa/index.vue'
```

Expected: all new components are wired in.

### Task 4: Final Verification

**Files:**
- Verify the files changed in Tasks 1-3

- [ ] **Step 1: Run targeted backend verification**

```bash
pnpm --filter @exinventory/api test -- users.service.spec.ts
```

Expected: PASS.

- [ ] **Step 2: Run frontend type/build verification**

```bash
pnpm --filter @ezinventory/web build
```

Expected: successful Nuxt build.

- [ ] **Step 3: Run workspace diff review**

```bash
git diff -- apps/api apps/web
```

Expected: only the planned admin preferences/security changes are present.
