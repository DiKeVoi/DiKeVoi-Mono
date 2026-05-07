## Table `User`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `authProvider` | `varchar` |  |
| `email` | `varchar` |  Unique |
| `isVerified` | `bool` |  |
| `createdAt` | `timestamp` |  |
| `displayName` | `varchar` |  Nullable |
| `photoUrl` | `varchar` |  Nullable |
| `gender` | `gender` |  Nullable |
