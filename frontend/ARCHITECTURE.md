# CyberSage 2.0 - Modern Frontend Architecture

## Architecture Overview

The frontend has been completely restructured from a monolithic application to a modern, maintainable React architecture with proper separation of concerns.

## New Architecture Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context for state management
├── pages/              # Page-level components
├── services/           # API and external service integrations
├── utils/              # Constants and utility functions
└── styles/             # Global styles
```

## Key Improvements

### 1. **React Router Integration**
- **Before**: Simple state-based page switching with `currentPage` state
- **After**: Proper React Router implementation with URL-based navigation

### 2. **Context-Based State Management**
- **Before**: Prop drilling through monolithic App.jsx (1200+ lines)
- **After**: Centralized state management with React Context (`ScanContext`)

### 3. **Environment Configuration**
- **Before**: Hardcoded URLs (`http://localhost:5000`)
- **After**: Environment-based configuration in `.env` file

### 4. **Modular Component Structure**
- **Before**: All components embedded in one file
- **After**: Separate page components and reusable UI components

### 5. **Service Layer**
- **Before**: Direct WebSocket connections scattered throughout code
- **After**: Dedicated service classes for API calls and WebSocket management

## New Components

### Pages
- `DashboardPage.jsx` - Security dashboard overview
- `ScannerPage.jsx` - Scan configuration and initiation
- `VulnerabilitiesPage.jsx` - Vulnerability management and filtering
- `ChainsPage.jsx` - Attack chain visualization and management
- `ToolsPage.jsx` - Professional tools overview and status
- `RepeaterPage.jsx` - HTTP request testing interface
- `HistoryPage.jsx` - Scan history management
- `StatisticsPage.jsx` - Detailed scan statistics
- `BlueprintPage.jsx` - Security blueprint visualization

### Services
- `services/api.js` - HTTP API service layer
- `services/websocket.js` - WebSocket connection management

### Context
- `context/ScanContext.js` - Global scan state management

### Utils
- `utils/constants.js` - Application constants and configuration

## Navigation System

The application now uses React Router for client-side routing:

- `/` - Dashboard
- `/scanner` - Scanner configuration
- `/vulnerabilities` - Vulnerabilities view
- `/chains` - Attack chains
- `/repeater` - HTTP repeater
- `/history` - Scan history
- `/blueprint` - Security blueprint
- `/statistics` - Scan statistics
- `/tools` - Professional tools

## Environment Configuration

The application now uses environment variables:

```env
# Backend API Configuration
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_WS_URL=http://localhost:5000

# Development Settings
REACT_APP_ENV=development
REACT_APP_VERSION=2.0.0
```

## State Management

The `ScanContext` provides centralized state management for:

- WebSocket connection status
- Scan status and progress
- Vulnerability data
- Tool activity
- AI insights
- HTTP history
- Persistent logs

## Key Benefits

1. **Maintainability**: Code is now modular and easier to maintain
2. **Scalability**: New features can be added without affecting existing code
3. **Reusability**: Components and services can be reused across the application
4. **Testability**: Individual components and services can be tested in isolation
5. **Developer Experience**: Better code organization and IDE support
6. **Environment Flexibility**: Easy configuration for different deployment environments

## Migration from Old Architecture

### Removed Dependencies
- Complex prop drilling
- Hardcoded backend URLs
- Monolithic component structure

### New Dependencies
- `react-router-dom` - For client-side routing
- Context API for state management
- Service layer pattern for API integration

## Backward Compatibility

All existing functionality has been preserved:
- WebSocket communication
- Real-time updates
- Vulnerability detection
- Scan control
- HTTP repeater
- All UI components and styling

The only change is the internal architecture - the user experience remains the same.