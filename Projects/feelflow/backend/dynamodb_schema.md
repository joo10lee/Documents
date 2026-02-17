# DynamoDB Schema Design

## Table: `FeelFlowData`

| Attribute | Type | Key Type | Description |
| :--- | :--- | :--- | :--- |
| **PK** | String | Partition Key | `USER#{userId}` |
| **SK** | String | Sort Key | `ENTRY#{timestamp}` |
| `emotion` | String | - | e.g. "Happy", "Sad" |
| `intensity` | Number | - | 1-10 |
| `notes` | String | - | Optional text note |
| `photo` | String | - | Base64 string or S3 URL (Future) |
| `strategies` | List | - | List of strategies used |

## Access Patterns

1.  **Save Entry**: `PutItem` (PK: `USER#123`, SK: `ENTRY#2023-10-27T10:00:00Z`)
2.  **Get Recent History**: `Query` (PK: `USER#123`, SK begins_with `ENTRY#`, ScanIndexForward=False, Limit=15)
3.  **Guardian View**: Same `Query` pattern (Guardian needs access to Child's `userId`).
