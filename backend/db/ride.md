## Table `Ride`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `offerUserId` | `uuid` |  Nullable |
| `requestUserId` | `uuid` |  Nullable |
| `originLocation` | `varchar` |  |
| `destinationLocation` | `varchar` |  |
| `departureTime` | `timestamp` |  |
| `status` | `ride_status` |  |
| `createdAt` | `timestamp` |  |
| `negotiatedCost` | `float8` |  Nullable |
| `returnTime` | `timestamp` |  Nullable |
| `isRecurring` | `bool` |  Nullable |
