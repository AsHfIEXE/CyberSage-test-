#!/bin/bash

echo "=========================================="
echo "🛡️  CyberSage v2.0 Elite Setup Script"
echo "=========================================="
echo ""
echo "This script will install:"
echo "  • Python dependencies"
echo "  • Node.js dependencies"
echo "  • Professional security tools"
echo "  • Wordlists for fuzzing"
echo ""

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo "✅ Detected: Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
    echo "✅ Detected: macOS"
else
    echo "⚠️  Warning: Unknown OS. Continuing anyway..."
    OS="unknown"
fi

echo ""

# Check for sudo privileges
if [ "$OS" == "linux" ]; then
    echo "🔐 Checking sudo privileges..."
    if sudo -n true 2>/dev/null; then
        echo "✅ Sudo access confirmed"
    else
        echo "⚠️  Sudo access required for installing professional tools"
        echo "   You may be prompted for your password"
    fi
    echo ""
fi

# Check if Python3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python3 found: $(python3 --version)"

# Check if pip3 is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

echo "✅ pip3 found"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14 or higher."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Professional Tools Installation (Linux only)
if [ "$OS" == "linux" ]; then
    echo ""
    echo "==========================================="
    echo "🛠️  Installing Professional Security Tools"
    echo "==========================================="
    echo ""
    
    # Detect package manager
    if command -v apt &> /dev/null; then
        PKG_MANAGER="apt"
        echo "📦 Using package manager: apt"
    elif command -v yum &> /dev/null; then
        PKG_MANAGER="yum"
        echo "📦 Using package manager: yum"
    elif command -v pacman &> /dev/null; then
        PKG_MANAGER="pacman"
        echo "📦 Using package manager: pacman"
    else
        echo "⚠️  No supported package manager found"
        echo "   Please install tools manually:"
        echo "   - nmap, nikto, sqlmap, gobuster, dirb, wordlists"
        PKG_MANAGER="none"
    fi
    
    if [ "$PKG_MANAGER" == "apt" ]; then
        echo ""
        echo "📥 Updating package lists..."
        sudo apt update -qq
        
        echo "📥 Installing professional security tools..."
        TOOLS="nmap nikto sqlmap gobuster dirb wordlists curl git"
        
        for tool in $TOOLS; do
            if command -v $(echo $tool | cut -d' ' -f1) &> /dev/null; then
                echo "  ✅ $tool (already installed)"
            else
                echo "  📦 Installing $tool..."
                sudo apt install -y $tool -qq > /dev/null 2>&1
                if [ $? -eq 0 ]; then
                    echo "  ✅ $tool installed"
                else
                    echo "  ⚠️  Failed to install $tool (optional)"
                fi
            fi
        done
        
        # Check for optional tools
        echo ""
        echo "📥 Checking optional tools..."
        
        # Ffuf (may need Go)
        if command -v ffuf &> /dev/null; then
            echo "  ✅ ffuf (already installed)"
        else
            echo "  ⚠️  ffuf not found (optional - requires Go)"
            echo "     Install: go install github.com/ffuf/ffuf@latest"
        fi
        
        # Nuclei
        if command -v nuclei &> /dev/null; then
            echo "  ✅ nuclei (already installed)"
        else
            echo "  ⚠️  nuclei not found (optional)"
            echo "     Install: go install github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest"
        fi
        
        # WPScan
        if command -v wpscan &> /dev/null; then
            echo "  ✅ wpscan (already installed)"
        else
            echo "  ⚠️  wpscan not found (optional)"
            echo "     Install: gem install wpscan"
        fi
        
        # theHarvester
        if command -v theHarvester &> /dev/null || [ -f "/usr/bin/theHarvester" ]; then
            echo "  ✅ theHarvester (already installed)"
        else
            echo "  ⚠️  theHarvester not found (optional)"
            echo "     Install: sudo apt install theharvester"
        fi
        
        # Amass
        if command -v amass &> /dev/null; then
            echo "  ✅ amass (already installed)"
        else
            echo "  ⚠️  amass not found (optional)"
            echo "     Install: go install github.com/OWASP/Amass/v3/...@master"
        fi
        
    elif [ "$PKG_MANAGER" != "none" ]; then
        echo "⚠️  Auto-installation only supports apt package manager"
        echo "   Please install these tools manually:"
        echo "   - nmap, nikto, sqlmap, gobuster, dirb, wordlists"
    fi
    
    echo ""
    echo "📊 Installed Tools Summary:"
    for tool in nmap nikto sqlmap gobuster ffuf nuclei; do
        if command -v $tool &> /dev/null; then
            echo "  ✅ $tool - $(which $tool)"
        else
            echo "  ❌ $tool - not found"
        fi
    done
    
elif [ "$OS" == "mac" ]; then
    echo ""
    echo "==========================================="
    echo "🛠️  macOS Tool Installation"
    echo "==========================================="
    echo ""
    echo "⚠️  Please install Homebrew and run:"
    echo "   brew install nmap nikto sqlmap gobuster"
    echo ""
fi

echo ""
echo "==========================================="
echo "📦 Setting Up CyberSage Application"
echo "==========================================="

# Backend Setup
echo ""
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create virtual environment"
        exit 1
    fi
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment and install dependencies
echo "Installing Python dependencies..."
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install requirements
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    deactivate
    exit 1
fi

echo "✅ Python dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
SECRET_KEY=cybersage_v2_secret_$(date +%s)
OPENROUTER_API_KEY=
FLASK_ENV=development
FLASK_DEBUG=False
DATABASE_PATH=cybersage_v2.db
EOF
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

# Initialize database
echo "Initializing database..."
python -c "from core.database import Database; db = Database(); print('[Database] Initialized successfully')"

deactivate
cd ..

# Frontend Setup
echo ""
echo "📦 Setting up frontend..."
cd frontend

# Install Node dependencies
echo "Installing Node.js dependencies (this may take a few minutes)..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Node dependencies"
    exit 1
fi

echo "✅ Node.js dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cat > .env << EOF
REACT_APP_BACKEND_URL=http://localhost:5000
EOF
    echo "✅ Frontend .env file created"
else
    echo "✅ Frontend .env file already exists"
fi

cd ..

# Create start script if it doesn't exist
echo ""
echo "📝 Setting up start script..."

if [ ! -f "start.sh" ]; then
    cat > start.sh << 'STARTSCRIPT'
#!/bin/bash

echo "============================================"
echo "🧠 CyberSage v2.0 - Starting Application"
echo "============================================"
echo ""

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "   Please run: ./setup.sh first"
    exit 1
fi

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "============================================"
    echo "🛑 Stopping CyberSage v2.0..."
    echo "============================================"
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ Shutdown complete"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Start Backend
echo "🔧 Starting Backend..."
cd backend

# Activate virtual environment
source venv/bin/activate

# Start backend in background
python app.py > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "✅ Backend started (PID: $BACKEND_PID)"
echo "   Logs: backend.log"
echo "   URL:  http://localhost:5000"

# Wait for backend to be ready
echo ""
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Check if backend is responding
for i in {1..10}; do
    if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
        echo "✅ Backend is ready!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Backend failed to start. Check backend.log for errors."
        echo ""
        echo "Showing last 20 lines of backend.log:"
        tail -n 20 backend.log
        cleanup
        exit 1
    fi
    sleep 2
done

# Start Frontend
echo ""
echo "🎨 Starting Frontend..."
cd frontend

# Start frontend in background
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo "   Logs: frontend.log"
echo "   URL:  http://localhost:3000 (will open automatically)"

echo ""
echo "============================================"
echo "✅ CyberSage v2.0 is now running!"
echo "============================================"
echo ""
echo "📊 Backend:  http://localhost:5000"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "📝 View Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "Press Ctrl+C to stop all services"
echo "============================================"
echo ""

# Wait for processes
wait
STARTSCRIPT

    chmod +x start.sh
    echo "✅ Created start.sh"
else
    echo "✅ start.sh already exists"
fi

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📁 Project Structure:"
echo "   backend/venv/          - Python virtual environment"
echo "   backend/.env           - Backend configuration (add OpenRouter API key here)"
echo "   frontend/.env          - Frontend configuration"
echo "   frontend/node_modules/ - Node.js dependencies"
echo ""
echo "🛠️  Professional Tools Status:"
if [ "$OS" == "linux" ]; then
    CORE_TOOLS="nmap nikto sqlmap gobuster"
    INSTALLED_COUNT=0
    TOTAL_COUNT=0
    for tool in $CORE_TOOLS; do
        TOTAL_COUNT=$((TOTAL_COUNT + 1))
        if command -v $tool &> /dev/null; then
            INSTALLED_COUNT=$((INSTALLED_COUNT + 1))
        fi
    done
    echo "   Core Tools: $INSTALLED_COUNT/$TOTAL_COUNT installed"
    if [ $INSTALLED_COUNT -lt $TOTAL_COUNT ]; then
        echo "   ⚠️  Some tools missing - scans will work but with reduced capabilities"
    fi
else
    echo "   Please install tools manually for your OS"
fi
echo ""
echo "🚀 To Start CyberSage v2.0:"
echo "   ./start.sh"
echo ""
echo "📖 Quick Start Guide:"
echo "   1. Run: ./start.sh"
echo "   2. Open: http://localhost:3000"
echo "   3. Navigate to Scanner tab (🎯)"
echo "   4. Enter target: http://testphp.vulnweb.com"
echo "   5. Select 'Elite' mode for all tools"
echo "   6. Click 'Start Security Scan'"
echo "   7. Watch real-time results in Dashboard (📊)"
echo ""
echo "⚙️  Configuration:"
echo "   • For AI features: Add OpenRouter API key to backend/.env"
echo "   • Get free key at: https://openrouter.ai"
echo ""
echo "🔧 Troubleshooting:"
echo "   • Backend fails:    tail -f backend.log"
echo "   • Frontend fails:   tail -f frontend.log"
echo "   • Port conflicts:   kill -9 \$(lsof -t -i:5000) # or :3000"
echo "   • Tools not found:  Run this script again or install manually"
echo ""
echo "📚 Documentation:"
echo "   • README.md         - Full documentation"
echo "   • Professional tools will run automatically in Elite mode"
echo ""
echo "=========================================="