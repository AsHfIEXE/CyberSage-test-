# Setup Script & README Improvements

## ✅ What Was Updated

### 1. Enhanced setup.sh Script

**New Features Added**:
- ✅ **Automatic OS Detection** - Detects Linux vs macOS
- ✅ **Professional Tools Installation** - Auto-installs nmap, nikto, sqlmap, gobuster, dirb, wordlists
- ✅ **Sudo Privilege Check** - Verifies sudo access before installation
- ✅ **Package Manager Detection** - Supports apt, yum, pacman
- ✅ **Optional Tools Check** - Checks for ffuf, nuclei, wpscan, theHarvester, amass
- ✅ **Installation Summary** - Shows which tools are installed
- ✅ **Tool Status Report** - Displays installed vs missing tools
- ✅ **Better Error Messages** - Clear guidance when things go wrong
- ✅ **Improved Final Output** - Complete quick start guide

### 2. Updated README.md

**Installation Section**:
- ✅ Added **Automated Linux Installation** (recommended)
- ✅ Kept **Manual Installation** option
- ✅ Shows what setup.sh does automatically
- ✅ Clear step-by-step instructions

**Troubleshooting Section**:
- ✅ **Professional Tools Not Running** - How to check and fix
- ✅ **Backend Connection Issues** - Port conflicts, logs
- ✅ **Frontend Won't Start** - Cache clearing, reinstall
- ✅ **No Vulnerabilities Detected** - Common causes and fixes
- ✅ **Permission Issues** - Nmap capabilities, sudo
- ✅ **Wordlist Not Found** - Installation and fallback

---

## 🚀 How to Use

### Simple 3-Step Setup

```bash
# 1. Clone
git clone https://github.com/AsHfIEXE/CyberSage-2.0.git
cd CyberSage-2.0

# 2. Setup (installs everything)
chmod +x setup.sh
./setup.sh

# 3. Start
./start.sh
```

### What setup.sh Does

**Phase 1: System Check**
```
✅ Detected: Linux
✅ Python3 found: Python 3.10.12
✅ pip3 found
✅ Node.js found: v18.19.0
✅ npm found: 9.2.0
```

**Phase 2: Professional Tools Installation**
```
🛠️  Installing Professional Security Tools
📦 Using package manager: apt
📥 Updating package lists...
📥 Installing professional security tools...
  ✅ nmap installed
  ✅ nikto installed
  ✅ sqlmap installed
  ✅ gobuster installed
  ✅ dirb installed
  ✅ wordlists installed
  
📥 Checking optional tools...
  ✅ ffuf (already installed)
  ⚠️  nuclei not found (optional)
  ⚠️  wpscan not found (optional)
  
📊 Installed Tools Summary:
  ✅ nmap - /usr/bin/nmap
  ✅ nikto - /usr/bin/nikto
  ✅ sqlmap - /usr/bin/sqlmap
  ✅ gobuster - /usr/bin/gobuster
```

**Phase 3: Python & Node Setup**
```
📦 Setting Up CyberSage Application
📦 Setting up backend...
Creating virtual environment...
Installing Python dependencies...
✅ Python dependencies installed
Creating .env file...
✅ .env file created
Initializing database...
✅ Database initialized

📦 Setting up frontend...
Installing Node.js dependencies...
✅ Node.js dependencies installed
✅ Frontend .env file created
```

**Phase 4: Complete**
```
✅ Setup Complete!

📁 Project Structure:
   backend/venv/          - Python virtual environment
   backend/.env           - Backend configuration
   frontend/.env          - Frontend configuration
   frontend/node_modules/ - Node.js dependencies

🛠️  Professional Tools Status:
   Core Tools: 4/4 installed

🚀 To Start CyberSage v2.0:
   ./start.sh

📖 Quick Start Guide:
   1. Run: ./start.sh
   2. Open: http://localhost:3000
   3. Navigate to Scanner tab (🎯)
   4. Enter target: http://testphp.vulnweb.com
   5. Select 'Elite' mode for all tools
   6. Click 'Start Security Scan'
   7. Watch real-time results in Dashboard (📊)
```

---

## 📋 Tools Installed by setup.sh

### Core Tools (Required)
- **nmap** - Network discovery and security auditing
- **nikto** - Web server scanner
- **sqlmap** - Automatic SQL injection detection and exploitation
- **gobuster** - Directory/DNS brute-forcing
- **dirb** - Web content scanner
- **wordlists** - Common wordlists for fuzzing

### Optional Tools (Enhanced Features)
- **ffuf** - Fast web fuzzer (requires Go)
- **nuclei** - Template-based vulnerability scanner (requires Go)
- **wpscan** - WordPress security scanner (requires Ruby)
- **theHarvester** - OSINT gathering tool
- **amass** - In-depth attack surface mapping (requires Go)

### Installation Commands

**If setup.sh doesn't install a tool**, install manually:

```bash
# Core tools
sudo apt install nmap nikto sqlmap gobuster dirb wordlists

# Optional - Ffuf
go install github.com/ffuf/ffuf@latest

# Optional - Nuclei
go install github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest

# Optional - WPScan
gem install wpscan

# Optional - theHarvester
sudo apt install theharvester

# Optional - Amass
go install github.com/OWASP/Amass/v3/...@master
```

---

## 🔧 Troubleshooting Guide

### Setup Script Issues

**"sudo: command not found"**
```bash
# Install sudo (as root)
apt install sudo

# Add your user to sudo group
usermod -aG sudo yourusername
```

**"Package manager not found"**
```bash
# The script supports apt, yum, pacman
# For other systems, install tools manually
```

**"Failed to install Python dependencies"**
```bash
# Ensure pip is updated
pip3 install --upgrade pip

# Try installing manually
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

**"Node dependencies failed"**
```bash
# Clear npm cache
npm cache clean --force

# Update npm
npm install -g npm@latest

# Try again
cd frontend
npm install
```

### Runtime Issues

**Tools not detected during scan**
```bash
# Check if tools are in PATH
which nmap nikto sqlmap

# Verify backend can find them
cd backend
source venv/bin/activate
python -c "import subprocess; print(subprocess.run(['which', 'nmap'], capture_output=True).stdout)"
```

**"Permission denied" for nmap**
```bash
# Option 1: Give nmap capabilities (recommended)
sudo setcap cap_net_raw,cap_net_admin,cap_net_bind_service+eip $(which nmap)

# Option 2: Run backend as sudo (not recommended)
sudo venv/bin/python app.py
```

**Wordlists not found**
```bash
# Install wordlists package
sudo apt install wordlists seclists

# Verify installation
ls /usr/share/wordlists/
ls /usr/share/seclists/

# If still not found, CyberSage creates fallback wordlist automatically
```

---

## 📊 Comparison: Before vs After

| Feature | Before | After |
|---------|--------|-------|
| **Setup Method** | Manual only | Automated + Manual |
| **Tool Installation** | Manual | Automatic (Linux) |
| **Wordlists** | Manual | Auto-installed |
| **Error Handling** | Basic | Comprehensive |
| **OS Detection** | None | Linux/macOS/Unknown |
| **Tool Verification** | None | Yes, with summary |
| **Status Report** | None | Shows installed/missing |
| **Quick Start Guide** | README only | In setup output |
| **Troubleshooting** | Limited | Extensive |

---

## 💡 Best Practices

### First-Time Setup
1. ✅ Run `./setup.sh` once to install everything
2. ✅ Review the tool status report
3. ✅ Install any missing optional tools if needed
4. ✅ Add OpenRouter API key to `backend/.env` (optional)
5. ✅ Run `./start.sh` to launch

### Regular Use
1. ✅ Just run `./start.sh` each time
2. ✅ Monitor logs if issues occur
3. ✅ Re-run `./setup.sh` if you add new dependencies

### Updating
1. ✅ Pull latest changes: `git pull`
2. ✅ Re-run setup: `./setup.sh`
3. ✅ Restart: `./start.sh`

---

## 🎯 What's Included

### Backend Setup
- ✅ Python virtual environment
- ✅ All Python dependencies from requirements.txt
- ✅ `.env` configuration file
- ✅ Database initialization
- ✅ Professional tools verification

### Frontend Setup
- ✅ All Node.js dependencies
- ✅ `.env` configuration file
- ✅ Build configuration

### Scripts Created
- ✅ `start.sh` - Start both backend and frontend
- ✅ Automatic process management
- ✅ Log file generation
- ✅ Health checks

---

## Summary

The updated `setup.sh` now provides:

✅ **One-Command Setup** - Everything installed with `./setup.sh`
✅ **Professional Tools** - Auto-installs nmap, nikto, sqlmap, gobuster, dirb, wordlists
✅ **Smart Detection** - Detects OS and package manager
✅ **Clear Feedback** - Shows what's installed and what's missing
✅ **Error Handling** - Graceful failures with helpful messages
✅ **Complete Guide** - Final output includes quick start instructions

**Just run `./setup.sh` and you're ready to go!** 🚀

The README now includes:

✅ **Automated Installation** - Highlighted as recommended method
✅ **Manual Option** - Still available for advanced users
✅ **Comprehensive Troubleshooting** - Solutions for common issues
✅ **Clear Instructions** - Step-by-step for every scenario

**Perfect for GitHub users who want to get started quickly!** ⭐
