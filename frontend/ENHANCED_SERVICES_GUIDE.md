# CyberSage 2.0 Enhanced Services Guide

## Overview

This guide documents the enterprise-grade API service layer and backend integration system introduced in Phase 2 of CyberSage 2.0. The enhanced services provide advanced reliability, performance monitoring, and error handling capabilities for production environments.

## Key Enhancements

### 1. **Advanced Error Handling Framework**

The system now includes a comprehensive error handling framework with:

- **Error Classification**: Network, timeout, authentication, validation, and server errors
- **User-Friendly Messages**: Translation of technical errors into user-understandable messages
- **Error History**: Tracking of recent errors for debugging and user feedback
- **Automatic Error Recovery**: Smart retry logic with exponential backoff

**Location**: `src/utils/errors.js`

**Usage Example**:
```javascript
try {
  const result = await enhancedApiService.get('/api/endpoint');
} catch (error) {
  if (error.type === ERROR_TYPES.NETWORK_ERROR) {
    console.log('Connection failed. Please check your internet connection.');
  } else if (error.type === ERROR_TYPES.RATE_LIMIT_ERROR) {
    console.log('Too many requests. Please wait before trying again.');
  }
}
```

### 2. **LRU Response Caching**

- **Smart Caching**: LRU (Least Recently Used) cache with TTL support
- **Cache Statistics**: Hit/miss ratios and performance metrics
- **Automatic Cleanup**: Automatic eviction of expired and least-used entries
- **Configurable TTL**: Different cache durations for different data types

**Location**: `src/utils/cache.js`

**Usage Example**:
```javascript
// Cache is automatically managed by enhancedApiService
const data = await enhancedApiService.get('/api/data', {}, { cache: true, ttl: 300000 }); // 5 minutes
```

### 3. **Connection Health Monitoring**

Real-time monitoring of connection quality with:

- **Latency Tracking**: Round-trip time measurements
- **Connection Quality Scoring**: Automated quality assessment (good/fair/poor)
- **Health Checks**: Regular ping/pong tests
- **Automatic Recovery**: Self-healing connection management

**Location**: `src/utils/connection.js`

**Features**:
- Exponential moving average for latency smoothing
- Automatic reconnection with exponential backoff
- Connection quality dashboard metrics
- Network state monitoring (online/offline)

### 4. **Request Queuing System**

Intelligent request management for offline scenarios:

- **Priority-Based Queuing**: High, normal, and low priority requests
- **Offline Support**: Queue requests when offline, process when connected
- **Automatic Retry**: Failed requests are automatically retried
- **Queue Statistics**: Monitor queue size and processing metrics

**Location**: `src/utils/queue.js`

**Usage Example**:
```javascript
// Request is automatically queued when offline
await enhancedApiService.post('/api/important-data', data, { 
  priority: QUEUE_CONFIG.PRIORITY_HIGH,
  offline: true 
});
```

### 5. **Enhanced API Service**

Complete rewrite of the API service with:

#### Retry Logic with Exponential Backoff
- **Smart Retries**: Configurable retry attempts and delays
- **Exponential Backoff**: Progressive delay increase to avoid overwhelming servers
- **Jitter**: Random delays to prevent thundering herd
- **Condition-Based**: Only retry on recoverable errors

#### Request Timeout Handling
- **Configurable Timeouts**: Different timeouts for different operation types
- **AbortController**: Clean timeout cancellation
- **User Feedback**: Timeout error messages for user guidance

#### Request Deduplication
- **Hash-Based Deduplication**: Prevent duplicate in-flight requests
- **Promise Reuse**: Return existing promises for duplicate requests
- **Performance Optimization**: Reduced server load and bandwidth usage

#### Rate Limiting
- **Token Bucket Algorithm**: Smooth rate limiting without burst blocking
- **Configurable Limits**: Custom rate limits per endpoint
- **Automatic Throttling**: Prevents API abuse and maintains service quality

**Location**: `src/services/enhancedApi.js`

**Usage Examples**:
```javascript
// Automatic retry with exponential backoff
const data = await enhancedApiService.get('/api/data');

// Request deduplication - second call uses cached promise
const [data1, data2] = await Promise.all([
  enhancedApiService.get('/api/data'),
  enhancedApiService.get('/api/data') // Uses same promise as data1
]);

// Rate-limited requests
await enhancedApiService.post('/api/submit', formData);
```

### 6. **Enhanced WebSocket Service**

Robust WebSocket management with:

#### Advanced Reconnection Strategy
- **State Machine**: Clear connection state management (disconnected, connecting, connected, reconnecting, failed)
- **Exponential Backoff**: Increasing delay between reconnection attempts
- **Max Attempts**: Automatic failure handling after retry limit
- **Manual Recovery**: Support for manual reconnection triggers

#### Health Monitoring
- **Ping/Pong Tests**: Regular connection health verification
- **Latency Tracking**: WebSocket-specific latency measurements
- **Quality Scoring**: Connection quality assessment
- **Performance Metrics**: Throughput and reliability tracking

#### Message Queuing
- **Offline Message Storage**: Queue messages when disconnected
- **Automatic Flushing**: Send queued messages when connection restored
- **Priority Handling**: Send high-priority messages first
- **Queue Management**: Prevent memory bloat with queue size limits

#### Event Batching
- **Event Aggregation**: Batch similar events for performance
- **Debouncing**: Prevent event flooding
- **Buffer Management**: Smart buffering with size limits

**Location**: `src/services/enhancedWebSocket.js`

**Connection States**:
```javascript
WS_CONNECTION_STATES.DISCONNECTED    // Not connected
WS_CONNECTION_STATES.CONNECTING      // Attempting to connect  
WS_CONNECTION_STATES.CONNECTED       // Active connection
WS_CONNECTION_STATES.RECONNECTING    // Reconnecting after failure
WS_CONNECTION_STATES.FAILED          // Permanent failure
```

### 7. **Enhanced Context Provider**

Comprehensive React context integration:

#### Connection Monitoring Integration
- **Real-Time Status**: Live connection state updates
- **Quality Display**: User-visible connection quality indicators
- **Health Metrics**: Performance metrics in UI state

#### Offline Support
- **Queue Management**: Display offline queue status to users
- **Sync Indicators**: Visual feedback when offline/online
- **Data Synchronization**: Handle data updates after reconnection

#### Error Handling
- **User-Friendly Errors**: Translate technical errors to user messages
- **Error Recovery**: Automatic retry with user feedback
- **Error History**: Display recent errors for debugging

**Location**: `src/context/EnhancedScanContext.js`

## Configuration

### API Configuration
```javascript
// Retry settings
RETRY_CONFIG: {
  maxAttempts: 3,
  baseDelay: 1000,        // 1 second
  maxDelay: 30000,        // 30 seconds
  multiplier: 2,
  jitter: 0.1
}

// Cache settings
CACHE_CONFIG: {
  maxSize: 100,          // Maximum cache entries
  defaultTTL: 300000     // 5 minutes
}

// Timeout settings
TIMEOUT: {
  DEFAULT: 10000,        // 10 seconds
  SCAN: 30000,           // 30 seconds
  LARGE_RESPONSE: 60000  // 60 seconds
}
```

### WebSocket Configuration
```javascript
// Reconnection settings
RECONNECT_CONFIG: {
  maxAttempts: 5,
  baseDelay: 1000,       // 1 second
  maxDelay: 30000,       // 30 seconds
}

// Health check settings
WS_HEALTH_CHECK_INTERVAL: 25000     // 25 seconds
WS_PING_TIMEOUT: 5000              // 5 seconds
```

### Rate Limiting
```javascript
RATE_LIMIT_CONFIG: {
  tokensPerInterval: 10,    // 10 requests
  interval: 60000,          // per minute
  burstLimit: 20            // maximum burst
}
```

## Migration Guide

### From Old Services to Enhanced Services

#### 1. Update Imports
```javascript
// OLD
import { useScan } from '../context/ScanContext';
import apiService from '../services/api';
import webSocketService from '../services/websocket';

// NEW
import { useScan } from '../context/EnhancedScanContext';
import { enhancedApiService } from '../services/enhancedApi';
import { enhancedWebSocketService } from '../services/enhancedWebSocket';
```

#### 2. Update WebSocket Usage
```javascript
// OLD
webSocketService.emitMessage('event', data);
webSocketService.subscribe('event', callback);

// NEW
enhancedWebSocketService.emit('event', data);
enhancedWebSocketService.subscribe('event', callback);
```

#### 3. Update API Usage
```javascript
// OLD
const response = await apiService.get('/api/data');

// NEW
const response = await enhancedApiService.get('/api/data', {}, {
  cache: true,              // Enable caching
  retry: true,              // Enable retry logic
  timeout: 10000            // Custom timeout
});
```

## Monitoring and Debugging

### Performance Metrics
The enhanced services provide comprehensive performance metrics:

- **Request Latency**: Average, min, max response times
- **Cache Performance**: Hit/miss ratios and eviction rates
- **Connection Quality**: Latency trends and quality scores
- **Error Rates**: Error types and frequency
- **WebSocket Health**: Connection uptime and message throughput

### Debug Methods
```javascript
// Get cache statistics
const cacheStats = cacheManager.getStatistics();

// Get connection quality
const connectionQuality = connectionMonitor.getConnectionQuality();

// Get API performance metrics
const apiMetrics = enhancedApiService.getMetrics();

// Get WebSocket health status
const wsHealth = enhancedWebSocketService.getHealthMetrics();
```

### Error Debugging
```javascript
// Enable detailed error logging
ErrorLogger.enableDetailedLogging();

// Get error history
const recentErrors = errorHistory.slice(0, 10);

// Check specific error details
if (error.details) {
  console.log('Error details:', error.details);
}
```

## Best Practices

### 1. **Error Handling**
- Always wrap API calls in try-catch blocks
- Display user-friendly error messages
- Log detailed errors for debugging
- Implement fallback behaviors

### 2. **Caching**
- Enable caching for frequently accessed data
- Set appropriate TTL values for different data types
- Monitor cache hit rates
- Clear cache when user sessions end

### 3. **Connection Management**
- Monitor connection quality indicators
- Provide user feedback for connection issues
- Implement offline fallbacks
- Handle reconnection gracefully

### 4. **Performance**
- Use request deduplication to prevent duplicate calls
- Implement rate limiting to avoid API abuse
- Monitor performance metrics regularly
- Optimize based on usage patterns

## Troubleshooting

### Common Issues

#### 1. Connection Drops
**Symptoms**: Intermittent disconnections, failed requests
**Solutions**: 
- Check network stability
- Verify WebSocket server configuration
- Review reconnection settings

#### 2. High Cache Miss Rates
**Symptoms**: Slow API response times, frequent network calls
**Solutions**:
- Increase cache size limits
- Extend TTL for stable data
- Review cache key generation

#### 3. Rate Limiting
**Symptoms**: 429 errors, throttled requests
**Solutions**:
- Review rate limit configurations
- Implement request batching
- Add delays between requests

#### 4. Memory Issues
**Symptoms**: Increasing memory usage, performance degradation
**Solutions**:
- Monitor queue sizes
- Clear expired cache entries
- Review WebSocket buffer limits

### Debug Commands
```javascript
// Check overall system health
console.log('System Health:', {
  cache: cacheManager.getStatistics(),
  connection: connectionMonitor.getConnectionQuality(),
  queue: requestQueue.getStatistics(),
  apiMetrics: enhancedApiService.getMetrics(),
  wsHealth: enhancedWebSocketService.getHealthMetrics()
});
```

## Conclusion

The enhanced services provide a robust, production-ready foundation for CyberSage 2.0 with enterprise-grade reliability, performance monitoring, and error handling. The modular architecture allows for easy customization and extension while maintaining backward compatibility with existing functionality.

For additional support or custom configurations, refer to the inline documentation in each service file or contact the development team.
