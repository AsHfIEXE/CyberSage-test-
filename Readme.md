<div align="center">

# 🛡️ CyberSage v2.0 Elite

### Enterprise-Grade Vulnerability Intelligence & Security Testing Platform

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-5.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
[![GitHub Stars](https://img.shields.io/github/stars/AsHfIEXE/CyberSage-2.0?style=for-the-badge)](https://github.com/AsHfIEXE/CyberSage-2.0/stargazers)

**A professional-grade security assessment platform with real-time scanning, AI-powered analysis, and a beautiful modern interface. Integrates 9+ industry-standard tools with intelligent vulnerability detection and enterprise reporting.**

[Features](#-key-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Screenshots](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 🔥 What Makes CyberSage v2.0 Elite Special?

<table>
<tr>
<td width="50%">

### 🎨 **Modern, Beautiful UI**
- Stunning gradient sidebar navigation
- Animated stats cards with hover effects
- Real-time vulnerability feed
- Professional color-coded severity badges
- Responsive design for all devices

### 🛠️ **9+ Professional Tools**
- Nmap (Network Discovery)
- SQLMap (SQL Injection)
- Nikto (Web Server Scanner)
- Ffuf (Fuzzing)
- Gobuster (Directory Brute-force)
- theHarvester (OSINT)
- Amass (Subdomain Enumeration)
- WPScan (WordPress)
- Nuclei (Template-based)

### 🤖 **AI-Powered Intelligence**
- Smart remediation advice
- Context-aware security insights
- OWASP Top 10 mapping
- Working code examples
- CWE references

</td>
<td width="50%">

### ⚡ **Advanced Detection**
- **XSS**: Reflected, DOM-based, Filter bypass
- **SQLi**: Error, Boolean, Time, UNION-based
- **Command Injection**: Time-based detection
- **File Inclusion**: LFI/RFI with path traversal
- **Attack Chains**: Linked vulnerability detection
- **API Security**: REST/GraphQL testing
- **Business Logic**: Race conditions, price manipulation

### 📊 **Enterprise Features**
- Beautiful PDF reports with charts
- Intelligent confidence scoring (50-100%)
- Real-time WebSocket updates
- Persistent scan logs
- Export to JSON/PDF
- Professional error handling
- Automatic retry logic

### 🚀 **Performance**
- 4x deeper scanning (vs v1.0)
- 15+ XSS payloads
- 13+ SQLi techniques
- 200 endpoint limit
- Parallel tool execution

</td>
</tr>
</table>

---

## 🚀 Quick Start

### 🐧 Linux Installation (Automated - Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/AsHfIEXE/CyberSage-2.0.git
cd CyberSage-2.0

# 2. Run the automated setup script
chmod +x setup.sh
./setup.sh

# This script will automatically:
# ✅ Install professional security tools (nmap, nikto, sqlmap, gobuster, etc.)
# ✅ Install wordlists for fuzzing
# ✅ Set up Python virtual environment
# ✅ Install all Python dependencies
# ✅ Install all Node.js dependencies
# ✅ Create configuration files
# ✅ Initialize database
# ✅ Create start script

# 3. Start CyberSage
./start.sh

# 4. Open browser
# http://localhost:3000
```

### 🛠️ Manual Linux Installation

```bash
# If you prefer manual installation:

# 1. Clone repository
git clone https://github.com/AsHfIEXE/CyberSage-2.0.git
cd CyberSage-2.0

# 2. Install professional security tools
sudo apt update
sudo apt install -y nmap nikto sqlmap gobuster dirb wordlists

# 3. Install Python dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Start backend (Terminal 1)
cd ../backend
source venv/bin/activate
python app.py

# 6. Start frontend (Terminal 2)
cd ../frontend
npm start

# 7. Open browser at http://localhost:3000
```

### 🐳 Docker Installation

```bash
# 1. Clone and navigate
git clone https://github.com/AsHfIEXE/CyberSage-2.0.git
cd CyberSage-2.0

# 2. (Optional) Configure AI features
cp backend/env.example backend/.env
# Edit backend/.env and add your OpenRouter API key

# 3. Build and run
docker-compose up --build

# 4. Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### ⚡ Running Your First Scan

1. Open **http://localhost:3000**
2. Click **🎯 Scanner** in sidebar
3. Enter target: `http://testphp.vulnweb.com`
4. Select **Elite** mode
5. Click **"Start Security Scan"**
6. Watch vulnerabilities appear in **📊 Dashboard**
7. Export professional **PDF Report** when complete

---

## 📸 Screenshots

<div align="center">

### Modern Dashboard
![Dashboard](https://via.placeholder.com/800x450/1a1a2e/ffffff?text=Dashboard+with+Real-Time+Stats)

### Vulnerability Detection
![Vulnerabilities](https://via.placeholder.com/800x450/1a1a2e/ffffff?text=Detailed+Vulnerability+Cards)

### Professional Tools Activity
![Tools](https://via.placeholder.com/800x450/1a1a2e/ffffff?text=Professional+Tools+Running)

### Beautiful PDF Reports
![PDF Report](https://via.placeholder.com/800x450/1a1a2e/ffffff?text=AI-Powered+PDF+Reports)

</div>

---

## 📖 Detailed Usage Guide

### Starting a Scan

1.  **Navigate & Configure**:
    -   Navigate to the dashboard at `http://localhost:3000`.
    -   Enter your target URL or domain (e.g., `https://example.com`).
    -   Select a scan mode:
        -   **⚡ Quick**: Basic, fast checks.
        -   **🔍 Standard**: Comprehensive vulnerability scan.
        -   **🧠 Elite**: Full scan including professional tools, business logic, and AI analysis.
    -   Click **"Start Elite Scan"**.

2.  **Monitor in Real-Time**:
    -   Watch the **Progress Bar** for the current scan phase and completion percentage.
    -   See live findings appear in the **Vulnerability Feed**.
    -   Keep an eye on **Tool Activity** to see which scanners are currently active.
    -   Critical **Attack Chains** will appear as high-priority alerts.

3.  **Analyze Results**:
    -   Click any vulnerability to open a detailed modal with technical information, HTTP history, and remediation advice.
    -   Review the **Blueprint Viewer** to understand the application's structure and discovered assets.
    -   Check the **Scan Charts** and **AI Insights** for a high-level overview and intelligent recommendations.

---

## 🏛️ Architecture

CyberSage uses a decoupled frontend/backend architecture, communicating primarily over WebSockets for a real-time, interactive experience.

```
CyberSage-2.0/
├── backend/
│   ├── app.py                 # Main Flask + SocketIO server
│   ├── core/
│   │   ├── database.py        # SQLite database operations
│   │   ├── scan_orchestrator.py  # Main scan coordinator
│   │   └── ...
│   ├── tools/
│   │   ├── recon.py          # Reconnaissance engine
│   │   ├── vuln_scanner.py   # Core vulnerability scanner
│   │   ├── professional_tools.py # Integration for Nmap, Nuclei, etc.
│   │   └── advanced/
│   │       ├── chain_detector.py
│   │       ├── business_logic.py
│   │       ├── api_security.py
│   │       └── ai_analyzer.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main React entrypoint
│   │   ├── components/
│   │   │   ├── Dashboard.jsx  # Main UI layout
│   │   │   ├── ScanControl.jsx
│   │   │   ├── VulnerabilityFeed.jsx
│   │   │   └── ...
│   │   └── hooks/
│   │       └── useWebSocket.js # WebSocket connection logic
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🔧 Configuration

### API Key for AI Analysis
For AI-powered insights, an OpenRouter API key is required.

1.  Create a file named `.env` inside the `backend/` directory.
2.  Add your API key to it:
    ```env
    # backend/.env
    OPENROUTER_API_KEY="your_api_key_here"
    ```
> Get a free key at **[openrouter.ai](https://openrouter.ai)**. The application will function without it, but AI features will be disabled.

---

## 🚀 Advanced Features Explained

### Attack Chain Detection
CyberSage intelligently connects individual vulnerabilities to reveal how they can be combined into a high-impact attack.
-   **Example Chain**: `Sensitive File Exposure` -> `Credential Extraction` -> `Internal Access`.
-   **Why it Matters**: It elevates the risk of seemingly low-severity findings and helps prioritize remediation by focusing on the most critical paths.

### Business Logic Scanner
This module tests for flaws unique to the application's logic that generic scanners miss.
-   **Race Conditions**: Sends rapid, parallel requests to endpoints like `/redeem-voucher` to check for double-spend flaws.
-   **Price Manipulation**: Attempts to submit negative or zero values in cart/payment forms to bypass server-side validation.

### Professional Tool Integration
The `ScanOrchestrator` acts as a master controller, deploying a suite of best-in-class open-source tools based on the scan configuration. It automates execution, parses the output, and integrates the findings directly into the real-time feed, correlating them with its own discoveries.

---

## 🛠️ Troubleshooting

### Common Issues

**Professional Tools Not Running**:
```bash
# Check if tools are installed
which nmap nikto sqlmap gobuster

# If missing, re-run setup script
./setup.sh

# Or install manually
sudo apt install nmap nikto sqlmap gobuster dirb wordlists
```

**Backend Connection Issues**:
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# View backend logs
tail -f backend.log

# Check for port conflicts
lsof -i :5000

# Kill conflicting process
kill -9 $(lsof -t -i:5000)
```

**Frontend Won't Start**:
```bash
# View frontend logs
tail -f frontend.log

# Check for port conflicts
lsof -i :3000

# Clear npm cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**No Vulnerabilities Detected**:
- ✅ Verify target is accessible: `curl -I http://target.com`
- ✅ Try known vulnerable app: `http://testphp.vulnweb.com`
- ✅ Check scan mode: Use **Elite** for all tools
- ✅ Check logs for errors: `tail -f backend.log`
- ✅ Ensure professional tools are installed: `./setup.sh`

**Permission Issues (Linux)**:
```bash
# Give nmap capabilities
sudo setcap cap_net_raw,cap_net_admin,cap_net_bind_service+eip $(which nmap)

# Or run backend with sudo (not recommended for production)
cd backend
sudo venv/bin/python app.py
```

**Wordlist Not Found**:
```bash
# Install wordlists
sudo apt install wordlists seclists

# Check installation
ls /usr/share/wordlists/
ls /usr/share/seclists/

# CyberSage will create fallback wordlist if none found
```

---

## 🔒 Legal & Ethical Use

> ⚠️ **IMPORTANT**: This tool is intended for professional and ethical use only. You must only scan targets that you own or have explicit, written permission to test. Unauthorized scanning of systems is illegal and can lead to severe legal consequences. The developers of CyberSage are not responsible for any misuse of this tool.

---

## 📊 API Reference

### REST Endpoints
-   `GET /api/health`: Checks the health of the backend server.
-   `GET /api/scans`: Retrieves a list of all historical scans.
-   `GET /api/scan/<scan_id>`: Fetches detailed results for a specific scan.
-   `GET /api/scan/<scan_id>/export`: Exports full scan data as JSON.
-   `GET /api/scan/<scan_id>/export/pdf`: Exports a summary report as a PDF.
-   `POST /api/scan/import`: Imports scan data from third-party tools.

### WebSocket Events
*Communication occurs over the `/scan` namespace.*

**Client → Server**
-   `start_scan`: Initiates a new scan. Payload: `{ target, mode, options }`.
-   `stop_scan`: Requests to stop an active scan. Payload: `{ scan_id }`.

**Server → Client**
-   `scan_started`: Confirms a scan has begun.
-   `scan_progress`: Provides percentage and phase updates.
-   `vulnerability_found`: Pushes a new vulnerability in real-time.
-   `chain_detected`: Pushes a new attack chain as a high-priority alert.
-   `ai_insight`: Pushes an AI-generated analysis or recommendation.
-   `scan_completed`: Signals the end of a scan with a summary.

---

## 💻 Tech Stack

### Backend
- **Python 3.9+** - Core language
- **Flask** - Web framework
- **Flask-SocketIO** - Real-time WebSocket communication
- **SQLite** - Database for scan results
- **Requests** - HTTP client
- **BeautifulSoup4** - HTML parsing
- **ReportLab** - PDF generation
- **Selenium** (Optional) - Headless browser for AJAX crawling

### Frontend
- **React 18** - UI framework
- **TailwindCSS 3** - Modern styling
- **Socket.IO Client** - Real-time updates
- **Recharts** - Data visualization
- **Lucide React** - Beautiful icons

### Professional Tools (Integrated)
- **Nmap** - Network discovery and security auditing
- **SQLMap** - Automatic SQL injection detection
- **Nikto** - Web server scanner
- **Ffuf** - Fast web fuzzer
- **Gobuster** - Directory/DNS brute-forcing
- **theHarvester** - E-mail, subdomain and people names harvester
- **Amass** - In-depth attack surface mapping
- **WPScan** - WordPress security scanner
- **Nuclei** - Template-based vulnerability scanner

---

## 📈 Scan Modes Comparison

| Feature | Quick | Standard | Elite |
|---------|-------|----------|-------|
| **Duration** | 2-5 min | 20-30 min | 45-75 min |
| **Endpoints** | 50 | 100 | 200 |
| **XSS Payloads** | 7 | 15+ | 15+ |
| **SQLi Techniques** | 5 | 13+ | 13+ |
| **Professional Tools** | Nmap only | 5 tools | All 9 tools |
| **Attack Chains** | ❌ | ✅ | ✅ |
| **Business Logic** | ❌ | ❌ | ✅ |
| **API Security** | ❌ | ✅ | ✅ |
| **AI Analysis** | ❌ | ❌ | ✅ |
| **PDF Report** | ✅ | ✅ | ✅ (Enhanced) |

---

## 🎯 Detection Capabilities

### Vulnerability Coverage

<table>
<tr>
<td>

**🔴 Critical**
- SQL Injection (4 types)
- Remote Code Execution
- Authentication Bypass
- Arbitrary File Upload

</td>
<td>

**🟠 High**
- XSS (Reflected, DOM, Stored)
- Command Injection
- File Inclusion (LFI/RFI)
- XXE Injection

</td>
</tr>
<tr>
<td>

**🟡 Medium**
- CSRF
- Open Redirects
- IDOR
- SSRF

</td>
<td>

**🟢 Low**
- Security Headers
- Sensitive Information Exposure
- Directory Listing
- Version Disclosure

</td>
</tr>
</table>

### Confidence Scoring System

CyberSage v2.0 uses intelligent confidence scoring (50-100%) based on:

- **90-100%**: Error-based detection, clear exploitation proof
- **80-89%**: Multiple evidence points, very likely exploitable
- **70-79%**: Strong indicators, probable vulnerability
- **60-69%**: Moderate evidence, requires verification
- **50-59%**: Weak indicators, possible false positive

---

## 📚 Documentation

- **[Installation Guide](docs/INSTALLATION.md)** - Detailed setup instructions
- **[User Manual](docs/USER_MANUAL.md)** - Complete feature documentation
- **[API Reference](docs/API.md)** - REST and WebSocket APIs
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute
- **[Changelog](CHANGELOG.md)** - Version history

---

## 🤝 Contributing

We love contributions! Here's how you can help:

### 🐛 Bug Reports
Found a bug? [Open an issue](https://github.com/AsHfIEXE/CyberSage-2.0/issues) with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

### ✨ Feature Requests
Have an idea? [Create a feature request](https://github.com/AsHfIEXE/CyberSage-2.0/issues/new) describing:
- The problem you're solving
- Your proposed solution
- Any alternatives you've considered

### 🔧 Pull Requests
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 🎯 Areas for Contribution
- [ ] Additional vulnerability scanners (SSRF, Deserialization, etc.)
- [ ] More professional tool integrations
- [ ] Enhanced AI analysis capabilities
- [ ] Multi-language support
- [ ] Performance optimizations
- [ ] Mobile-responsive improvements

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Thanks to all the open-source security tools that make this possible
- OWASP for security testing guidelines
- The cybersecurity community for continuous feedback

---

## 📞 Support & Community

- **GitHub Issues**: [Report bugs or request features](https://github.com/AsHfIEXE/CyberSage-2.0/issues)
- **Discussions**: [Join the community](https://github.com/AsHfIEXE/CyberSage-2.0/discussions)
- **Security**: Found a security issue? Email security@cybersage.dev (Do not open public issues)

---

<div align="center">

### ⭐ Star this repository if you find it helpful!

**Made with ❤️ by the CyberSage Team**

[⬆ Back to Top](#️-cybersage-v20-elite)

</div>
