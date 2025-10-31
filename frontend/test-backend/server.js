const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');

class TestBackendService {
  constructor() {
    this.app = express();
    this.server = null;
    this.wss = null;
    this.clients = new Set();
    this.vulnerabilities = this.generateMockVulnerabilities(100);
    this.scanResults = this.generateMockScanResults();
    this.isConnected = false;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '2.0.0-test'
      });
    });

    // API endpoints for testing
    this.app.get('/api/vulnerabilities', (req, res) => {
      const { page = 1, limit = 20, severity, search } = req.query;
      let filteredVulnerabilities = [...this.vulnerabilities];

      // Apply filters
      if (severity) {
        filteredVulnerabilities = filteredVulnerabilities.filter(v => v.severity === severity);
      }

      if (search) {
        filteredVulnerabilities = filteredVulnerabilities.filter(v => 
          v.title.toLowerCase().includes(search.toLowerCase()) ||
          v.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedVulnerabilities = filteredVulnerabilities.slice(startIndex, endIndex);

      res.json({
        vulnerabilities: paginatedVulnerabilities,
        total: filteredVulnerabilities.length,
        page: parseInt(page),
        limit: parseInt(limit),
        stats: this.calculateStats(filteredVulnerabilities)
      });
    });

    this.app.get('/api/vulnerabilities/:id', (req, res) => {
      const vulnerability = this.vulnerabilities.find(v => v.id === parseInt(req.params.id));
      if (vulnerability) {
        res.json(vulnerability);
      } else {
        res.status(404).json({ error: 'Vulnerability not found' });
      }
    });

    this.app.post('/api/vulnerabilities/:id/export', (req, res) => {
      const vulnerability = this.vulnerabilities.find(v => v.id === parseInt(req.params.id));
      if (vulnerability) {
        res.json({ 
          success: true, 
          message: 'Vulnerability exported successfully',
          downloadUrl: `/api/exports/vulnerability-${vulnerability.id}.json`
        });
      } else {
        res.status(404).json({ error: 'Vulnerability not found' });
      }
    });

    this.app.get('/api/stats', (req, res) => {
      res.json(this.calculateStats(this.vulnerabilities));
    });

    this.app.get('/api/scans', (req, res) => {
      res.json({
        scans: this.scanResults,
        total: this.scanResults.length
      });
    });

    this.app.post('/api/scan/start', (req, res) => {
      const { target, options = {} } = req.body;
      
      const scanId = Date.now();
      const newScan = {
        id: scanId,
        target: target || 'test.example.com',
        status: 'running',
        progress: 0,
        createdAt: new Date().toISOString(),
        options,
        results: null
      };

      this.scanResults.unshift(newScan);

      // Simulate scan progress
      this.simulateScanProgress(newScan);

      res.json({
        success: true,
        scanId,
        message: 'Scan started successfully'
      });
    });

    this.app.get('/api/scan/:id/status', (req, res) => {
      const scan = this.scanResults.find(s => s.id === parseInt(req.params.id));
      if (scan) {
        res.json(scan);
      } else {
        res.status(404).json({ error: 'Scan not found' });
      }
    });

    this.app.get('/api/scan/:id/results', (req, res) => {
      const scan = this.scanResults.find(s => s.id === parseInt(req.params.id));
      if (scan && scan.results) {
        res.json(scan.results);
      } else {
        res.status(404).json({ error: 'Scan results not found' });
      }
    });

    // Blueprint endpoints
    this.app.get('/api/blueprint', (req, res) => {
      res.json({
        blueprints: [
          {
            id: 1,
            name: 'Web Application Security Scan',
            description: 'Comprehensive security assessment for web applications',
            steps: [
              { id: 1, name: 'Port Scanning', status: 'completed', duration: 5000 },
              { id: 2, name: 'Vulnerability Discovery', status: 'completed', duration: 15000 },
              { id: 3, name: 'Exploitation Testing', status: 'completed', duration: 20000 },
              { id: 4, name: 'Report Generation', status: 'running', duration: 10000 }
            ]
          }
        ]
      });
    });

    // Tools endpoints
    this.app.get('/api/tools', (req, res) => {
      res.json({
        tools: [
          { id: 1, name: 'Nmap', status: 'active', type: 'scanner' },
          { id: 2, name: 'SQLMap', status: 'active', type: 'exploiter' },
          { id: 3, name: 'Burp Suite', status: 'active', type: 'proxy' },
          { id: 4, name: 'OWASP ZAP', status: 'active', type: 'scanner' }
        ]
      });
    });

    // Chains endpoints
    this.app.get('/api/chains', (req, res) => {
      res.json({
        chains: [
          {
            id: 1,
            name: 'SQL Injection Chain',
            description: 'Automated SQL injection exploitation chain',
            status: 'active',
            progress: 75,
            steps: [
              { name: 'Target Discovery', status: 'completed' },
              { name: 'Parameter Enumeration', status: 'completed' },
              { name: 'SQL Injection Testing', status: 'completed' },
              { name: 'Data Extraction', status: 'running' },
              { name: 'Privilege Escalation', status: 'pending' }
            ]
          }
        ]
      });
    });

    // History endpoints
    this.app.get('/api/history', (req, res) => {
      res.json({
        history: this.scanResults.map(scan => ({
          id: scan.id,
          target: scan.target,
          status: scan.status,
          createdAt: scan.createdAt,
          duration: scan.duration || 0,
          vulnerabilitiesFound: scan.vulnerabilitiesFound || 0
        }))
      });
    });

    // Repeater endpoints
    this.app.get('/api/repeater/requests', (req, res) => {
      res.json({
        requests: [
          {
            id: 1,
            name: 'Login Request',
            method: 'POST',
            url: 'https://example.com/api/login',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password' }),
            createdAt: new Date().toISOString()
          }
        ]
      });
    });

    this.app.post('/api/repeater/requests', (req, res) => {
      const { name, method, url, headers, body } = req.body;
      const newRequest = {
        id: Date.now(),
        name: name || 'Untitled Request',
        method: method || 'GET',
        url: url || 'https://example.com/api/endpoint',
        headers: headers || {},
        body: body || '',
        createdAt: new Date().toISOString()
      };

      res.json({
        success: true,
        request: newRequest
      });
    });

    // Statistics endpoints
    this.app.get('/api/statistics', (req, res) => {
      res.json({
        overview: {
          totalScans: this.scanResults.length,
          totalVulnerabilities: this.vulnerabilities.length,
          criticalVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'critical').length,
          highVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'high').length,
          mediumVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'medium').length,
          lowVulnerabilities: this.vulnerabilities.filter(v => v.severity === 'low').length
        },
        trends: this.generateTrendData(),
        performance: {
          averageScanTime: 45000,
          successRate: 95.5,
          uptime: 99.9
        }
      });
    });

    // Error simulation endpoints
    this.app.get('/api/simulate-error', (req, res) => {
      const errorType = req.query.type || 'network';
      
      switch (errorType) {
        case '500':
          res.status(500).json({ error: 'Internal Server Error' });
          break;
        case '404':
          res.status(404).json({ error: 'Not Found' });
          break;
        case 'timeout':
          setTimeout(() => res.json({ message: 'Delayed response' }), 5000);
          break;
        default:
          res.status(503).json({ error: 'Service Unavailable' });
      }
    });
  }

  setupWebSocket() {
    this.server = http.createServer(this.app);
    this.wss = new WebSocketServer({ server: this.server });

    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);
      this.isConnected = true;

      // Send initial connection status
      this.broadcast({
        type: 'connection_status',
        data: { status: 'connected', timestamp: new Date().toISOString() }
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
        this.isConnected = this.clients.size > 0;
        
        this.broadcast({
          type: 'connection_status',
          data: { status: this.isConnected ? 'connected' : 'disconnected', timestamp: new Date().toISOString() }
        });
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });

    // Periodic status updates
    setInterval(() => {
      this.broadcast({
        type: 'heartbeat',
        data: { timestamp: new Date().toISOString() }
      });
    }, 30000);
  }

  handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        break;
      
      case 'subscribe_scan':
        this.broadcastToClient(ws, {
          type: 'scan_update',
          data: { scanId: data.scanId, status: 'subscribed' }
        });
        break;
      
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  broadcast(message) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(messageStr);
      }
    });
  }

  broadcastToClient(client, message) {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  }

  simulateScanProgress(scan) {
    const progressInterval = setInterval(() => {
      if (scan.progress < 100) {
        scan.progress += Math.random() * 20;
        scan.progress = Math.min(scan.progress, 100);
        
        // Broadcast progress update
        this.broadcast({
          type: 'scan_progress',
          data: {
            scanId: scan.id,
            progress: scan.progress,
            status: scan.progress === 100 ? 'completed' : 'running'
          }
        });

        // Simulate vulnerability detection
        if (Math.random() < 0.3 && scan.progress > 30) {
          const newVulnerability = this.generateRandomVulnerability();
          this.vulnerabilities.unshift(newVulnerability);
          
          this.broadcast({
            type: 'vulnerability_detected',
            data: newVulnerability
          });
        }

        // Complete scan
        if (scan.progress >= 100) {
          scan.status = 'completed';
          scan.duration = Date.now() - new Date(scan.createdAt).getTime();
          scan.vulnerabilitiesFound = Math.floor(Math.random() * 20) + 5;
          scan.results = {
            vulnerabilities: this.generateRandomVulnerabilities(scan.vulnerabilitiesFound),
            summary: {
              critical: Math.floor(Math.random() * 3) + 1,
              high: Math.floor(Math.random() * 5) + 2,
              medium: Math.floor(Math.random() * 8) + 3,
              low: Math.floor(Math.random() * 10) + 5
            }
          };

          this.broadcast({
            type: 'scan_completed',
            data: { scanId: scan.id, results: scan.results }
          });

          clearInterval(progressInterval);
        }
      }
    }, 2000 + Math.random() * 3000); // 2-5 second intervals
  }

  generateMockVulnerabilities(count) {
    const severities = ['critical', 'high', 'medium', 'low'];
    const cves = [
      'CVE-2024-0001', 'CVE-2024-0002', 'CVE-2024-0003', 'CVE-2024-0004', 'CVE-2024-0005',
      'CVE-2024-0006', 'CVE-2024-0007', 'CVE-2024-0008', 'CVE-2024-0009', 'CVE-2024-0010'
    ];

    const vulnerabilities = [];
    for (let i = 0; i < count; i++) {
      const severity = severities[i % severities.length];
      vulnerabilities.push(this.generateSingleVulnerability(i + 1, severity, cves[i % cves.length]));
    }
    return vulnerabilities;
  }

  generateSingleVulnerability(id, severity, cve) {
    const titles = {
      critical: [
        'Remote Code Execution in Authentication Module',
        'SQL Injection Leading to Database Compromise',
        'Privilege Escalation via Path Traversal',
        'Remote Code Execution via File Upload',
        'Server-Side Request Forgery (SSRF)'
      ],
      high: [
        'Cross-Site Scripting (XSS) in User Profile',
        'Insecure Direct Object Reference',
        'Missing Rate Limiting on Login Endpoint',
        'Information Disclosure in Error Messages',
        'Insecure Password Reset Mechanism'
      ],
      medium: [
        'Clickjacking Vulnerability',
        'Missing Security Headers',
        'Information Leakage in HTTP Headers',
        'Weak Password Policy',
        'Missing HTTPS Redirect'
      ],
      low: [
        'Information Disclosure in robots.txt',
        'Missing Cache-Control Headers',
        'Verbose Error Messages',
        'Missing Security.txt File',
        'Outdated Software Version'
      ]
    };

    const title = titles[severity][Math.floor(Math.random() * titles[severity].length)];
    return {
      id,
      title,
      severity,
      description: `${title} detected in the application. This vulnerability could allow attackers to compromise the system or access sensitive information.`,
      cve_id: cve,
      cvss_score: severity === 'critical' ? (8.0 + Math.random() * 2.0) : 
                  severity === 'high' ? (6.0 + Math.random() * 1.9) :
                  severity === 'medium' ? (4.0 + Math.random() * 1.9) :
                  (1.0 + Math.random() * 2.9),
      timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'open',
      affected_assets: [
        'https://example.com',
        'https://api.example.com',
        'https://admin.example.com'
      ],
      solution: `Apply security patches and implement proper input validation. ${severity === 'critical' ? 'Immediate action required.' : 'Schedule remediation within 30 days.'}`,
      references: [
        `https://nvd.nist.gov/vuln/detail/${cve}`,
        'https://owasp.org/www-community/vulnerabilities/'
      ]
    };
  }

  generateRandomVulnerability() {
    const severities = ['critical', 'high', 'medium', 'low'];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    return this.generateSingleVulnerability(this.vulnerabilities.length + 1, severity, `CVE-2024-${String(this.vulnerabilities.length + 1).padStart(4, '0')}`);
  }

  generateMockScanResults() {
    return Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() - (i * 3600000), // Hours ago
      target: `example${i + 1}.com`,
      status: i === 0 ? 'running' : (Math.random() > 0.2 ? 'completed' : 'failed'),
      progress: i === 0 ? 45 : 100,
      createdAt: new Date(Date.now() - (i * 3600000)).toISOString(),
      duration: i === 0 ? null : Math.floor(Math.random() * 120000) + 30000, // 30s - 2min
      vulnerabilitiesFound: i === 0 ? null : Math.floor(Math.random() * 25) + 5
    }));
  }

  calculateStats(vulnerabilities) {
    return {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length
    };
  }

  generateTrendData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      critical: Math.floor(Math.random() * 10) + 2,
      high: Math.floor(Math.random() * 15) + 5,
      medium: Math.floor(Math.random() * 20) + 8,
      low: Math.floor(Math.random() * 25) + 10
    }));
  }

  async start(port = 8080) {
    return new Promise((resolve) => {
      this.server.listen(port, () => {
        console.log(`Test backend service running on port ${port}`);
        console.log(`WebSocket server ready`);
        console.log(`Health check: http://localhost:${port}/health`);
        resolve();
      });
    });
  }

  async stop() {
    return new Promise((resolve) => {
      if (this.wss) {
        this.wss.close();
      }
      if (this.server) {
        this.server.close(() => {
          console.log('Test backend service stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  getWebSocketUrl(port = 8080) {
    return `ws://localhost:${port}`;
  }

  getApiUrl(port = 8080) {
    return `http://localhost:${port}`;
  }
}

module.exports = TestBackendService;

// If running directly
if (require.main === module) {
  const backend = new TestBackendService();
  backend.start().catch(console.error);
  
  process.on('SIGINT', async () => {
    console.log('\nShutting down test backend...');
    await backend.stop();
    process.exit(0);
  });
}
