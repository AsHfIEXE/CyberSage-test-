# CyberSage v2.0 - User Guide

## Quick Start

### Starting the Application

1. **Backend**:
   ```bash
   cd backend
   python app.py
   ```
   Backend will run on: http://localhost:5000

2. **Frontend**:
   ```bash
   cd frontend
   npm install  # First time only
   npm start
   ```
   Frontend will open on: http://localhost:3000

---

## Using the New Features

### 1. 🔍 Viewing Detailed Vulnerability Information

**How to Access**:
- Navigate to **Vulnerabilities** page
- Click on any vulnerability card

**What You'll See**:
- **Overview Tab**: Basic information, affected URL, parameters
- **Technical Details Tab**: Exploit payloads, HTTP request/response
- **Exploitability Tab**: Rating (Critical/High/Medium/Low) with proof of concept
- **Impact Analysis Tab**: Potential damage scenarios
- **Remediation Tab**: Step-by-step fix guide
- **References Tab**: Links to CVE, MITRE CWE, OWASP, NVD, ExploitDB

**Tip**: Look for the CWE ID and CVSS score in the header for quick assessment

---

### 2. 📝 Real-Time Scan Logs

**Location**: Dashboard page (shows during active scans)

**Features**:
- **Auto-scroll**: Automatically scrolls to show latest logs
- **Filter by Level**: 
  - All Logs
  - Info (blue)
  - Success (green)
  - Warning (yellow)
  - Error (red)
- **Export**: Save logs to text file
- **Clear**: Remove all logs from view

**What Logs Show**:
- Tool start/stop events
- Endpoint discoveries
- Vulnerability findings
- Scan progress
- Error messages

---

### 3. ⏯️ Scan Control Panel

**Location**: Dashboard page (shows during active scans)

**Controls**:
- **⏸️ Pause**: Pause the current scan
- **▶️ Resume**: Resume a paused scan
- **⏹️ Stop**: Stop the scan completely

**Display**:
- Progress bar with percentage
- Current scan phase
- Scan ID for reference

---

### 4. 📄 PDF Report Export

**How to Export**:
1. Complete a scan
2. Navigate to **Vulnerabilities** page
3. Click "📄 Export PDF Report" button
4. PDF will download automatically

**Report Contents**:
- Title page with scan metadata
- Executive summary
- Vulnerability breakdown by severity
- Detailed vulnerability descriptions
- Attack chains (if any)
- Scan statistics

---

### 5. 🔧 Professional Tool Integration

**Available Tools**:
- **Nmap**: Network and port scanning
- **Nikto**: Web server vulnerability scanning
- **SQLMap**: SQL injection testing
- **theHarvester**: Email and subdomain enumeration
- **Amass**: Advanced subdomain discovery
- **Ffuf/Gobuster**: Directory brute-forcing
- **WPScan**: WordPress vulnerability scanning
- **Nuclei**: Template-based scanning

**How to Enable**:
1. Go to Scanner page
2. Expand "Advanced Options"
3. Check tools you want to use
4. Start scan

**Note**: Tools must be installed on your system. Windows users should use WSL or install tools via Chocolatey.

---

### 6. 🌐 Discovered Endpoints

**Real-Time Discovery**:
- Watch logs for "🔍 Discovered endpoint" messages
- Each endpoint shows HTTP method and URL
- Parameters are extracted and tested automatically

**Where Endpoints Are Used**:
- Tested for XSS vulnerabilities
- Checked for SQL injection
- Examined for command injection
- Analyzed for file inclusion bugs

---

## Understanding Vulnerability Severity

### Critical (🔴)
- CVSS 9.0+
- Immediate remediation required
- Examples: SQL Injection, Remote Code Execution

### High (🟠)
- CVSS 7.0-8.9
- High priority fixes
- Examples: Command Injection, LFI

### Medium (🟡)
- CVSS 4.0-6.9
- Should be fixed soon
- Examples: XSS, Sensitive File Exposure

### Low (🟢)
- CVSS 0-3.9
- Fix when convenient
- Examples: Missing Security Headers, Information Disclosure

---

## Scan Modes

### Quick Scan
- Basic vulnerability checks
- Fast completion (~2-5 minutes)
- Good for initial assessment

### Standard Scan
- Comprehensive testing
- Medium depth (~10-15 minutes)
- Includes form discovery

### Elite Scan (Recommended)
- Maximum depth scanning
- All advanced features enabled
- AI-powered analysis
- Form security analysis
- Chain detection
- Duration: 20-30 minutes

---

## Interpreting Results

### Confidence Score
- **90-100%**: Very high confidence, likely exploitable
- **70-89%**: High confidence, manual verification recommended
- **50-69%**: Medium confidence, requires investigation
- **Below 50%**: Lower confidence, potential false positive

### CWE (Common Weakness Enumeration)
- Industry-standard vulnerability classification
- Click CWE ID to learn more about the vulnerability type
- Example: CWE-79 = Cross-Site Scripting

### CVSS (Common Vulnerability Scoring System)
- 0-10 scale measuring severity
- Considers exploitability, impact, and other factors
- Industry-standard metric

---

## Best Practices

### Before Scanning
1. ✅ Get authorization from website owner
2. ✅ Review target's terms of service
3. ✅ Start with less intensive scans
4. ✅ Set appropriate scan intensity

### During Scanning
1. 👁️ Monitor real-time logs
2. ⏸️ Use pause if needed to reduce load
3. 📊 Watch progress on Dashboard
4. 🚨 Check for attack chain alerts

### After Scanning
1. 📄 Export PDF report for documentation
2. 🔍 Review all vulnerabilities in detail
3. 📋 Prioritize by severity and CVSS score
4. 🛠️ Follow remediation guides
5. 💾 Export JSON for backup

---

## Troubleshooting

### Tools Not Working
- **Windows**: Use WSL or install via Chocolatey
- **Linux/Mac**: Install using package manager
- Check tool installation: `nmap --version`, `nikto -Version`

### No Vulnerabilities Found
- Try different scan intensity
- Enable more professional tools
- Target may be well-secured (good news!)
- Check logs for errors

### Scan Stuck
- Check real-time logs for errors
- Use Stop button and restart
- Reduce scan intensity
- Check backend console for errors

### PDF Export Fails
- Ensure scan is completed
- Check backend logs for errors
- Verify `reportlab` is installed: `pip install reportlab`

---

## Security & Ethics

⚠️ **Important Reminders**:
- Only scan websites you own or have explicit permission to test
- Unauthorized scanning may be illegal
- Use responsibly and ethically
- Some tools (SQLMap, Nikto) can be invasive
- Consider target's infrastructure capacity

---

## Support & Resources

### External References
- **OWASP**: https://owasp.org/www-project-top-ten/
- **MITRE CWE**: https://cwe.mitre.org/
- **NIST NVD**: https://nvd.nist.gov/
- **ExploitDB**: https://www.exploit-db.com/

### Getting Help
- Check IMPLEMENTATION_SUMMARY.md for technical details
- Review backend console logs for errors
- Check browser console (F12) for frontend issues

---

## Feature Highlights Summary

✅ **8+ Vulnerability Types Detected**
✅ **Real-Time Monitoring & Logs**
✅ **Professional Tool Integration**
✅ **Detailed Vulnerability Analysis**
✅ **PDF Report Export**
✅ **Scan Pause/Resume Controls**
✅ **CVE/CWE/CVSS Integration**
✅ **Attack Chain Detection**
✅ **AI-Powered Insights**

Enjoy your professional vulnerability scanning experience! 🚀
