import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import DetailedVulnerabilityModal from './components/DetailedVulnerabilityModal';
import RealTimeLogs from './components/RealTimeLogs';
import ScanControlPanel from './components/ScanControlPanel';

// ============================================================================
// MAIN APP WITH PROPER NAVIGATION
// ============================================================================
const CyberSageApp = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  // Scan state
  const [scanStatus, setScanStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState('');
  const [currentScanId, setCurrentScanId] = useState(null);
  
  // Data
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [chains, setChains] = useState([]);
  const [toolActivity, setToolActivity] = useState([]);
  const [stats, setStats] = useState({ critical: 0, high: 0, medium: 0, low: 0 });
  const [aiInsights, setAiInsights] = useState([]);
  const [httpHistory, setHttpHistory] = useState([]);
  
  // Persistent logs state (survives tab changes)
  const [persistentLogs, setPersistentLogs] = useState([]);

  // WebSocket setup
  useEffect(() => {
    const backendUrl = 'http://localhost:5000';
    const newSocket = io(`${backendUrl}/scan`, {
      transports: ['polling', 'websocket'],
      reconnection: true
    });

    newSocket.on('connect', () => {
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    newSocket.on('scan_started', (data) => {
      setScanStatus('running');
      setProgress(0);
      setVulnerabilities([]);
      setChains([]);
      setToolActivity([]);
      setStats({ critical: 0, high: 0, medium: 0, low: 0 });
      setCurrentScanId(data.scan_id);
      setAiInsights([]);
      setHttpHistory([]);
    });

    newSocket.on('scan_progress', (data) => {
      setProgress(data.progress);
      setCurrentPhase(data.phase);
    });

    newSocket.on('tool_started', (data) => {
      setToolActivity(prev => [{
        tool: data.tool,
        target: data.target,
        status: 'running',
        timestamp: data.timestamp
      }, ...prev].slice(0, 10));
    });

    newSocket.on('tool_completed', (data) => {
      setToolActivity(prev => 
        prev.map(item => 
          item.tool === data.tool 
            ? { ...item, status: 'completed', findings: data.findings_count }
            : item
        )
      );
    });

    newSocket.on('vulnerability_found', (data) => {
      const newVuln = { ...data, id: Date.now() + Math.random() };
      setVulnerabilities(prev => [newVuln, ...prev]);
      setStats(prev => ({
        ...prev,
        [data.severity]: prev[data.severity] + 1
      }));
    });

    newSocket.on('chain_detected', (data) => {
      setChains(prev => [{ ...data, id: Date.now() }, ...prev]);
    });

    newSocket.on('ai_insight', (data) => {
      setAiInsights(prev => [data, ...prev]);
    });

    newSocket.on('scan_completed', (data) => {
      setScanStatus('completed');
      setProgress(100);
    });

    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);

  const startScan = (target, mode, options = {}) => {
    if (socket && connected) {
      socket.emit('start_scan', { target, mode, ...options });
    }
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'scanner', label: 'Scanner', icon: '🎯' },
    { id: 'vulnerabilities', label: 'Vulnerabilities', icon: '⚠️' },
    { id: 'chains', label: 'Attack Chains', icon: '⛓️' },
    { id: 'repeater', label: 'Repeater', icon: '🛰️' },
    { id: 'history', label: 'History', icon: '📜' },
    { id: 'blueprint', label: 'Blueprint', icon: '🗺️' },
    { id: 'statistics', label: 'Statistics', icon: '📈' },
    { id: 'tools', label: 'Tools', icon: '🔧' }
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'scanner':
        return <ScannerPage startScan={startScan} connected={connected} scanStatus={scanStatus} />;
      case 'vulnerabilities':
        return <VulnerabilitiesPage vulnerabilities={vulnerabilities} currentScanId={currentScanId} />;
      case 'chains':
        return <ChainsPage chains={chains} />;
      case 'repeater':
        return <RepeaterPage httpHistory={httpHistory} setHttpHistory={setHttpHistory} />;
      case 'history':
        return <HistoryPage />;
      case 'blueprint':
        return <BlueprintPage scanId={currentScanId} />;
      case 'statistics':
        return <StatisticsPage scanId={currentScanId} vulnerabilities={vulnerabilities} />;
      case 'tools':
        return <ToolsPage toolActivity={toolActivity} />;
      default:
        return <DashboardPage 
          stats={stats}
          vulnerabilities={vulnerabilities}
          scanStatus={scanStatus}
          progress={progress}
          currentPhase={currentPhase}
          chains={chains}
          currentScanId={currentScanId}
          aiInsights={aiInsights}
          toolActivity={toolActivity}
          socket={socket}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Top Navigation */}
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                CyberSage v2.0 Professional
              </h1>
              <div className="hidden md:flex space-x-1">
                {navigation.map(page => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(page.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      currentPage === page.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span className="mr-2">{page.icon}</span>
                    {page.label}
                  </button>
                ))}
              </div>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm ${
              connected ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-medium">{connected ? 'Connected' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-900 border-b border-gray-800 overflow-x-auto">
        <div className="flex space-x-1 px-4 py-2">
          {navigation.map(page => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(page.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
                currentPage === page.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              {page.icon} {page.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!connected && (
          <div className="mb-6 bg-red-900/30 border border-red-500 rounded-lg p-4">
            <p className="text-red-400 font-medium">⚠️ Backend not connected. Make sure backend is running on http://localhost:5000</p>
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  );
};

// ============================================================================
// DASHBOARD PAGE
// ============================================================================
const DashboardPage = ({ stats, vulnerabilities, scanStatus, progress, currentPhase, chains, currentScanId, aiInsights, toolActivity, socket }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold">Security Dashboard</h2>
    
    {/* Scan Control Panel */}
    {scanStatus === 'running' && (
      <ScanControlPanel
        socket={socket}
        scanId={currentScanId}
        scanStatus={scanStatus}
        progress={progress}
        currentPhase={currentPhase}
      />
    )}

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { key: 'critical', label: 'Critical', icon: '🔴', color: 'red' },
        { key: 'high', label: 'High', icon: '🟠', color: 'orange' },
        { key: 'medium', label: 'Medium', icon: '🟡', color: 'yellow' },
        { key: 'low', label: 'Low', icon: '🟢', color: 'blue' }
      ].map(stat => (
        <div key={stat.key} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-purple-500 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">{stat.label}</span>
            <span className="text-2xl">{stat.icon}</span>
          </div>
          <p className="text-3xl font-bold">{stats[stat.key]}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-xl font-bold mb-4">Recent Vulnerabilities</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {vulnerabilities.slice(0, 5).map(vuln => (
            <div key={vuln.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{vuln.type}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  vuln.severity === 'critical' ? 'bg-red-500' :
                  vuln.severity === 'high' ? 'bg-orange-500' :
                  vuln.severity === 'medium' ? 'bg-yellow-500 text-black' : 'bg-blue-500'
                }`}>
                  {vuln.severity?.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-2">{vuln.title}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="text-xl font-bold mb-4">Tool Activity</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {toolActivity.slice(0, 5).map((item, idx) => (
            <div key={idx} className="flex items-center p-3 bg-gray-800 rounded-lg">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                item.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
              }`} />
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{item.tool}</p>
                <p className="text-gray-500 text-xs truncate">{item.target}</p>
              </div>
              {item.findings !== undefined && (
                <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                  {item.findings} found
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>

    {chains.length > 0 && (
      <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 rounded-xl border-2 border-red-500 p-6">
        <h3 className="text-xl font-bold mb-4">⚠️ Attack Chains Detected</h3>
        <div className="space-y-3">
          {chains.map(chain => (
            <div key={chain.id} className="bg-black/30 rounded-lg p-4">
              <h4 className="font-bold">{chain.name}</h4>
              <p className="text-sm text-gray-300 mt-1">{chain.impact}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {aiInsights.length > 0 && (
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-xl border-2 border-purple-500 p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          AI Insights
        </h3>
        <div className="space-y-3">
          {aiInsights.slice(0, 3).map((insight, idx) => (
            <div key={idx} className="bg-black/30 rounded-lg p-3">
              <p className="text-sm text-gray-300">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Real-Time Logs - Persistent across tab changes */}
    {socket && (
      <RealTimeLogs 
        socket={socket} 
        scanId={currentScanId} 
        logs={persistentLogs}
        setLogs={setPersistentLogs}
      />
    )}
  </div>
);

// ============================================================================
// SCANNER PAGE
// ============================================================================
const ScannerPage = ({ startScan, connected, scanStatus }) => {
  const [target, setTarget] = useState('');
  const [scanMode, setScanMode] = useState('elite');
  const [intensity, setIntensity] = useState('normal');

  const handleStartScan = () => {
    if (!target.trim()) {
      alert('Please enter a target URL or domain');
      return;
    }
    startScan(target, scanMode, { intensity });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold">Security Scanner</h2>
      
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">Target URL or IP</label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="https://example.com"
          disabled={scanStatus === 'running'}
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <label className="block text-sm font-medium text-gray-300 mb-4">Scan Mode</label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'quick', name: 'Quick', icon: '⚡' },
            { id: 'standard', name: 'Standard', icon: '🔍' },
            { id: 'elite', name: 'Elite', icon: '🧠' }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setScanMode(mode.id)}
              disabled={scanStatus === 'running'}
              className={`p-4 rounded-lg border-2 transition ${
                scanMode === mode.id 
                  ? 'border-purple-500 bg-purple-900/20' 
                  : 'border-gray-700 hover:border-gray-600'
              } disabled:opacity-50`}
            >
              <div className="text-3xl mb-2">{mode.icon}</div>
              <div className="font-semibold">{mode.name}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStartScan}
        disabled={!target || !connected || scanStatus === 'running'}
        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {scanStatus === 'running' ? 'Scanning...' : '🚀 Start Security Scan'}
      </button>
    </div>
  );
};

// ============================================================================
// VULNERABILITIES PAGE
// ============================================================================
const VulnerabilitiesPage = ({ vulnerabilities, currentScanId }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredVulns = vulnerabilities.filter(v => {
    const matchesFilter = filter === 'all' || v.severity === filter;
    const matchesSearch = v.type?.toLowerCase().includes(search.toLowerCase()) || 
                         v.title?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const exportPDF = async () => {
    if (!currentScanId) {
      alert('No active scan to export');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/scan/${currentScanId}/export/pdf`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cybersage-scan-${currentScanId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF');
    }
  };

  const handleVulnClick = (vuln) => {
    setSelectedVuln(vuln);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Vulnerabilities ({vulnerabilities.length})</h2>
        {currentScanId && (
          <button
            onClick={exportPDF}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
          >
            📄 Export PDF Report
          </button>
        )}
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search vulnerabilities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredVulns.map(vuln => (
          <div 
            key={vuln.id} 
            onClick={() => handleVulnClick(vuln)}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-purple-500 transition cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold">{vuln.type}</h3>
                <p className="text-gray-400 text-sm mt-1">{vuln.title}</p>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <span className="text-gray-500">Confidence: {vuln.confidence}%</span>
                  {vuln.cwe_id && <span className="text-purple-400">{vuln.cwe_id}</span>}
                  {vuln.cvss_score && <span className="text-orange-400">CVSS: {vuln.cvss_score}</span>}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                vuln.severity === 'critical' ? 'bg-red-500' :
                vuln.severity === 'high' ? 'bg-orange-500' :
                vuln.severity === 'medium' ? 'bg-yellow-500 text-black' : 'bg-blue-500'
              }`}>
                {vuln.severity?.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Vulnerability Modal */}
      {showDetailModal && selectedVuln && (
        <DetailedVulnerabilityModal 
          vuln={selectedVuln}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedVuln(null);
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// CHAINS PAGE
// ============================================================================
const ChainsPage = ({ chains }) => (
  <div className="space-y-6">
    <h2 className="text-3xl font-bold">Attack Chains ({chains.length})</h2>
    {chains.length === 0 ? (
      <div className="text-center py-12 text-gray-500">
        No attack chains detected yet
      </div>
    ) : (
      chains.map(chain => (
        <div key={chain.id} className="bg-gradient-to-br from-red-900/50 to-pink-900/50 rounded-xl border-2 border-red-500 p-6">
          <h3 className="text-xl font-bold mb-2">{chain.name}</h3>
          <p className="text-gray-300 mb-4">{chain.impact}</p>
          <div className="space-y-2">
            {chain.steps?.map((step, i) => (
              <div key={i} className="flex items-start">
                <span className="text-red-400 mr-2">→</span>
                <span className="text-sm">{step[1]}</span>
              </div>
            ))}
          </div>
        </div>
      ))
    )}
  </div>
);

// ============================================================================
// REPEATER PAGE (Like Hetty)
// ============================================================================
const RepeaterPage = ({ httpHistory, setHttpHistory }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState('{\n  "User-Agent": "CyberSage/2.0"\n}');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('request');
  const [history, setHistory] = useState([]);

  const sendRequest = async () => {
    setLoading(true);
    try {
      const parsedHeaders = JSON.parse(headers);
      const res = await fetch('http://localhost:5000/api/repeater/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method, url, headers: parsedHeaders, body })
      });
      const data = await res.json();
      setResponse(data.response);
      setHistory(prev => [{ method, url, response: data.response, timestamp: Date.now() }, ...prev].slice(0, 20));
    } catch (e) {
      alert('Request failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">HTTP Repeater</h2>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="font-bold mb-4">History</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setMethod(item.method);
                    setUrl(item.url);
                  }}
                  className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded text-sm"
                >
                  <div className="font-mono text-xs text-purple-400">{item.method}</div>
                  <div className="text-xs text-gray-400 truncate">{item.url}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Repeater */}
        <div className="lg:col-span-3 space-y-4">
          {/* Request Builder */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex gap-2 mb-4">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              >
                {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map(m => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/api/endpoint"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded text-white"
              />
              <button
                onClick={sendRequest}
                disabled={loading || !url}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>

            <div className="flex border-b border-gray-700 mb-4">
              <button
                onClick={() => setActiveTab('request')}
                className={`px-4 py-2 ${activeTab === 'request' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400'}`}
              >
                Request
              </button>
              <button
                onClick={() => setActiveTab('response')}
                className={`px-4 py-2 ${activeTab === 'response' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400'}`}
              >
                Response
              </button>
            </div>

            {activeTab === 'request' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Headers (JSON)</label>
                  <textarea
                    value={headers}
                    onChange={(e) => setHeaders(e.target.value)}
                    className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white font-mono text-sm"
                  />
                </div>
              </div>
            ) : response ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-2 py-1 rounded ${
                    response.code < 300 ? 'bg-green-600' :
                    response.code < 400 ? 'bg-blue-600' :
                    response.code < 500 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    {response.code}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Time</span>
                  <span className="text-white">{response.time_ms} ms</span>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Headers</label>
                  <pre className="p-3 bg-gray-800 rounded text-xs text-gray-300 overflow-x-auto">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Body</label>
                  <pre className="p-3 bg-gray-800 rounded text-xs text-gray-300 overflow-x-auto max-h-96">
                    {response.body}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Send a request to see the response
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HISTORY PAGE
// ============================================================================
const HistoryPage = () => {
  const [scans, setScans] = useState([]);
  const [selectedScan, setSelectedScan] = useState(null);
  const [scanDetails, setScanDetails] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/scans')
      .then(res => res.json())
      .then(data => setScans(data.scans || []))
      .catch(err => console.error(err));
  }, []);

  const loadScanDetails = async (scanId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/scan/${scanId}`);
      const data = await res.json();
      setScanDetails(data);
      setSelectedScan(scanId);
    } catch (err) {
      console.error(err);
    }
  };

  const exportScan = async (scanId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/scan/${scanId}/export`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scan-${scanId}.json`;
      a.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Scan History</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scans List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="font-bold mb-4">Recent Scans</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {scans.map(scan => (
                <button
                  key={scan.scan_id}
                  onClick={() => loadScanDetails(scan.scan_id)}
                  className={`w-full text-left p-3 rounded-lg transition ${
                    selectedScan === scan.scan_id ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm truncate">{scan.target}</div>
                  <div className="text-xs text-gray-400 mt-1">{scan.scan_mode} scan</div>
                  <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${
                    scan.status === 'completed' ? 'bg-green-600' :
                    scan.status === 'running' ? 'bg-blue-600' :
                    scan.status === 'failed' ? 'bg-red-600' : 'bg-yellow-600'
                  }`}>
                    {scan.status}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scan Details */}
        <div className="lg:col-span-2">
          {scanDetails ? (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{scanDetails.scan.target}</h3>
                    <p className="text-sm text-gray-400">{scanDetails.scan.scan_mode} scan</p>
                  </div>
                  <button
                    onClick={() => exportScan(selectedScan)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
                  >
                    Export
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400 text-xs">Critical</div>
                    <div className="text-2xl font-bold text-red-400">
                      {scanDetails.vulnerabilities.filter(v => v.severity === 'critical').length}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400 text-xs">High</div>
                    <div className="text-2xl font-bold text-orange-400">
                      {scanDetails.vulnerabilities.filter(v => v.severity === 'high').length}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400 text-xs">Medium</div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {scanDetails.vulnerabilities.filter(v => v.severity === 'medium').length}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400 text-xs">Low</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {scanDetails.vulnerabilities.filter(v => v.severity === 'low').length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h4 className="font-bold mb-4">Vulnerabilities</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {scanDetails.vulnerabilities.map((vuln, i) => (
                    <div key={i} className="bg-gray-800 p-4 rounded">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{vuln.vuln_type}</div>
                          <div className="text-sm text-gray-400 mt-1">{vuln.title}</div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          vuln.severity === 'critical' ? 'bg-red-500' :
                          vuln.severity === 'high' ? 'bg-orange-500' :
                          vuln.severity === 'medium' ? 'bg-yellow-500 text-black' : 'bg-blue-500'
                        }`}>
                          {vuln.severity?.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center text-gray-500">
              Select a scan to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// BLUEPRINT PAGE
// ============================================================================
const BlueprintPage = ({ scanId }) => {
  const [blueprint, setBlueprint] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    fetch(`http://localhost:5000/api/scan/${scanId}/blueprint`)
      .then(res => res.json())
      .then(data => setBlueprint(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [scanId]);

  if (!scanId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Application Blueprint</h2>
        <p className="text-gray-500">Start a scan to see the application blueprint</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Loading blueprint...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Application Blueprint</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-bold mb-4">🌐 Discovery Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Subdomains</span>
              <span className="font-bold">{blueprint?.osint?.subdomains?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Live Hosts</span>
              <span className="font-bold">{blueprint?.osint?.live_hosts?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Technologies</span>
              <span className="font-bold">{blueprint?.osint?.technologies?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">API Definitions</span>
              <span className="font-bold">{blueprint?.osint?.api_definitions?.length || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h3 className="font-bold mb-4">⚙️ Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {blueprint?.osint?.technologies?.map((tech, i) => (
              <span key={i} className="px-3 py-1 bg-purple-600 rounded-full text-sm">
                {tech}
              </span>
            )) || <span className="text-gray-500">No technologies detected</span>}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="font-bold mb-4">🗺️ Site Structure</h3>
        <pre className="text-xs text-gray-300 overflow-x-auto p-4 bg-gray-800 rounded">
          {JSON.stringify(blueprint?.blueprint?.tree, null, 2) || 'No structure data'}
        </pre>
      </div>
    </div>
  );
};

// ============================================================================
// STATISTICS PAGE
// ============================================================================
const StatisticsPage = ({ scanId, vulnerabilities }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!scanId) return;
    fetch(`http://localhost:5000/api/scan/${scanId}/statistics`)
      .then(res => res.json())
      .then(data => setStats(data.statistics))
      .catch(err => console.error(err));
  }, [scanId]);

  if (!scanId) {
    return (
      <div className="text-center py-12">
        <h2 className="text-3xl font-bold mb-4">Scan Statistics</h2>
        <p className="text-gray-500">Start a scan to see statistics</p>
      </div>
    );
  }

  const getSeverityCount = (severity) => vulnerabilities.filter(v => v.severity === severity).length;
  const total = vulnerabilities.length;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Scan Statistics</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Endpoints', value: stats?.endpoints_discovered || 0, icon: '🌐' },
          { label: 'Parameters', value: stats?.parameters_tested || 0, icon: '🔍' },
          { label: 'Payloads', value: stats?.payloads_sent || 0, icon: '⚡' },
          { label: 'Vulnerabilities', value: stats?.vulnerabilities_found || 0, icon: '🚨' }
        ].map(stat => (
          <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">{stat.label}</span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="font-bold mb-4">Severity Distribution</h3>
        <div className="space-y-4">
          {[
            { label: 'Critical', count: getSeverityCount('critical'), color: 'bg-red-500' },
            { label: 'High', count: getSeverityCount('high'), color: 'bg-orange-500' },
            { label: 'Medium', count: getSeverityCount('medium'), color: 'bg-yellow-500' },
            { label: 'Low', count: getSeverityCount('low'), color: 'bg-blue-500' }
          ].map(({ label, count, color }) => {
            const percentage = total > 0 ? (count / total * 100).toFixed(1) : 0;
            return (
              <div key={label}>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-white">{count} ({percentage}%)</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <div
                    className={`${color} h-3 rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="font-bold mb-4">Risk Score</h3>
        <div className="relative">
          {(() => {
            const riskScore = Math.min(100, (
              getSeverityCount('critical') * 10 +
              getSeverityCount('high') * 7 +
              getSeverityCount('medium') * 4 +
              getSeverityCount('low') * 1
            ));
            const getRiskLevel = (score) => {
              if (score >= 80) return { label: 'CRITICAL', color: 'bg-red-500', text: 'text-red-400' };
              if (score >= 60) return { label: 'HIGH', color: 'bg-orange-500', text: 'text-orange-400' };
              if (score >= 40) return { label: 'MEDIUM', color: 'bg-yellow-500', text: 'text-yellow-400' };
              return { label: 'LOW', color: 'bg-green-500', text: 'text-green-400' };
            };
            const risk = getRiskLevel(riskScore);

            return (
              <>
                <div className="bg-gray-800 rounded-full h-8">
                  <div
                    className={`${risk.color} h-8 rounded-full flex items-center justify-center transition-all duration-1000`}
                    style={{ width: `${riskScore}%` }}
                  >
                    <span className="text-white text-sm font-bold">{riskScore}/100</span>
                  </div>
                </div>
                <div className={`text-center mt-4 text-xl font-bold ${risk.text}`}>
                  {risk.label} RISK
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TOOLS PAGE
// ============================================================================
const ToolsPage = ({ toolActivity }) => {
  const tools = [
    { name: 'Nmap', desc: 'Network port scanner', icon: '🔍', status: 'ready' },
    { name: 'SQLMap', desc: 'SQL injection tool', icon: '💉', status: 'ready' },
    { name: 'Nikto', desc: 'Web server scanner', icon: '🕷️', status: 'ready' },
    { name: 'Nuclei', desc: 'Template-based scanner', icon: '⚡', status: 'ready' },
    { name: 'Ffuf', desc: 'Web fuzzer', icon: '🔨', status: 'ready' },
    { name: 'WPScan', desc: 'WordPress scanner', icon: '📝', status: 'ready' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Professional Tools</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <div key={tool.name} className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-purple-500 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-4xl">{tool.icon}</span>
              <span className="px-3 py-1 bg-green-600 rounded-full text-xs font-bold">
                {tool.status}
              </span>
            </div>
            <h3 className="font-bold text-lg">{tool.name}</h3>
            <p className="text-sm text-gray-400 mt-2">{tool.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h3 className="font-bold mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {toolActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No tool activity yet</div>
          ) : (
            toolActivity.map((item, i) => (
              <div key={i} className="flex items-center p-3 bg-gray-800 rounded">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  item.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-blue-500'
                }`} />
                <div className="flex-1">
                  <div className="font-medium text-sm">{item.tool}</div>
                  <div className="text-xs text-gray-400">{item.target}</div>
                </div>
                {item.findings !== undefined && (
                  <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                    {item.findings} found
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CyberSageApp;