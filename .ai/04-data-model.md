# 04 - Data Model (Conceptual)

## ID Convention

- Every `id` field in this document is a UUID v4.
- All references (`*Id` fields) point to UUID v4 primary keys.
- Numeric auto-increment IDs are not used.

## Core Entities

### User
- `id`
- `email` (unique)
- `passwordHash`
- `displayName`
- `role` (`ADMIN`, `MANAGER`, `STAFF`, `VIEWER`)
- `preferredLanguage` (`de`, `en`, default `en`)
- `createdAt`, `updatedAt`

### PermissionPolicy
- `id`
- `subject` (e.g. `Item`, `Container`, `Movement`, `MediaAsset`, `User`)
- `action` (e.g. `read`, `create`, `update`, `delete`, `manage`, `stockOut`)
- `conditions` (JSON, CASL-compatible condition object, nullable)
- `inverted` (boolean, default `false`)
- `reason` (nullable)
- `createdAt`

### RolePermissionPolicy
- `id`
- `role` (`ADMIN`, `MANAGER`, `STAFF`, `VIEWER`)
- `permissionPolicyId`
- `createdAt`
- Unique constraint: `(role, permissionPolicyId)`

### UserPermissionPolicy
- `id`
- `userId`
- `permissionPolicyId`
- `createdAt`
- Unique constraint: `(userId, permissionPolicyId)`

### PasskeyCredential
- `id`
- `userId`
- `credentialId` (unique)
- `publicKey`
- `counter`
- `transports` (JSON)
- `deviceName` (nullable)
- `createdAt`
- `lastUsedAt` (nullable)

### SystemSetting
- `id`
- `key` (unique)
- `value` (JSON)
- `updatedAt`
  - Example keys:
    - `registration.mode` (`OPEN`, `ADMIN_ONLY`)
    - `setup.initialized` (`true`/`false`)

### Location
- `id`
- `name` (unique)
- `code` (unique)
- `description`
- `iconSet` (`TABLER`, `LUCIDE`, nullable)
- `iconName` (nullable)
- `isActive`

### Container
- `id`
- `locationId`
- `parentContainerId` (nullable, self relation)
- `type` (`SHELF`, `BOX`, `FRIDGE`, `BIN`, `CUSTOM`)
- `name`
- `code` (unique)
- `qrCodeValue` (unique)
- `description`
- `iconSet` (`TABLER`, `LUCIDE`, nullable)
- `iconName` (nullable)
- `isActive`
- `createdAt`, `updatedAt`

### Category
- `id`
- `name` (unique)
- `description`
- `iconSet` (`TABLER`, `LUCIDE`, nullable)
- `iconName` (nullable)

### Item
- `id`
- `sku` (unique)
- `qrCodeValue` (unique)
- `name`
- `description`
- `iconSet` (`TABLER`, `LUCIDE`, nullable)
- `iconName` (nullable)
- `categoryId`
- `unit` (e.g. pcs)
- `sizeLabel` (nullable, e.g. "jar", "pack", "bottle")
- `sizeValue` (nullable, numeric)
- `sizeUnit` (nullable, e.g. "ml", "g", "servings")
- `servings` (nullable, integer)
- `minStock`
- `isActive`
- `createdAt`, `updatedAt`

### Stock
- `id`
- `itemId`
- `containerId`
- `quantity` (`>= 0`)
- `updatedAt`
- Unique constraint: `(itemId, containerId)`

### StockMovement
- `id`
- `type` (`IN`, `OUT`, `TRANSFER`, `ADJUSTMENT`)
- `itemId`
- `fromContainerId` (nullable)
- `toContainerId` (nullable)
- `quantity` (`> 0`)
- `reason` (nullable)
- `performedByUserId`
- `createdAt`

### ImageAttachment
- `id`
- `ownerType` (`LOCATION`, `CONTAINER`, `ITEM`, `MOVEMENT`)
- `ownerId`
- `fileName`
- `mimeType`
- `sizeBytes`
- `width`
- `height`
- `storageKey` (RustFS object key)
- `uploadedByUserId`
- `createdAt`

### MediaAsset
- `id`
- `attachmentId` (unique, references `ImageAttachment`)
- `title`
- `tags` (JSON array)
- `isArchived`
- `createdByUserId`
- `createdAt`

### MovementMediaLink
- `id`
- `movementId`
- `mediaAssetId`
- `createdAt`
- Unique constraint: `(movementId, mediaAssetId)`

### BarcodeLabel
- `id`
- `entityType` (`CONTAINER`, `ITEM`)
- `entityId`
- `qrCodeValue`
- `template` (`A4_GRID`)
- `generatedByUserId`
- `generatedAt`

### AuditLog
- `id`
- `actorUserId`
- `action`
- `entityType`
- `entityId`
- `before` (JSON)
- `after` (JSON)
- `requestId`
- `createdAt`

## Critical Rules

- MVP tenancy model is single-tenant.
- Freely nested containers are supported through `parentContainerId`.
- Container cycles are forbidden.
- `OUT` cannot reduce stock below zero.
- `OUT` requires a non-empty `reason`.
- `TRANSFER` updates source and target atomically.
- `ADJUSTMENT` requires a non-empty `reason`.
- Every stock change creates a `StockMovement` record.
- Critical mutations also create `AuditLog` records.
- QR values are globally unique and resolvable for both containers and items.
- Item size metadata supports freezer/pantry-style inventory semantics (e.g. 3 servings).
- Stock-in flow can link one or more `MediaAsset` records to movement entries.
- Initial admin signup is allowed only when `setup.initialized = false`.
- Authorization is evaluated via CASL abilities resolved from role and optional user-level policies.
- UI theme preference is client-side state (local storage, cookie fallback), not persisted in DB.
- Image attachments support location and container photos for storage context.
- Icon metadata must reference allowed sets only (`TABLER`, `LUCIDE`) with valid icon names.
- All primary keys and foreign keys use UUID v4 only.
