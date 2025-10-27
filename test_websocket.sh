#!/bin/bash

echo "🧪 WebSocket Connection Test"
echo "=========================="

echo ""
echo "1. Testing backend HTTP endpoint..."
curl -s http://localhost:5000/api/health | python3 -m json.tool

if [ $? -eq 0 ]; then
    echo "✅ Backend HTTP endpoint is working"
else
    echo "❌ Backend HTTP endpoint failed"
fi

echo ""
echo "2. Testing backend WebSocket endpoint..."
echo "   Open browser and go to: http://localhost:3000"
echo "   Look for the WebSocket Debug Panel in the UI"
echo "   You should see logs like:"
echo "   [INFO] WebSocket hook initialized"
echo "   [SUCCESS] Backend found at: http://localhost:5000"
echo "   [SUCCESS] WebSocket connected successfully!"

echo ""
echo "3. Manual test steps:"
echo "   - Click 'Send Ping' button in debug panel"
echo "   - Click 'Test Connection' button in debug panel"
echo "   - Click 'Log to Console' to see detailed info"
echo "   - Check browser console (F12) for WebSocket logs"

echo ""
echo "4. If still not working:"
echo "   - Check browser console for errors"
echo "   - Verify no firewall is blocking port 5000"
echo "   - Try incognito mode (Ctrl+Shift+N)"
echo "   - Check if any browser extensions are blocking WebSockets"

echo ""
echo "Expected console output:"
echo "✅ [WebSocket] Backend discovered at: http://localhost:5000"
echo "✅ [WebSocket] Connected successfully!"
echo "🏓 [WebSocket] Pong received - Connection healthy"
echo "🧪 [WebSocket] Test connection received from <socket_id>"

echo ""
echo "Press Ctrl+C to stop testing"
