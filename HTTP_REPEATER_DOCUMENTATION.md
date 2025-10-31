# 🔄 HTTP Repeater - Professional HTTP Testing Tool

## Overview
A powerful, Postman-like HTTP testing tool integrated into CyberSage v2.0 Elite. Test APIs, repeat requests, manage environments, and analyze responses with a beautiful dark-themed interface.

---

## ✨ Features Implemented

### Core Features ✅
- ✅ **Request Editor** with method selector (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- ✅ **URL Input** with custom headers and body support
- ✅ **Response Viewer** with status codes, headers, and body
- ✅ **Request History Panel** with timestamp and duration tracking
- ✅ **Export Functionality** - Save request/response in JSON, HAR, cURL formats
- ✅ **Pretty/Raw JSON Formatting** for responses
- ✅ **Color-coded Status Badges** and HTTP methods
- ✅ **Keyboard Shortcut** (Ctrl/Cmd+Enter) to send requests
- ✅ **Response Size Display** - Shows bytes/KB of data received

### Advanced Features ✅
- ✅ **Environment Variables** - Define base URLs, tokens for dev/staging/prod
- ✅ **Collections** - Save and organize requests
- ✅ **Request Tabs** - Headers, Body, Auth, Scripts
- ✅ **Response Tabs** - Body, Headers, Timeline
- ✅ **Timeline Visualization** - Request duration and size metrics
- ✅ **Split-panel Layout** - History sidebar + main request/response area
- ✅ **Dark Theme** with gradient accents
- ✅ **Professional Styling** similar to Hetty/Postman

### Additional Features for Future
- 🔄 Request Chaining (use response from one request as input for next)
- 🔄 JavaScript Scripting (pre/post hooks)
- 🔄 Response Diffing (compare two responses)
- 🔄 Built-in Fuzzer (parameter injection)
- 🔄 Auto Retry with rate limit handling
- 🔄 WebSocket Support

---

## 🎨 UI Design

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                      Top Bar                                │
│ [Environment ▼] [GET ▼] [URL Input] [Send] [Save]          │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   History    │          Request Panel                       │
│   Sidebar    │  ┌─────────────────────────────────┐        │
│              │  │ Headers | Body | Auth | Scripts │        │
│   • GET /api │  ├─────────────────────────────────┤        │
│     200 OK   │  │                                  │        │
│     45ms     │  │  Header inputs or               │        │
│              │  │  Body editor                    │        │
│   • POST     │  │                                  │        │
│     /login   │  └─────────────────────────────────┘        │
│     401      │                                              │
│     120ms    │          Response Panel                      │
│              │  ┌─────────────────────────────────┐        │
│   [Collections] │ Body | Headers | Timeline       │        │
│              │  ├─────────────────────────────────┤        │
│   • Auth     │  │                                  │        │
│   • Users    │  │  Pretty JSON response           │        │
│   • Products │  │  or headers display             │        │
│              │  │                                  │        │
│              │  └─────────────────────────────────┘        │
└──────────────┴──────────────────────────────────────────────┘
```

### Color Scheme
- **Methods**: 
  - GET: Green (`bg-green-500`)
  - POST: Blue (`bg-blue-500`)
  - PUT: Yellow (`bg-yellow-500`)
  - PATCH: Purple (`bg-purple-500`)
  - DELETE: Red (`bg-red-500`)
  - HEAD: Gray (`bg-gray-500`)
  - OPTIONS: Indigo (`bg-indigo-500`)

- **Status Codes**:
  - 2xx: Green (`text-green-400`)
  - 3xx: Yellow (`text-yellow-400`)
  - 4xx: Orange (`text-orange-400`)
  - 5xx: Red (`text-red-400`)

---

## 🚀 How to Use

### 1. Access the Repeater
- Click **🔄 Repeater** in the sidebar navigation
- The HTTP Repeater opens in a new tab

### 2. Configure Environment
- Select environment from dropdown (Development/Staging/Production)
- Use variables like `{{baseUrl}}` or `{{token}}` in URLs and headers

### 3. Build Your Request
**Method & URL**:
```
[GET ▼] https://{{baseUrl}}/api/users
```

**Headers Tab**:
```
Authorization: Bearer {{token}}
Content-Type: application/json
X-Custom-Header: value
```

**Body Tab** (for POST/PUT/PATCH):
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### 4. Send Request
- Click **Send** button or press **Ctrl+Enter**
- Watch the loading animation
- Response appears instantly

### 5. Analyze Response
**Response Header**:
- Status code with color coding
- Response time in milliseconds
- Response size in KB

**Body Tab**:
- Toggle between Pretty/Raw formatting
- Syntax-highlighted JSON
- Copy or export response

**Headers Tab**:
- All response headers displayed
- Key-value format

**Timeline Tab**:
- Request duration breakdown
- Response size metrics
- Total time calculation

### 6. Save & Export
**Save to Collection**:
- Click **Save** button
- Enter request name
- Access from Collections sidebar

**Export Options**:
- **Export JSON** - Response as JSON file
- **Export HAR** - HTTP Archive format
- **Export cURL** - As cURL command

---

## 🔧 Technical Implementation

### Frontend Component
**Location**: `frontend/src/components/HttpRepeater.jsx`

**Key Features**:
- React hooks for state management
- Real-time updates with useState
- Keyboard event listeners
- File export with file-saver library
- Environment variable replacement
- Request history management

### Backend API
**Location**: `backend/api/repeater.py`

**Endpoints**:
- `POST /api/repeater/proxy` - Proxy HTTP requests
- `GET /api/repeater/collections` - Get saved collections
- `POST /api/repeater/collections` - Save new collection
- `GET /api/repeater/history` - Get request history
- `GET /api/repeater/environments` - Get environment variables
- `POST /api/repeater/environments` - Save environment variables

**Features**:
- Request proxying with timeout (30s)
- Header manipulation
- JSON/Form data support
- Error handling
- Response size calculation

---

## 📦 Installation

### 1. Install Dependencies
```bash
cd frontend
npm install file-saver
```

### 2. Start Backend
```bash
cd backend
python app.py
```

### 3. Start Frontend
```bash
cd frontend
npm start
```

### 4. Access Repeater
- Open http://localhost:3000
- Click **🔄 Repeater** in sidebar

---

## 🎯 Use Cases

### API Testing
- Test REST APIs with different methods
- Validate response formats
- Check authentication flows
- Test error handling

### Security Testing
- Manually verify vulnerabilities
- Test authorization bypasses
- Inject payloads
- Analyze headers

### Development
- Debug API endpoints
- Test webhooks
- Validate integrations
- Mock requests

### Documentation
- Export requests as cURL
- Save request collections
- Generate HAR files
- Share with team

---

## 🔑 Environment Variables

### Default Environments
```javascript
dev: {
  baseUrl: 'http://localhost:3000',
  token: '',
  apiKey: ''
},
staging: {
  baseUrl: 'https://staging.example.com',
  token: '',
  apiKey: ''
},
prod: {
  baseUrl: 'https://api.example.com',
  token: '',
  apiKey: ''
}
```

### Using Variables
In URLs:
```
{{baseUrl}}/api/users/{{userId}}
```

In Headers:
```
Authorization: Bearer {{token}}
X-API-Key: {{apiKey}}
```

In Body:
```json
{
  "apiKey": "{{apiKey}}",
  "environment": "{{environment}}"
}
```

---

## 🎨 Visual Features

### Request History
- Timestamp for each request
- Duration in milliseconds
- Response size in KB
- Status code with color
- Click to reload request

### Collections
- Organized request library
- Named requests
- Quick access
- Method badges

### Export Formats

**JSON Export**:
```json
{
  "status": 200,
  "headers": {...},
  "body": {...},
  "time": 145,
  "size": 2048
}
```

**HAR Export**:
```json
{
  "log": {
    "version": "1.2",
    "creator": {
      "name": "CyberSage",
      "version": "2.0"
    },
    "entries": [...]
  }
}
```

**cURL Export**:
```bash
curl -X POST "https://api.example.com/users" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token123" \
  -d '{"name":"John"}'
```

---

## 🚀 Future Enhancements

### Request Chaining
```javascript
// Use response from Request 1 in Request 2
const token = response1.body.token;
setHeader('Authorization', `Bearer ${token}`);
```

### Pre/Post Scripts
```javascript
// Pre-request
pm.environment.set("timestamp", Date.now());

// Post-response
if (pm.response.code === 200) {
  pm.environment.set("userId", pm.response.json().id);
}
```

### Response Diffing
- Compare two responses side-by-side
- Highlight differences
- Track API changes

### Fuzzer Mode
- Auto-generate request variations
- Parameter fuzzing
- Boundary testing
- Rate limit testing

### WebSocket Support
- WS/WSS connections
- Send/receive messages
- Connection management
- Event logging

---

## 🎯 Benefits

### For Security Testing
- ✅ Manually verify scanner findings
- ✅ Test authentication/authorization
- ✅ Inject custom payloads
- ✅ Analyze security headers

### For Development
- ✅ Quick API testing
- ✅ No external tools needed
- ✅ Integrated with scanner
- ✅ Beautiful dark theme

### For Documentation
- ✅ Export requests for sharing
- ✅ Save collections for reuse
- ✅ Generate cURL commands
- ✅ HAR format for analysis

---

## Summary

The HTTP Repeater is a **professional-grade HTTP testing tool** integrated into CyberSage v2.0 Elite. It provides:

✅ **Full HTTP method support** with color coding
✅ **Environment variables** for different stages
✅ **Request collections** for organization
✅ **Multiple export formats** (JSON, HAR, cURL)
✅ **Beautiful dark UI** with gradients
✅ **Keyboard shortcuts** for efficiency
✅ **Response analysis** with timeline
✅ **Request history** with quick replay

**Perfect for manual testing, API debugging, and vulnerability verification!** 🚀🔄
