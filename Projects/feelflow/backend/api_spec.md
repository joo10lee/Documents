# API Specification

## Base URL
`https://{api-id}.execute-api.{region}.amazonaws.com/prod`

## Endpoints

### 1. `POST /emotion`
Records a new emotion entry.

**Request Body:**
```json
{
  "userId": "user_123",
  "emotion": "Happy",
  "intensity": 8,
  "timestamp": "2023-10-27T10:00:00Z",
  "notes": "Had a great lunch"
}
```

**Response:** `200 OK`

### 2. `GET /history`
Retrieves recent history.

**Query Params:**
- `userId`: `user_123`
- `limit`: `15` (default)

**Response:**
```json
[
  {
    "timestamp": "2023-10-27T10:00:00Z",
    "emotion": "Happy",
    "intensity": 8,
    ...
  },
  ...
]
```

### 3. `POST /guardian/link` (Future)
Links a Guardian account to a Child account.
