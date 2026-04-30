# API: iAdministrator (`/api/ia`)

**Mount Path:** `/api/ia`  
**File:** `server/ia/routes.ts`  
**Auth Required:** Yes

---

## Overview

The iAdministrator API powers the AI-assisted compliance query interface. It uses a local RAG (Retrieval-Augmented Generation) pipeline to answer natural-language questions grounded in the agency's policy and regulatory content.

---

## Endpoints

---

### POST `/api/ia/query`

**Purpose:** Submit a natural language compliance question and receive a grounded answer.  
**Auth Required:** Yes  

**Request Body:**
```json
{
  "question": "What are the OSHA requirements for home health agencies in California?",
  "context": {
    "domain": "EN",
    "policyId": "EN-OS-001"
  }
}
```

**Fields:**
| Field | Required | Description |
|---|---|---|
| `question` | Yes | Natural language question (max 1000 chars) |
| `context.domain` | No | Compliance domain code to scope the search |
| `context.policyId` | No | Specific policy ID to anchor the query |

**Response (200):**
```json
{
  "answer": "OSHA requires home health agencies to maintain a written exposure control plan...",
  "sources": [
    {
      "policyId": "EN-OS-001",
      "policyTitle": "OSHA Compliance and Safety Plan",
      "section": "3.2 Exposure Control",
      "relevanceScore": 0.94
    },
    {
      "policyId": "EN-OS-002",
      "policyTitle": "Personal Protective Equipment Requirements",
      "section": "2.1 Required PPE",
      "relevanceScore": 0.87
    }
  ],
  "queryId": "ia-q-uuid-v4",
  "processingTimeMs": 1240
}
```

**Error Cases:**
| Code | Reason |
|---|---|
| 400 | Question missing or exceeds length limit |
| 503 | RAG pipeline not initialized (content not loaded) |

---

### GET `/api/ia/status`

**Purpose:** Check whether the RAG pipeline is initialized and ready.  
**Auth Required:** Yes  

**Response (200):**
```json
{
  "ready": true,
  "documentsLoaded": 48,
  "lastIndexedAt": "2026-04-01T00:00:00Z",
  "vectorDimension": 1536
}
```

**Response when not ready:**
```json
{
  "ready": false,
  "reason": "Vector store not initialized"
}
```

---

### POST `/api/ia/feedback`

**Purpose:** Submit feedback on a previous query result.  
**Auth Required:** Yes  

**Request Body:**
```json
{
  "queryId": "ia-q-uuid-v4",
  "rating": "helpful | not_helpful | partially_helpful",
  "comment": "The answer was accurate but missing the billing implications."
}
```

**Response (200):** `{ "message": "Feedback recorded" }`

---

## Notes

- The iAdministrator RAG pipeline operates on the policy content loaded at server startup; it does not query live external sources
- Responses are advisory only — they do not constitute legal or regulatory guidance
- All queries are logged for audit purposes (question, actor, timestamp — not the answer text)
- The feedback endpoint allows continuous improvement of relevance scoring
