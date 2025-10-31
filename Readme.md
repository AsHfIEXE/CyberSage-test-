# CyberSage 2.0 - Cybersecurity Vulnerability Scanner

A comprehensive cybersecurity vulnerability scanner with real-time scanning capabilities, built with React frontend and Flask backend.

## 🌟 Features

- **Real-time Vulnerability Scanning**: WebSocket-powered live updates
- **Professional Security Tools**: Nmap, vulnerability detection, form analysis
- **Interactive Dashboard**: Modern React UI with dark/light theme
- **Comprehensive Reporting**: Export results in JSON, PDF, CSV formats
- **AI-Powered Insights**: Intelligent vulnerability scoring and recommendations
- **Cross-Platform**: Docker support for easy deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.10+
- Docker (optional)

### Option 1: Docker Setup (Recommended)

```bash
# Clone and start with Docker
git clone <your-repo-url>
cd CyberSage-2.0-Production
docker-compose up --build

# Access the application at http://localhost:3000
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend/
pip install -r requirements.txt
python app.py
```

#### Frontend Setup

```bash
cd frontend/
npm install
npm run dev
```

## 📁 Project Structure

```
CyberSage-2.0-Production/
├── backend/                 # Flask + SocketIO backend
│   ├── app.py              # Main application
│   ├── core/               # Core functionality
│   ├── tools/              # Security scanning tools
│   ├── api/                # API endpoints
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── context/        # React Context
│   ├── public/             # Static files
│   ├── package.json        # Dependencies
│   └── tailwind.config.js  # Styling configuration
├── docker-compose.yml      # Docker configuration
├── setup.sh               # Linux/Mac setup script
└── setup.bat              # Windows setup script
```

## 🎯 Key Components

### Frontend (React 18)
- **Dashboard**: Real-time scan status and vulnerability overview
- **Scanner**: Configure and run security scans
- **Vulnerabilities**: Detailed vulnerability analysis and management
- **Chains**: Attack chain visualization and analysis
- **Tools**: Built-in security testing tools
- **Repeater**: HTTP request analysis and testing
- **History**: Scan history and report management
- **Statistics**: Performance metrics and analytics

### Backend (Flask + SocketIO)
- **WebSocket Server**: Real-time communication
- **Security Scanners**: Nmap, vulnerability detection, form analysis
- **Database**: SQLite with vulnerability tracking
- **AI Analyzer**: Intelligent vulnerability scoring
- **Export System**: Multiple format support (JSON, PDF, CSV)

## 🛠️ API Endpoints

### Scan Management
- `GET /api/scans` - Get all scans
- `POST /api/scan/start` - Start a new scan
- `GET /api/scan/{id}` - Get scan details
- `DELETE /api/scan/{id}` - Delete scan

### Vulnerability Management
- `GET /api/vulnerabilities` - Get vulnerabilities
- `GET /api/vulnerabilities/{id}` - Get vulnerability details
- `POST /api/vulnerabilities/export` - Export vulnerabilities

### Tool Integration
- `POST /api/tools/nmap` - Run Nmap scan
- `POST /api/tools/vulnerability-scan` - Run vulnerability scan
- `GET /api/tools/status` - Get tool status

## 🎨 UI Features

- **Theme System**: Dark/Light mode toggle
- **Responsive Design**: Mobile, tablet, desktop support
- **Real-time Updates**: WebSocket live data streaming
- **Interactive Charts**: Recharts-powered visualizations
- **Accessibility**: WCAG 2.1 AA compliant
- **Performance**: Optimized bundle size and loading

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///cybersage.db
```

### Frontend Configuration

Edit `frontend/.env` for API configuration:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WEBSOCKET_URL=ws://localhost:5000
```

## 📊 Usage Examples

### Starting a Vulnerability Scan

```javascript
// Frontend example
const response = await fetch('/api/scan/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target: 'https://example.com',
    scanType: 'full'
  })
});
```

### WebSocket Connection

```javascript
// Frontend WebSocket example
const socket = io('ws://localhost:5000');
socket.on('scan_update', (data) => {
  console.log('Scan update:', data);
});
```

## 🚀 Deployment

### Production Build

```bash
# Frontend production build
cd frontend/
npm run build

# Backend production
cd backend/
export FLASK_ENV=production
python app.py
```

### Docker Production

```bash
# Build and run production containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is intended for security testing and educational purposes only. Users are responsible for ensuring they have proper authorization before scanning any systems. The developers are not responsible for any misuse of this tool.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Check the documentation in the `docs/` folder
- Review the API documentation for endpoint details

---

**Built with ❤️ for the cybersecurity community**