## Table `Negotiation`

### Columns

| Name | Type | Constraints |
|------|------|-------------|
| `id` | `uuid` | Primary |
| `offererUid` | `uuid` |  Nullable |
| `requesterUid` | `uuid` |  Nullable |
| `rideId` | `uuid` |  Nullable |
| `status` | `negotiation_status` |  |
| `createdAt` | `timestamp` |  |
| `lastEditedAt` | `timestamp` |  Nullable |
| `pickupLocation` | `varchar` |  Nullable |
| `dropoffLocation` | `varchar` |  Nullable |
| `departureTime` | `varchar` |  Nullable |
| `fare` | `int4` |  Nullable |
| `note` | `varchar` |  Nullable |
| `confirmedByOfferer` | `bool` |  Nullable |
| `confirmedByRequester` | `bool` |  Nullable |
| `lastEditedBy` | `uuid` |  Nullable |
| `updatedAt` | `timestamp` |  Nullable |
