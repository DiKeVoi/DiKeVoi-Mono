## Table `Notification`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `userId` | `uuid` |  Nullable |
| `title` | `varchar` |  Nullable |
| `body` | `varchar` |  Nullable |
| `isRead` | `bool` |  Nullable |
| `createdAt` | `timestamp` |  Nullable |
