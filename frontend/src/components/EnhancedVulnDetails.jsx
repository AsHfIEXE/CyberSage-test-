import React, { useState, useEffect } from 'react';

const ProfessionalVulnDetails = ({ vulnerabilityId, onClose }) => {
  const [vulnerability, setVulnerability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

  useEffect(() => {
    if (vulnerabilityId) {
      fetchVulnerabilityDetails();
    }
  }, [vulnerabilityId]);

  const fetchVulnerabilityDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/vulnerability/${vulnerabilityId}`);
      const data = await response.json();
      setVulnerability(data.vulnerability);
    } catch (error) {
      console.error('Error fetching vulnerability:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getCVSSColor = (score) => {
    if (score >= 9.0) return 'text-red-500';
    if (score >= 7.0) return 'text-orange-500';
    if (score >= 4.0) return 'text-yellow-500';
    return 'text-blue-500';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-8 max-w-md">
          <div className="flex items-center space-x-4">
            <svg className="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-white text-lg">Loading vulnerability details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!vulnerability) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-xl border border-red-500 p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">⚠️ Vulnerability Not Found</div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'technical', label: 'Technical Details', icon: '🔬' },
    { id: 'evidence', label: 'HTTP Evidence', icon: '📡' },
    { id: 'poc', label: 'Proof of Concept', icon: '🎯' },
    { id: 'remediation', label: 'Remediation', icon: '🛡️' },
    { id: 'references', label: 'References', icon: '📚' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-7xl w-full my-8 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700 bg-gray-800 rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <div className="text-3xl">🔍</div>
            <div>
              <h2 className="text-2xl font-bold text-white">{vulnerability.vuln_type || vulnerability.type}</h2>
              <p className="text-gray-400 text-sm">Vulnerability ID: #{vulnerability.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-4 py-2 ${getSeverityColor(vulnerability.severity)} text-white rounded-lg font-bold text-lg`}>
              {vulnerability.severity?.toUpperCase()}
            </span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl font-bold w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-700"
            >
              ×
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-800 sticky top-20 z-10 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-900/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">CVSS Score</div>
                  <div className={`text-3xl font-bold ${getCVSSColor(vulnerability.cvss_score || 0)}`}>
                    {vulnerability.cvss_score || 'N/A'}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {vulnerability.cvss_score >= 9.0 ? 'Critical' :
                     vulnerability.cvss_score >= 7.0 ? 'High' :
                     vulnerability.cvss_score >= 4.0 ? 'Medium' : 'Low'}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Confidence</div>
                  <div className="text-3xl font-bold text-white">
                    {vulnerability.confidence_score || vulnerability.confidence || 0}%
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${vulnerability.confidence_score || vulnerability.confidence || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">CWE ID</div>
                  <div className="text-2xl font-bold text-white">
                    {vulnerability.cwe_id || 'N/A'}
                  </div>
                  <a
                    href={`https://cwe.mitre.org/data/definitions/${vulnerability.cwe_id?.replace('CWE-', '')}.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-xs hover:underline mt-1 inline-block"
                  >
                    View on MITRE
                  </a>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-gray-400 text-xs mb-1">Detection Tool</div>
                  <div className="text-lg font-bold text-white">
                    {vulnerability.detection_tool || vulnerability.tool || 'N/A'}
                  </div>
                  <div className="text-gray-500 text-xs mt-1">Automated Scanner</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                  <span className="mr-2">📝</span>
                  Description
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {vulnerability.description || vulnerability.title || 'No description available.'}
                </p>
              </div>

              {/* Affected Target */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Affected Target
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">URL</div>
                    <div className="bg-gray-900 p-3 rounded font-mono text-sm text-purple-400 break-all">
                      {vulnerability.affected_url || vulnerability.url}
                    </div>
                  </div>
                  {vulnerability.affected_parameter && (
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Parameter</div>
                      <div className="bg-gray-900 p-3 rounded font-mono text-sm text-green-400">
                        {vulnerability.affected_parameter}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Impact */}
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
                <h3 className="text-red-400 font-bold text-lg mb-4 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Security Impact
                </h3>
                <div className="text-gray-300 space-y-2">
                  <p>This vulnerability could allow an attacker to:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    {vulnerability.type?.includes('XSS') && (
                      <>
                        <li>Execute arbitrary JavaScript in victims' browsers</li>
                        <li>Steal session cookies and hijack user accounts</li>
                        <li>Perform phishing attacks</li>
                        <li>Deface the website</li>
                      </>
                    )}
                    {vulnerability.type?.includes('SQL') && (
                      <>
                        <li>Extract sensitive data from the database</li>
                        <li>Modify or delete database records</li>
                        <li>Bypass authentication mechanisms</li>
                        <li>Execute operating system commands (in some cases)</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'technical' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4">Technical Analysis</h3>
                
                {/* Payload */}
                {vulnerability.payload && (
                  <div className="mb-6">
                    <div className="text-gray-400 text-sm mb-2 font-semibold">Exploit Payload</div>
                    <div className="bg-gray-900 p-4 rounded-lg border border-green-500/30">
                      <code className="text-green-400 text-sm font-mono break-all">
                        {vulnerability.payload}
                      </code>
                    </div>
                  </div>
                )}

                {/* Context (for XSS) */}
                {vulnerability.raw_data?.context && (
                  <div className="mb-6">
                    <div className="text-gray-400 text-sm mb-2 font-semibold">Injection Context</div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <span className="text-purple-400 font-mono">
                        {vulnerability.raw_data.context}
                      </span>
                    </div>
                  </div>
                )}

                {/* Technique (for SQLi) */}
                {vulnerability.raw_data?.technique && (
                  <div className="mb-6">
                    <div className="text-gray-400 text-sm mb-2 font-semibold">Attack Technique</div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <span className="text-blue-400 font-mono">
                        {vulnerability.raw_data.technique}
                      </span>
                    </div>
                  </div>
                )}

                {/* Detection Details */}
                {vulnerability.raw_data?.detection && (
                  <div className="mb-6">
                    <div className="text-gray-400 text-sm mb-2 font-semibold">Detection Method</div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <span className="text-yellow-400 text-sm">
                        {vulnerability.raw_data.detection}
                      </span>
                    </div>
                  </div>
                )}

                {/* Raw Data */}
                {vulnerability.raw_data && (
                  <div>
                    <div className="text-gray-400 text-sm mb-2 font-semibold">Complete Technical Data</div>
                    <pre className="bg-gray-900 p-4 rounded-lg text-xs text-gray-300 overflow-x-auto border border-gray-700">
                      {JSON.stringify(JSON.parse(vulnerability.raw_data), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                  <span className="mr-2">📡</span>
                  HTTP Request/Response Evidence
                </h3>
                
                {!vulnerability.http_history || vulnerability.http_history.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📭</div>
                    <div>No HTTP evidence available</div>
                  </div>
                ) : (
                  vulnerability.http_history.map((req, index) => (
                    <div key={index} className="mb-6 last:mb-0">
                      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                        {/* Request/Response Header */}
                        <div className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                          <div className="flex items-center space-x-4">
                            <span className={`px-3 py-1 rounded font-bold text-sm ${
                              req.method === 'POST' ? 'bg-green-600' : 'bg-blue-600'
                            } text-white`}>
                              {req.method}
                            </span>
                            <span className="text-gray-300 font-mono text-sm">{req.url}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded font-bold text-sm ${
                              req.response_code < 300 ? 'bg-green-900/50 text-green-400' :
                              req.response_code < 400 ? 'bg-blue-900/50 text-blue-400' :
                              req.response_code < 500 ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                              {req.response_code}
                            </span>
                            <span className="text-gray-400 text-sm">{req.response_time_ms}ms</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-gray-700">
                          {/* Request */}
                          <div className="p-4">
                            <h4 className="text-sm font-bold text-purple-400 mb-3">REQUEST</h4>
                            
                            <div className="mb-4">
                              <div className="text-xs text-gray-400 mb-2">Headers</div>
                              <pre className="bg-gray-950 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-40">
{req.request_headers || 'No headers'}
                              </pre>
                            </div>

                            {req.request_body && (
                              <div>
                                <div className="text-xs text-gray-400 mb-2">Body</div>
                                <pre className="bg-gray-950 p-3 rounded text-xs text-green-400 overflow-x-auto max-h-40">
{req.request_body}
                                </pre>
                              </div>
                            )}
                          </div>

                          {/* Response */}
                          <div className="p-4">
                            <h4 className="text-sm font-bold text-blue-400 mb-3">RESPONSE</h4>
                            
                            <div className="mb-4">
                              <div className="text-xs text-gray-400 mb-2">Headers</div>
                              <pre className="bg-gray-950 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-40">
{req.response_headers || 'No headers'}
                              </pre>
                            </div>

                            <div>
                              <div className="text-xs text-gray-400 mb-2">Body (Preview)</div>
                              <pre className="bg-gray-950 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-40">
{req.response_body ? req.response_body.substring(0, 1000) + (req.response_body.length > 1000 ? '...\n\n[Truncated]' : '') : 'No body'}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'poc' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Proof of Concept
                </h3>
                
                {vulnerability.proof_of_concept || vulnerability.poc ? (
                  <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap border border-green-500/30">
{vulnerability.proof_of_concept || vulnerability.poc}
                  </pre>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <div>No proof of concept available</div>
                  </div>
                )}
              </div>

              {/* Copy PoC Button */}
              {(vulnerability.proof_of_concept || vulnerability.poc) && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(vulnerability.proof_of_concept || vulnerability.poc);
                    alert('Proof of Concept copied to clipboard!');
                  }}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                  📋 Copy Proof of Concept
                </button>
              )}
            </div>
          )}

          {activeTab === 'remediation' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                  <span className="mr-2">🛡️</span>
                  Remediation Steps
                </h3>
                
                {vulnerability.remediation ? (
                  <div className="prose prose-invert max-w-none">
                    <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
{vulnerability.remediation}
                    </pre>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <p className="mb-4">General remediation guidelines:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Apply security patches and updates</li>
                      <li>Implement input validation and output encoding</li>
                      <li>Use security best practices for your framework</li>
                      <li>Conduct regular security testing</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Priority Badge */}
              <div className={`rounded-lg p-6 border-2 ${
                vulnerability.severity === 'critical' ? 'bg-red-900/20 border-red-500' :
                vulnerability.severity === 'high' ? 'bg-orange-900/20 border-orange-500' :
                'bg-yellow-900/20 border-yellow-500'
              }`}>
                <h4 className="text-white font-bold mb-2">
                  ⏰ Remediation Priority: {vulnerability.severity?.toUpperCase()}
                </h4>
                <p className="text-gray-300 text-sm">
                  {vulnerability.severity === 'critical' && 'Fix immediately. Critical vulnerabilities pose severe risk.'}
                  {vulnerability.severity === 'high' && 'Fix within 7 days. High-severity issues require prompt attention.'}
                  {vulnerability.severity === 'medium' && 'Fix within 30 days. Medium-severity issues should be addressed soon.'}
                  {vulnerability.severity === 'low' && 'Fix during regular maintenance. Low-severity issues have minimal impact.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'references' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center">
                  <span className="mr-2">📚</span>
                  External References
                </h3>
                
                <div className="space-y-4">
                  {vulnerability.cwe_id && (
                    <a
                      href={`https://cwe.mitre.org/data/definitions/${vulnerability.cwe_id.replace('CWE-', '')}.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-gray-900 p-4 rounded-lg hover:bg-gray-750 transition border border-gray-700"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-semibold">MITRE CWE</div>
                          <div className="text-gray-400 text-sm">{vulnerability.cwe_id}</div>
                        </div>
                        <div className="text-blue-400">→</div>
                      </div>
                    </a>
                  )}

                  <a
                    href={`https://owasp.org/www-project-top-ten/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-900 p-4 rounded-lg hover:bg-gray-750 transition border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">OWASP Top 10</div>
                        <div className="text-gray-400 text-sm">Web Application Security Risks</div>
                      </div>
                      <div className="text-blue-400">→</div>
                    </div>
                  </a>

                  <a
                    href={`https://portswigger.net/web-security`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gray-900 p-4 rounded-lg hover:bg-gray-750 transition border border-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold">PortSwigger Web Security Academy</div>
                        <div className="text-gray-400 text-sm">Learn about web vulnerabilities</div>
                      </div>
                      <div className="text-blue-400">→</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center p-6 border-t border-gray-700 bg-gray-800 rounded-b-xl sticky bottom-0">
          <div className="text-gray-400 text-sm">
            Discovered: {new Date(vulnerability.detected_at).toLocaleString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                const reportData = JSON.stringify(vulnerability, null, 2);
                const blob = new Blob([reportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `vulnerability-${vulnerability.id}.json`;
                a.click();
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
            >
              💾 Export JSON
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalVulnDetails;