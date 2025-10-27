"""
Differential Analysis Engine
Compares baseline vs fuzzed responses to detect anomalies
"""

import hashlib
import difflib
import re
from urllib.parse import urlparse

class DifferentialAnalyzer:
    """
    Performs differential analysis between baseline and test responses
    """
    
    def __init__(self):
        self.baseline_cache = {}
        self.anomaly_thresholds = {
            'length_change': 20,  # 20% change in content length
            'similarity': 80,      # Less than 80% similarity is anomalous
            'time_diff': 3,        # 3+ seconds difference
            'status_change': True  # Any status code change
        }
    
    def store_baseline(self, url, response):
        """Store baseline response for comparison"""
        baseline = {
            'status_code': response.status_code,
            'content_length': len(response.content),
            'content_hash': hashlib.md5(response.content).hexdigest(),
            'headers': dict(response.headers),
            'response_time': response.elapsed.total_seconds(),
            'body': response.text[:10000],  # Store first 10k chars
            'error_indicators': self._extract_error_indicators(response.text),
            'dom_structure': self._extract_dom_structure(response.text)
        }
        self.baseline_cache[url] = baseline
        return baseline
    
    def analyze_response(self, url, test_response, payload=None):
        """
        Analyze test response against baseline
        Returns anomalies detected
        """
        baseline = self.baseline_cache.get(url)
        if not baseline:
            return None
        
        anomalies = []
        confidence = 50  # Base confidence
        
        # 1. Status code analysis
        if test_response.status_code != baseline['status_code']:
            anomalies.append({
                'type': 'status_change',
                'baseline': baseline['status_code'],
                'current': test_response.status_code,
                'significance': 'high' if test_response.status_code >= 500 else 'medium'
            })
            confidence += 15
        
        # 2. Content length analysis
        current_length = len(test_response.content)
        baseline_length = baseline['content_length']
        
        if baseline_length > 0:
            length_change = abs(current_length - baseline_length) / baseline_length * 100
            
            if length_change > self.anomaly_thresholds['length_change']:
                anomalies.append({
                    'type': 'length_change',
                    'change_percent': length_change,
                    'baseline': baseline_length,
                    'current': current_length,
                    'significance': 'high' if length_change > 50 else 'medium'
                })
                confidence += 10
        
        # 3. Content hash comparison
        current_hash = hashlib.md5(test_response.content).hexdigest()
        if current_hash != baseline['content_hash']:
            # Calculate similarity
            similarity = self._calculate_similarity(
                test_response.text[:10000],
                baseline['body']
            )
            
            if similarity < self.anomaly_thresholds['similarity']:
                anomalies.append({
                    'type': 'content_change',
                    'similarity': similarity,
                    'hash_changed': True,
                    'significance': 'high' if similarity < 50 else 'medium'
                })
                confidence += 20
        
        # 4. Response time analysis
        current_time = test_response.elapsed.total_seconds()
        baseline_time = baseline['response_time']
        time_diff = abs(current_time - baseline_time)
        
        if time_diff > self.anomaly_thresholds['time_diff']:
            anomalies.append({
                'type': 'timing_anomaly',
                'baseline': baseline_time,
                'current': current_time,
                'difference': time_diff,
                'significance': 'critical' if time_diff > 5 else 'high'
            })
            confidence += 25
        
        # 5. Error indicator analysis
        current_errors = self._extract_error_indicators(test_response.text)
        new_errors = current_errors - baseline['error_indicators']
        
        if new_errors:
            anomalies.append({
                'type': 'new_errors',
                'indicators': list(new_errors),
                'significance': 'critical' if any(e in ['exception', 'fatal', 'panic'] for e in new_errors) else 'high'
            })
            confidence += 30
        
        # 6. DOM structure changes
        current_dom = self._extract_dom_structure(test_response.text)
        if self._significant_dom_change(baseline['dom_structure'], current_dom):
            anomalies.append({
                'type': 'dom_structure_change',
                'significance': 'medium'
            })
            confidence += 10
        
        # 7. Header analysis
        header_anomalies = self._analyze_headers(baseline['headers'], dict(test_response.headers))
        if header_anomalies:
            anomalies.extend(header_anomalies)
            confidence += 5 * len(header_anomalies)
        
        # 8. Reflection detection
        if payload and (payload in test_response.text or str(payload) in test_response.text):
            anomalies.append({
                'type': 'payload_reflection',
                'payload': str(payload)[:100],
                'significance': 'critical'
            })
            confidence += 30
        
        # Cap confidence at 95
        confidence = min(confidence, 95)
        
        if anomalies:
            return {
                'anomalies': anomalies,
                'confidence': confidence,
                'severity': self._calculate_severity(anomalies),
                'payload': payload
            }
        
        return None
    
    def _calculate_similarity(self, text1, text2):
        """Calculate similarity percentage between two texts"""
        if not text1 or not text2:
            return 0
        
        # Use sequence matcher for similarity
        matcher = difflib.SequenceMatcher(None, text1, text2)
        return matcher.ratio() * 100
    
    def _extract_error_indicators(self, text):
        """Extract error indicators from response"""
        indicators = set()
        
        error_patterns = [
            'error', 'exception', 'fatal', 'warning', 'failed',
            'stack trace', 'traceback', 'syntax error', 'undefined',
            'null pointer', 'division by zero', 'timeout', 'denied',
            'unauthorized', 'forbidden', 'not found', 'bad request',
            'internal server', 'service unavailable', 'panic'
        ]
        
        text_lower = text.lower()
        for pattern in error_patterns:
            if pattern in text_lower:
                indicators.add(pattern)
        
        # Check for specific error patterns
        if re.search(r'at line \d+', text, re.I):
            indicators.add('line_number_error')
        
        if re.search(r'in file .+\.(?:php|py|js|java|rb)', text, re.I):
            indicators.add('file_path_error')
        
        if re.search(r'SQL.*error|ORA-\d+|MySQL.*error', text, re.I):
            indicators.add('sql_error')
        
        return indicators
    
    def _extract_dom_structure(self, html):
        """Extract basic DOM structure for comparison"""
        structure = {
            'forms': len(re.findall(r'<form', html, re.I)),
            'inputs': len(re.findall(r'<input', html, re.I)),
            'links': len(re.findall(r'<a\s+href', html, re.I)),
            'scripts': len(re.findall(r'<script', html, re.I)),
            'divs': len(re.findall(r'<div', html, re.I))
        }
        return structure
    
    def _significant_dom_change(self, baseline_dom, current_dom):
        """Check if DOM structure changed significantly"""
        if not baseline_dom or not current_dom:
            return False
        
        significant_change = False
        
        for element, baseline_count in baseline_dom.items():
            current_count = current_dom.get(element, 0)
            
            # Check for significant changes (>30% or new elements appearing)
            if baseline_count > 0:
                change_percent = abs(current_count - baseline_count) / baseline_count * 100
                if change_percent > 30:
                    significant_change = True
                    break
            elif current_count > 5:  # New elements appeared
                significant_change = True
                break
        
        return significant_change
    
    def _analyze_headers(self, baseline_headers, current_headers):
        """Analyze header differences"""
        anomalies = []
        
        # Check for new headers
        new_headers = set(current_headers.keys()) - set(baseline_headers.keys())
        for header in new_headers:
            # Interesting new headers
            if header.lower() in ['x-error', 'x-exception', 'x-debug', 'x-stacktrace']:
                anomalies.append({
                    'type': 'new_debug_header',
                    'header': header,
                    'value': current_headers[header][:100],
                    'significance': 'high'
                })
        
        # Check for removed security headers
        removed_headers = set(baseline_headers.keys()) - set(current_headers.keys())
        for header in removed_headers:
            if header.lower() in ['x-frame-options', 'x-xss-protection', 'content-security-policy']:
                anomalies.append({
                    'type': 'removed_security_header',
                    'header': header,
                    'significance': 'medium'
                })
        
        # Check for changed values in critical headers
        for header in ['content-type', 'location', 'set-cookie']:
            if header in baseline_headers and header in current_headers:
                if baseline_headers[header] != current_headers[header]:
                    anomalies.append({
                        'type': 'header_value_change',
                        'header': header,
                        'baseline': baseline_headers[header][:50],
                        'current': current_headers[header][:50],
                        'significance': 'medium'
                    })
        
        return anomalies
    
    def _calculate_severity(self, anomalies):
        """Calculate overall severity based on anomalies"""
        severity_scores = {
            'critical': 4,
            'high': 3,
            'medium': 2,
            'low': 1
        }
        
        max_severity = 'low'
        max_score = 1
        
        for anomaly in anomalies:
            significance = anomaly.get('significance', 'low')
            score = severity_scores.get(significance, 1)
            
            if score > max_score:
                max_score = score
                max_severity = significance
        
        # Upgrade severity if multiple anomalies
        if len(anomalies) >= 3 and max_severity == 'medium':
            max_severity = 'high'
        elif len(anomalies) >= 5:
            max_severity = 'critical'
        
        return max_severity
    
    def generate_report(self, url, analysis_result):
        """Generate differential analysis report"""
        if not analysis_result:
            return None
        
        report = {
            'url': url,
            'confidence': analysis_result['confidence'],
            'severity': analysis_result['severity'],
            'anomaly_count': len(analysis_result['anomalies']),
            'anomaly_types': list(set(a['type'] for a in analysis_result['anomalies'])),
            'details': []
        }
        
        # Format anomaly details
        for anomaly in analysis_result['anomalies']:
            detail = f"[{anomaly['type'].upper()}] "
            
            if anomaly['type'] == 'status_change':
                detail += f"Status code changed from {anomaly['baseline']} to {anomaly['current']}"
            elif anomaly['type'] == 'length_change':
                detail += f"Content length changed by {anomaly['change_percent']:.1f}%"
            elif anomaly['type'] == 'content_change':
                detail += f"Content similarity only {anomaly['similarity']:.1f}%"
            elif anomaly['type'] == 'timing_anomaly':
                detail += f"Response time changed by {anomaly['difference']:.2f} seconds"
            elif anomaly['type'] == 'new_errors':
                detail += f"New error indicators: {', '.join(anomaly['indicators'])}"
            elif anomaly['type'] == 'payload_reflection':
                detail += f"Payload reflected in response"
            else:
                detail += f"Anomaly detected with {anomaly.get('significance', 'unknown')} significance"
            
            report['details'].append(detail)
        
        return report
