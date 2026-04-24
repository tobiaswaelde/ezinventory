# EZ Inventory

## Settings
- main usage type (changes i18n placeholders, texts, and behavior of the app)
  - warehouse
  - home management
    - disable receive/dispatch status
    - allow store/retrieve without confirmation
- import/export only with delivery note

## Models

### User
- users can signin with email and password
- optional enable MFA

### Warehouses
- warehouses divide the inventory into multiple locations
- meta
  - name (unique, e.g. "home")
  - description
  - icon
  - color
  - location (address)
  - image
  - type (warehouse, home)
- warehouses can have multiple users with different roles
  - admin: full access
  - manager: can manage warehouse storages
  - member: can read details about the warehouse

### Storages
- storages devide the inventory into multiple shelfs
- relations
  - warehouse
- meta
  - name (unique, e.g. "fridge")
  - description
  - icon
  - color
  - type (e.g. Box, Fridge, Cabinet, ...)
  - location (e.g. room, level)
  - image
- storages can have multiple users with different roles
  - admin: full access
  - manager: can manage the storage and shelf places
  - member: can read details about the storage

### Shelf place
- shelf places are the actual places where items are stored
- relations
  - storage
- meta
  - name (unique, e.g. "drawer 1")
  - description
  - icon
  - color
  - type (e.b. box, drawer, shelf place)
  - image

### Inventory Items
- these are the actual items in the inventory
- relations
  - warehouse
  - storage
  - shelf place
- meta  
  - status (ordered, incoming/receive, outgoing/dispatch, in stock)
  - type (single item, mass item)
  - name
  - description
  - article number
  - image
  - amount (number of items for mass articles)