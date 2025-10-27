"""
Enhanced Web Crawler with AJAX Spider
Advanced crawling with scope control, detailed logging, and real-time visibility
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urljoin, parse_qs, urlunparse
import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import json
import hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
import tldextract

class EnhancedCrawler:
    """
    Advanced crawler with AJAX support and scope control
    """
    
    def __init__(self, broadcaster=None):
        self.broadcaster = broadcaster
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Crawling state
        self.crawled_urls = set()
        self.to_crawl = []
        self.forms = []
        self.api_endpoints = []
        self.parameters = {}
        self.javascript_urls = set()
        
        # Scope control
        self.scope_domain = None
        self.scope_subdomains = []
        self.allowed_domains = set()
        self.blocked_extensions = {
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.ico',
            '.css', '.js', '.woff', '.woff2', '.ttf', '.eot',
            '.mp4', '.mp3', '.avi', '.mov', '.wmv', '.flv',
            '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
            '.zip', '.rar', '.tar', '.gz', '.7z'
        }
        
        # Detailed logging
        self.crawl_log = []
        self.current_depth = 0
        self.max_depth = 5
        self.max_pages = 500
        
        # AJAX spider
        self.driver = None
        self.ajax_enabled = False
        
    def set_scope(self, target_url):
        """
        Set crawling scope based on target URL
        """
        parsed = urlparse(target_url)
        
        # Extract domain and TLD
        extracted = tldextract.extract(target_url)
        self.scope_domain = f"{extracted.domain}.{extracted.suffix}"
        
        # Set allowed domains (main domain + subdomains)
        self.allowed_domains.add(parsed.netloc)
        self.allowed_domains.add(self.scope_domain)
        
        # Add www version if not present
        if not parsed.netloc.startswith('www.'):
            self.allowed_domains.add(f"www.{parsed.netloc}")
        else:
            self.allowed_domains.add(parsed.netloc.replace('www.', ''))
        
        # Log scope
        self._log_event('SCOPE_SET', f"Domain: {self.scope_domain}, Allowed: {self.allowed_domains}")
        
        if self.broadcaster:
            self.broadcaster.send_log(f"[Crawler] Scope set to: {self.scope_domain}")
            self.broadcaster.send_log(f"[Crawler] Allowed domains: {', '.join(self.allowed_domains)}")
    
    def is_in_scope(self, url):
        """
        Check if URL is within defined scope
        """
        try:
            parsed = urlparse(url)
            
            # Check if it's a relative URL (always in scope)
            if not parsed.netloc:
                return True
            
            # Check against allowed domains
            if parsed.netloc in self.allowed_domains:
                return True
            
            # Check if it's a subdomain of the main domain
            if self.scope_domain and self.scope_domain in parsed.netloc:
                return True
            
            # Check for IP addresses (block external IPs)
            if re.match(r'\d+\.\d+\.\d+\.\d+', parsed.netloc):
                # Only allow localhost/private IPs
                if parsed.netloc.startswith(('127.', '192.168.', '10.', '172.')):
                    return True
                return False
            
            return False
            
        except Exception:
            return False
    
    def should_crawl(self, url):
        """
        Determine if URL should be crawled
        """
        # Check if already crawled
        if url in self.crawled_urls:
            return False
        
        # Check scope
        if not self.is_in_scope(url):
            self._log_event('OUT_OF_SCOPE', f"Skipping: {url}")
            return False
        
        # Check file extensions
        parsed = urlparse(url)
        path = parsed.path.lower()
        
        for ext in self.blocked_extensions:
            if path.endswith(ext):
                return False
        
        # Check max pages limit
        if len(self.crawled_urls) >= self.max_pages:
            return False
        
        return True
    
    def crawl(self, start_url, max_depth=5, use_ajax=True):
        """
        Enhanced crawling with detailed logging
        """
        self.max_depth = max_depth
        self.ajax_enabled = use_ajax
        
        # Set scope
        self.set_scope(start_url)
        
        # Initialize AJAX spider if enabled
        if use_ajax:
            self._init_ajax_spider()
        
        # Start crawling
        self._log_event('CRAWL_START', f"Starting crawl of {start_url}")
        
        if self.broadcaster:
            self.broadcaster.send_log(f"[Crawler] Starting enhanced crawl")
            self.broadcaster.send_log(f"[Crawler] Max depth: {max_depth}, AJAX: {use_ajax}")
        
        # Add start URL to queue
        self.to_crawl.append((start_url, 0))
        
        # Crawl loop
        while self.to_crawl and len(self.crawled_urls) < self.max_pages:
            url, depth = self.to_crawl.pop(0)
            
            if depth > self.max_depth:
                continue
            
            if not self.should_crawl(url):
                continue
            
            # Crawl the URL
            self._crawl_url(url, depth)
        
        # AJAX spider for JavaScript-rendered content
        if use_ajax and self.driver:
            self._ajax_spider(start_url)
        
        # Clean up
        if self.driver:
            self.driver.quit()
        
        # Generate report
        return self._generate_crawl_report()
    
    def _crawl_url(self, url, depth):
        """
        Crawl a single URL with detailed logging
        """
        self.crawled_urls.add(url)
        self.current_depth = depth
        
        # Log crawling event
        self._log_event('CRAWLING', f"Depth {depth}: {url}")
        
        if self.broadcaster:
            self.broadcaster.send_log(f"[Crawler] Crawling ({depth}/{self.max_depth}): {url}")
        
        try:
            # Make request
            response = self.session.get(url, timeout=10, verify=False, allow_redirects=True)
            
            # Check if redirected out of scope
            if not self.is_in_scope(response.url):
                self._log_event('REDIRECT_OUT_OF_SCOPE', f"{url} -> {response.url}")
                return
            
            # Parse content
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extract links
            links = self._extract_links(soup, url)
            for link in links:
                if self.should_crawl(link):
                    self.to_crawl.append((link, depth + 1))
                    self._log_event('FOUND_LINK', f"Found: {link}")
            
            # Extract forms
            forms = self._extract_forms(soup, url)
            self.forms.extend(forms)
            if forms:
                self._log_event('FOUND_FORMS', f"Found {len(forms)} forms on {url}")
            
            # Extract parameters
            params = self._extract_parameters(url, soup)
            if params:
                self.parameters[url] = params
                self._log_event('FOUND_PARAMS', f"Found parameters: {list(params.keys())}")
            
            # Extract API endpoints
            apis = self._extract_api_endpoints(response.text, url)
            self.api_endpoints.extend(apis)
            if apis:
                self._log_event('FOUND_API', f"Found {len(apis)} API endpoints")
            
            # Extract JavaScript URLs
            js_urls = self._extract_javascript_urls(soup, url)
            self.javascript_urls.update(js_urls)
            
            # Log success
            self._log_event('CRAWLED', f"Successfully crawled: {url}")
            
        except requests.exceptions.Timeout:
            self._log_event('TIMEOUT', f"Timeout crawling: {url}")
        except requests.exceptions.ConnectionError:
            self._log_event('CONNECTION_ERROR', f"Connection error: {url}")
        except Exception as e:
            self._log_event('ERROR', f"Error crawling {url}: {str(e)}")
    
    def _extract_links(self, soup, base_url):
        """
        Extract all links from page
        """
        links = set()
        
        # <a> tags
        for tag in soup.find_all('a', href=True):
            url = urljoin(base_url, tag['href'])
            if self.is_in_scope(url):
                links.add(self._normalize_url(url))
        
        # <form> actions
        for form in soup.find_all('form', action=True):
            url = urljoin(base_url, form['action'])
            if self.is_in_scope(url):
                links.add(self._normalize_url(url))
        
        # <iframe> and <frame> sources
        for tag in soup.find_all(['iframe', 'frame'], src=True):
            url = urljoin(base_url, tag['src'])
            if self.is_in_scope(url):
                links.add(self._normalize_url(url))
        
        # JavaScript links in onclick, etc.
        for tag in soup.find_all(True):
            for attr in ['onclick', 'onsubmit', 'onchange']:
                if tag.has_attr(attr):
                    js_code = tag[attr]
                    urls = re.findall(r'[\'"]([^\'"\s]+\.(?:php|asp|jsp|html|htm|do|action))[\'"]', js_code)
                    for url in urls:
                        full_url = urljoin(base_url, url)
                        if self.is_in_scope(full_url):
                            links.add(self._normalize_url(full_url))
        
        return links
    
    def _extract_forms(self, soup, base_url):
        """
        Extract and analyze forms
        """
        forms = []
        
        for form in soup.find_all('form'):
            form_data = {
                'url': base_url,
                'action': urljoin(base_url, form.get('action', base_url)),
                'method': form.get('method', 'get').upper(),
                'inputs': [],
                'parameters': {}
            }
            
            # Extract input fields
            for input_tag in form.find_all(['input', 'textarea', 'select']):
                input_data = {
                    'name': input_tag.get('name', ''),
                    'type': input_tag.get('type', 'text'),
                    'value': input_tag.get('value', ''),
                    'required': input_tag.has_attr('required')
                }
                
                if input_data['name']:
                    form_data['inputs'].append(input_data)
                    form_data['parameters'][input_data['name']] = input_data['value']
            
            if form_data['inputs']:
                forms.append(form_data)
                
                if self.broadcaster:
                    self.broadcaster.send_log(
                        f"[Crawler] Form found: {form_data['method']} {form_data['action']} "
                        f"({len(form_data['inputs'])} fields)"
                    )
        
        return forms
    
    def _extract_parameters(self, url, soup):
        """
        Extract URL parameters and potential injection points
        """
        parameters = {}
        
        # URL parameters
        parsed = urlparse(url)
        if parsed.query:
            params = parse_qs(parsed.query)
            for param, values in params.items():
                parameters[param] = {
                    'type': 'url',
                    'value': values[0] if values else '',
                    'location': 'query'
                }
        
        # Hidden inputs (potential parameters)
        for input_tag in soup.find_all('input', type='hidden'):
            name = input_tag.get('name')
            if name:
                parameters[name] = {
                    'type': 'hidden',
                    'value': input_tag.get('value', ''),
                    'location': 'form'
                }
        
        # Data attributes (potential AJAX parameters)
        for tag in soup.find_all(True):
            for attr in tag.attrs:
                if attr.startswith('data-'):
                    param_name = attr.replace('data-', '')
                    parameters[param_name] = {
                        'type': 'data-attribute',
                        'value': tag[attr],
                        'location': 'html'
                    }
        
        return parameters
    
    def _extract_api_endpoints(self, content, base_url):
        """
        Extract API endpoints from JavaScript
        """
        endpoints = []
        
        # Common API patterns
        api_patterns = [
            r'[\'"](/api/[^\'"\s]+)[\'"]',
            r'[\'"](/v\d+/[^\'"\s]+)[\'"]',
            r'[\'"](/rest/[^\'"\s]+)[\'"]',
            r'[\'"](/graphql[^\'"\s]*)[\'"]',
            r'[\'"](/ws/[^\'"\s]+)[\'"]',
            r'fetch\s*\(\s*[\'"]([^\'"\s]+)[\'"]',
            r'axios\.\w+\s*\(\s*[\'"]([^\'"\s]+)[\'"]',
            r'XMLHttpRequest.*open\s*\(\s*[\'"](?:GET|POST|PUT|DELETE)[\'"],\s*[\'"]([^\'"\s]+)[\'"]'
        ]
        
        for pattern in api_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for match in matches:
                if match.startswith('/'):
                    endpoint = urljoin(base_url, match)
                else:
                    endpoint = match
                
                if self.is_in_scope(endpoint):
                    endpoints.append({
                        'url': endpoint,
                        'type': 'api',
                        'method': 'GET'  # Default, will be determined later
                    })
        
        return endpoints
    
    def _extract_javascript_urls(self, soup, base_url):
        """
        Extract URLs from JavaScript code
        """
        js_urls = set()
        
        # Script tags
        for script in soup.find_all('script'):
            if script.string:
                # Look for URLs in JavaScript
                url_patterns = [
                    r'[\'"]((https?:)?//[^\'"\s]+)[\'"]',
                    r'[\'](/[^\'"\s]+)[\'"]'
                ]
                
                for pattern in url_patterns:
                    matches = re.findall(pattern, script.string)
                    for match in matches:
                        if isinstance(match, tuple):
                            match = match[0]
                        
                        if match.startswith('/'):
                            url = urljoin(base_url, match)
                        else:
                            url = match
                        
                        if self.is_in_scope(url):
                            js_urls.add(url)
        
        return js_urls
    
    def _init_ajax_spider(self):
        """
        Initialize Selenium WebDriver for AJAX crawling
        """
        try:
            options = Options()
            options.add_argument('--headless')
            options.add_argument('--no-sandbox')
            options.add_argument('--disable-dev-shm-usage')
            options.add_argument('--disable-gpu')
            options.add_argument('--window-size=1920,1080')
            
            # Try to use Chrome
            try:
                from selenium.webdriver.chrome.service import Service
                from webdriver_manager.chrome import ChromeDriverManager
                
                service = Service(ChromeDriverManager().install())
                self.driver = webdriver.Chrome(service=service, options=options)
                
            except Exception:
                # Fallback to Firefox
                from selenium.webdriver.firefox.options import Options as FirefoxOptions
                
                firefox_options = FirefoxOptions()
                firefox_options.add_argument('--headless')
                self.driver = webdriver.Firefox(options=firefox_options)
            
            self._log_event('AJAX_SPIDER_INIT', 'AJAX spider initialized')
            
        except Exception as e:
            self._log_event('AJAX_SPIDER_ERROR', f"Failed to initialize: {str(e)}")
            self.ajax_enabled = False
    
    def _ajax_spider(self, start_url):
        """
        Crawl JavaScript-rendered content
        """
        if not self.driver:
            return
        
        self._log_event('AJAX_SPIDER_START', f"Starting AJAX spider on {start_url}")
        
        if self.broadcaster:
            self.broadcaster.send_log("[Crawler] Starting AJAX spider for JavaScript content")
        
        try:
            # Load the page
            self.driver.get(start_url)
            
            # Wait for dynamic content
            time.sleep(3)
            
            # Scroll to trigger lazy loading
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2)
            
            # Extract dynamically loaded content
            self._extract_ajax_content()
            
            # Interact with page elements
            self._interact_with_elements()
            
            # Extract AJAX requests
            self._capture_ajax_requests()
            
        except Exception as e:
            self._log_event('AJAX_SPIDER_ERROR', f"Error during AJAX spider: {str(e)}")
    
    def _extract_ajax_content(self):
        """
        Extract content loaded by JavaScript
        """
        try:
            # Get all links after JavaScript execution
            links = self.driver.find_elements(By.TAG_NAME, 'a')
            for link in links:
                href = link.get_attribute('href')
                if href and self.is_in_scope(href):
                    if href not in self.crawled_urls:
                        self.javascript_urls.add(href)
                        self._log_event('AJAX_FOUND_LINK', f"AJAX found: {href}")
            
            # Get forms created by JavaScript
            forms = self.driver.find_elements(By.TAG_NAME, 'form')
            for form in forms:
                action = form.get_attribute('action')
                if action:
                    form_url = urljoin(self.driver.current_url, action)
                    if self.is_in_scope(form_url):
                        self._log_event('AJAX_FOUND_FORM', f"AJAX form: {form_url}")
            
        except Exception as e:
            self._log_event('AJAX_EXTRACT_ERROR', str(e))
    
    def _interact_with_elements(self):
        """
        Interact with clickable elements to discover more content
        """
        try:
            # Click on buttons that might load content
            buttons = self.driver.find_elements(By.TAG_NAME, 'button')
            for button in buttons[:5]:  # Limit to prevent infinite loops
                try:
                    if button.is_displayed() and button.is_enabled():
                        button.click()
                        time.sleep(1)
                        
                        # Check for new content
                        self._extract_ajax_content()
                        
                except Exception:
                    continue
            
        except Exception as e:
            self._log_event('AJAX_INTERACT_ERROR', str(e))
    
    def _capture_ajax_requests(self):
        """
        Capture AJAX requests made by the page
        """
        try:
            # Inject JavaScript to capture AJAX requests
            ajax_capture_script = """
            var ajaxRequests = [];
            var originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
                ajaxRequests.push({method: method, url: url});
                originalOpen.apply(this, arguments);
            };
            
            var originalFetch = window.fetch;
            window.fetch = function(url) {
                ajaxRequests.push({method: 'GET', url: url});
                return originalFetch.apply(this, arguments);
            };
            
            return ajaxRequests;
            """
            
            # Execute script and wait for requests
            self.driver.execute_script(ajax_capture_script)
            time.sleep(3)
            
            # Get captured requests
            requests = self.driver.execute_script("return ajaxRequests;")
            
            if requests:
                for req in requests:
                    url = req.get('url')
                    if url and self.is_in_scope(url):
                        self.api_endpoints.append({
                            'url': url,
                            'method': req.get('method', 'GET'),
                            'type': 'ajax'
                        })
                        self._log_event('AJAX_REQUEST_CAPTURED', f"{req['method']} {url}")
            
        except Exception as e:
            self._log_event('AJAX_CAPTURE_ERROR', str(e))
    
    def _normalize_url(self, url):
        """
        Normalize URL for consistency
        """
        parsed = urlparse(url)
        
        # Remove fragment
        normalized = urlunparse((
            parsed.scheme,
            parsed.netloc,
            parsed.path,
            parsed.params,
            parsed.query,
            ''  # Remove fragment
        ))
        
        # Remove trailing slash for consistency
        if normalized.endswith('/') and normalized != '/':
            normalized = normalized[:-1]
        
        return normalized
    
    def _log_event(self, event_type, message):
        """
        Log crawling events with timestamp
        """
        log_entry = {
            'timestamp': time.time(),
            'type': event_type,
            'message': message,
            'depth': self.current_depth
        }
        
        self.crawl_log.append(log_entry)
        
        # Also print for debugging
        print(f"[{event_type}] {message}")
    
    def _generate_crawl_report(self):
        """
        Generate detailed crawl report
        """
        report = {
            'summary': {
                'total_crawled': len(self.crawled_urls),
                'total_forms': len(self.forms),
                'total_parameters': sum(len(p) for p in self.parameters.values()),
                'total_api_endpoints': len(self.api_endpoints),
                'javascript_urls': len(self.javascript_urls),
                'scope_domain': self.scope_domain,
                'max_depth_reached': self.current_depth
            },
            'crawled_urls': list(self.crawled_urls),
            'forms': self.forms,
            'parameters': self.parameters,
            'api_endpoints': self.api_endpoints,
            'javascript_urls': list(self.javascript_urls),
            'crawl_log': self.crawl_log[-100:]  # Last 100 events
        }
        
        # Log summary
        if self.broadcaster:
            self.broadcaster.send_log(f"[Crawler] Crawl complete: {report['summary']['total_crawled']} URLs")
            self.broadcaster.send_log(f"[Crawler] Found {report['summary']['total_forms']} forms")
            self.broadcaster.send_log(f"[Crawler] Found {report['summary']['total_parameters']} parameters")
            self.broadcaster.send_log(f"[Crawler] Found {report['summary']['total_api_endpoints']} API endpoints")
        
        return report
    
    def get_crawl_status(self):
        """
        Get real-time crawl status
        """
        return {
            'crawled': len(self.crawled_urls),
            'queued': len(self.to_crawl),
            'current_depth': self.current_depth,
            'max_depth': self.max_depth,
            'forms_found': len(self.forms),
            'parameters_found': sum(len(p) for p in self.parameters.values()),
            'api_endpoints': len(self.api_endpoints),
            'in_scope': self.scope_domain,
            'currently_crawling': self.to_crawl[0][0] if self.to_crawl else None
        }
