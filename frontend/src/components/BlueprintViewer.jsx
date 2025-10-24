import React, { useEffect, useState } from 'react';

const BlueprintViewer = ({ scanId }) => {
  const [blueprint, setBlueprint] = useState({});
  const [osint, setOsint] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || `${window.location.protocol}//${window.location.hostname}:5000`;

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${backendUrl}/api/scan/${scanId}/blueprint`);
        const data = await res.json();
        setBlueprint(data.blueprint || {});
        setOsint(data.osint || {});
      } catch (e) { /* ignore */ } finally { setLoading(false); }
    })();
  }, [scanId, backendUrl]);

  const renderTree = (tree, depth = 0) => {
    if (!tree || typeof tree !== 'object') return null;
    return Object.entries(tree).map(([key, value]) => (
      <div key={key} className="ml-4">
        <div className="flex items-center text-sm text-gray-300">
          <span className="mr-2">{depth === 0 ? '📁' : '📄'}</span>
          <span className="font-mono">{key}</span>
        </div>
        {typeof value === 'object' && Object.keys(value).length > 0 && (
          <div className="ml-4">{renderTree(value, depth + 1)}</div>
        )}
      </div>
    ));
  };

  if (!scanId) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <span className="mr-2">🗺️</span>
          Application Blueprint
        </h2>
        <div className="text-center py-8 text-gray-500">
          Start a scan to see the application blueprint
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <span className="mr-2">🗺️</span>
        Application Blueprint
      </h2>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading blueprint...</div>
      ) : (
        <>
          <div className="flex space-x-2 mb-4">
            {['overview', 'tree', 'osint', 'apis', 'ajax'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded text-sm ${
                  activeTab === tab ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {tab === 'ajax' ? '🤖 AJAX' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded p-4">
                <h3 className="text-white font-semibold mb-2">📊 Discovery Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subdomains:</span>
                    <span className="text-white">{osint.subdomains?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Live Hosts:</span>
                    <span className="text-white">{osint.live_hosts?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Technologies:</span>
                    <span className="text-white">{osint.technologies?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">API Definitions:</span>
                    <span className="text-white">{osint.api_definitions?.length || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded p-4">
                <h3 className="text-white font-semibold mb-2">🔍 Robots.txt & Sitemap</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Disallowed paths:</span>
                    <div className="text-white font-mono text-xs mt-1">
                      {blueprint.robots?.length ? blueprint.robots.slice(0, 3).join(', ') : 'None found'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Sitemap URLs:</span>
                    <div className="text-white font-mono text-xs mt-1">
                      {blueprint.sitemap?.length ? blueprint.sitemap.slice(0, 3).join(', ') : 'None found'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tree' && (
            <div className="bg-gray-900 rounded p-4 max-h-96 overflow-auto">
              <h3 className="text-white font-semibold mb-3">🌳 Site Structure</h3>
              <div className="mb-3 flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400">Static HTML</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-400">AJAX/JavaScript</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-400">API Endpoints</span>
                </div>
              </div>
              <div className="font-mono text-sm">
                {blueprint.tree ? renderTree(blueprint.tree) : <div className="text-gray-500">No tree data available</div>}
              </div>
            </div>
          )}

          {activeTab === 'osint' && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded p-4">
                <h3 className="text-white font-semibold mb-2">🌐 Subdomains</h3>
                <div className="max-h-32 overflow-auto">
                  {osint.subdomains?.length ? (
                    <div className="space-y-1">
                      {osint.subdomains.map((sub, i) => (
                        <div key={i} className="text-sm text-gray-300 font-mono">{sub}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No subdomains discovered</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded p-4">
                <h3 className="text-white font-semibold mb-2">🖥️ Live Hosts</h3>
                <div className="max-h-32 overflow-auto">
                  {osint.live_hosts?.length ? (
                    <div className="space-y-1">
                      {osint.live_hosts.map((host, i) => (
                        <div key={i} className="text-sm">
                          <div className="text-white font-mono">{host.url}</div>
                          <div className="text-gray-400 text-xs">{host.server} - {host.status_code}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No live hosts found</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded p-4">
                <h3 className="text-white font-semibold mb-2">⚙️ Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {osint.technologies?.length ? (
                    osint.technologies.map((tech, i) => (
                      <span key={i} className="bg-purple-700 text-white px-2 py-1 rounded text-xs">{tech}</span>
                    ))
                  ) : (
                    <div className="text-gray-500 text-sm">No technologies detected</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apis' && (
            <div className="bg-gray-900 rounded p-4">
              <h3 className="text-white font-semibold mb-2">🔌 API Definitions</h3>
              <div className="space-y-2">
                {osint.api_definitions?.length ? (
                  osint.api_definitions.map((api, i) => (
                    <div key={i} className="text-sm text-gray-300 font-mono bg-gray-800 p-2 rounded">
                      {api}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No API definitions found</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ajax' && (
            <div className="space-y-4">
              <div className="bg-gray-900 rounded p-4">
                <h3 className="text-white font-semibold mb-2">🤖 AJAX Spider Results</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400 text-sm">Dynamic Endpoints</div>
                    <div className="text-white font-bold text-lg">{osint.ajax_endpoints?.length || 0}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400 text-sm">Forms Interacted</div>
                    <div className="text-white font-bold text-lg">{osint.forms_interacted || 0}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400 text-sm">AJAX Calls</div>
                    <div className="text-white font-bold text-lg">{osint.ajax_calls?.length || 0}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="text-gray-400 text-sm">Buttons Clicked</div>
                    <div className="text-white font-bold text-lg">{osint.buttons_clicked || 0}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded p-4">
                <h3 className="text-white font-semibold mb-2">🔍 Discovered AJAX Endpoints</h3>
                <div className="max-h-40 overflow-auto">
                  {osint.ajax_endpoints?.length ? (
                    <div className="space-y-1">
                      {osint.ajax_endpoints.slice(0, 10).map((endpoint, i) => (
                        <div key={i} className="text-sm text-gray-300 font-mono bg-gray-800 p-2 rounded">
                          {endpoint}
                        </div>
                      ))}
                      {osint.ajax_endpoints.length > 10 && (
                        <div className="text-gray-500 text-xs text-center py-2">
                          ... and {osint.ajax_endpoints.length - 10} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No AJAX endpoints discovered</div>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 rounded p-4">
                <h3 className="text-white font-semibold mb-2">📡 AJAX Calls Monitored</h3>
                <div className="max-h-40 overflow-auto">
                  {osint.ajax_calls?.length ? (
                    <div className="space-y-1">
                      {osint.ajax_calls.slice(0, 10).map((call, i) => (
                        <div key={i} className="text-sm text-gray-300 font-mono bg-gray-800 p-2 rounded">
                          {call}
                        </div>
                      ))}
                      {osint.ajax_calls.length > 10 && (
                        <div className="text-gray-500 text-xs text-center py-2">
                          ... and {osint.ajax_calls.length - 10} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No AJAX calls monitored</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlueprintViewer;
