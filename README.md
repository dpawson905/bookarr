# Bookarr - Ebook & Audiobook Management

A modern replacement for Readarr, built with Next.js 15, featuring automated Usenet downloads and digital library management.

## 🚀 Quick Start

### Local Development
```bash
git clone <repository-url>
cd bookarr
npm install
npm run dev
```
Open [http://localhost:2665](http://localhost:2665)

### Docker Compose
```bash
git clone <repository-url>
cd bookarr
docker-compose up -d
```
Open [http://localhost:2665](http://localhost:2665)

### Portainer (GUI)
1. Build the image: `docker build -t bookarr:latest .`
2. Save the image: `docker save bookarr:latest | gzip > bookarr.tar.gz`
3. Import `bookarr.tar.gz` in Portainer
4. Create stack using `portainer-stack.yml`
5. Deploy and access at [http://localhost:2665](http://localhost:2665)

## ✨ Features

- **First-Run Setup**: Automatic admin account creation
- **Username Authentication**: Simple, secure login
- **API Key Management**: Configure Google Books, Open Library APIs
- **Download Integration**: SABnzbd, NZBGet support
- **Library Management**: Organize books, authors, series
- **Docker Ready**: Complete containerization support
- **Portainer Compatible**: GUI-based deployment

**Note:** Bookarr runs on port 2665 (spells "BOOK" on a keypad) to avoid conflicts with other common development ports.

## 📋 Prerequisites

- Node.js 18+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- Portainer (for GUI-based deployment)
- MongoDB (local, cloud, or containerized)
- Optional: SABnzbd or NZBGet for downloads
- Optional: NZB indexers (NZBGeek, NZBHydra2, etc.)

## 🛠️ Deployment Methods

### Method 1: Local Development

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd bookarr
   npm install
   ```

2. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Navigate to `http://localhost:2665`

**Note:** No .env file needed! The app uses sensible defaults and can be configured through the web interface.

### Method 2: Docker Compose

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd bookarr
   ```

2. **Start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   Navigate to `http://localhost:2665`

### Method 3: Portainer (GUI Deployment)

Portainer provides a web-based GUI for managing Docker containers.

#### Prerequisites
- Portainer installed and running
- Access to Portainer web interface
- Docker host with internet access

#### Step 1: Create a Stack

1. **Login to Portainer**
   - Open your Portainer web interface
   - Login with your credentials

2. **Create a new stack**
   - Go to "Stacks" in the left sidebar
   - Click "Add stack"
   - Name it "bookarr"

#### Step 2: Add Stack Configuration

Copy and paste the following docker-compose configuration:

```yaml
version: '3.8'

services:
  bookarr:
    image: bookarr:latest
    container_name: bookarr
    ports:
      - "2665:2665"
    environment:
      # Database
      - DATABASE_URL=mongodb://mongodb:27017/bookarr
      
      # User/Group IDs (LinuxServer.io standard)
      - PUID=1000
      - PGID=1000
      - TZ=UTC
      
      # NextAuth (NEXTAUTH_SECRET auto-generated if not provided)
      - NEXTAUTH_URL=http://localhost:2665
      
      # API Keys are configured in the app settings, not as environment variables
      
      # Download clients and indexers are configured in the app settings
      
      # File Management
      - BOOKS_LIBRARY_PATH=/app/data/books
      - DOWNLOADS_PATH=/app/data/downloads
      - TEMP_PATH=/tmp/bookarr
      
      # Application Settings
      - DEFAULT_LANGUAGE=en
      - DEFAULT_TIMEZONE=UTC
      
      # Features
      - ENABLE_API_KEYS=true
      - ENABLE_DOWNLOADS=true
    volumes:
      - bookarr_data:/app/data
      - bookarr_temp:/tmp/bookarr
    depends_on:
      - mongodb
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:2665/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  mongodb:
    image: mongo:7
    container_name: bookarr-mongodb
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=bookarr
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

volumes:
  bookarr_data:
  bookarr_temp:
  mongodb_data:
```

#### Step 3: Build the Image

Since we need to build the image first, you have two options:

**Option A: Build from Git Repository**
1. **Add build configuration** to the stack:
   ```yaml
   bookarr:
     build:
       context: https://github.com/your-username/bookarr.git
       dockerfile: Dockerfile
     # ... rest of configuration
   ```

**Option B: Pre-built Image (Recommended)**
1. **Build the image locally first:**
   ```bash
   git clone <repository-url>
   cd bookarr
   docker build -t bookarr:latest .
   docker save bookarr:latest | gzip > bookarr.tar.gz
   ```

2. **Import the image in Portainer:**
   - Go to "Images" in Portainer
   - Click "Import image"
   - Upload the `bookarr.tar.gz` file

#### Step 4: Deploy the Stack

1. **Deploy the stack**
   - Click "Deploy the stack"
   - Wait for containers to start

2. **Access the application**
   - Navigate to `http://your-server:2665`
   - Complete the first-time setup

## 🔧 First-Time Setup

Regardless of deployment method, the first time you access Bookarr:

1. **Visit the application** → You'll be redirected to the setup page
2. **Create admin account** → Enter username, name, and password
3. **Configure settings** → Set up API keys, download clients, and preferences
4. **Start using Bookarr** → Begin managing your digital library

## ⚙️ Environment Variables

### Required (Production)
| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/bookarr?replicaSet=rs0&authSource=admin` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:2665` |
| `NEXTAUTH_SECRET` | NextAuth secret key | **Auto-generated** (secure random) |

### System (LinuxServer.io Standard)
| Variable | Description | Default |
|----------|-------------|---------|
| `PUID` | User ID for file permissions | `1000` |
| `PGID` | Group ID for file permissions | `1000` |
| `TZ` | Timezone | `UTC` |

### Optional (Can be set in app settings)
| Variable | Description | Default |
|----------|-------------|---------|
| **API Keys** | Google Books, Open Library | **Configured in app settings** |
| **Download Clients** | SABnzbd, NZBGet | **Configured in app settings** |
| **NZB Indexers** | NZBGeek, NZBHydra | **Configured in app settings** |

## 🏗️ Architecture

### Core Infrastructure
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS
- **UI**: shadcn/ui component library, Lucide React icons
- **State**: Zustand for client state, TanStack Query for server state
- **Backend**: Prisma ORM with MongoDB
- **Validation**: Zod schemas, React Hook Form
- **APIs**: Axios, Google Books API integration

### Database Schema
- **User management** with preferences and roles
- **Book metadata** and file tracking
- **Author and series** relationships
- **Download queue** and history
- **Download client** configurations
- **NZB indexer** settings
- **Quality profiles** and import lists

### Project Structure
```
app/
├── (dashboard)/          # Dashboard layout group
│   ├── books/           # Book management
│   ├── authors/         # Author pages
│   ├── downloads/       # Download queue
│   └── settings/        # Configuration
├── api/                 # API routes
│   ├── books/          # Book CRUD
│   └── search/         # Search endpoints
components/              # Reusable components
├── ui/                 # shadcn/ui components
lib/                    # Utilities and configs
├── apis/               # External API clients
├── validations/        # Zod schemas
stores/                 # Zustand stores
types/                  # TypeScript definitions
```

## 🔧 Configuration

### Download Clients
1. Install SABnzbd or NZBGet
2. Configure API access in settings
3. Set up download categories
4. Test connection

### NZB Indexers
1. Sign up for NZBGeek or similar
2. Get API key
3. Configure in settings
4. Test search functionality

### File Organization
1. Set library path in settings
2. Configure naming schemes
3. Enable auto-organization
4. Set up duplicate detection

## 🐳 Docker Management

### Portainer Features
- **Easy Updates**: Update the stack configuration and redeploy
- **Logs**: View container logs directly in Portainer
- **Monitoring**: Monitor resource usage and health
- **Backups**: Easy volume backup and restore
- **Scaling**: Scale services if needed

### Troubleshooting in Portainer

1. **Check container status**
   - Go to "Containers" → Find "bookarr"
   - Check if it's running

2. **View logs**
   - Click on "bookarr" container
   - Go to "Logs" tab
   - Look for error messages

3. **Check health**
   - Go to "Containers" → "bookarr"
   - Check the health status
   - Visit `http://your-server:2665/api/health`

4. **Restart services**
   - Go to "Stacks" → "bookarr"
   - Click "Editor" → "Update the stack"

## 🚨 Troubleshooting

### Common Issues
1. **Database connection**: Ensure MongoDB is running
2. **API keys**: Check environment variables
3. **File paths**: Verify directory permissions
4. **Download clients**: Test API connectivity

### Getting Help
- Check the console for errors
- Verify environment variables
- Test API connections in settings
- Check file permissions

## 📝 Development

### Key Dependencies
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI**: shadcn/ui, Lucide React icons
- **State**: Zustand, TanStack Query
- **Backend**: Prisma, MongoDB
- **Validation**: Zod, React Hook Form
- **APIs**: Axios, Google Books API

### Available Scripts
- `npm run dev` - Start development server on port 2665
- `npm run build` - Build for production
- `npm run start` - Start production server on port 2665
- `npm run lint` - Run ESLint

## 📄 License

This project is for personal use. Please respect copyright laws and terms of service for all APIs and services used.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the console for errors
2. Verify environment variables
3. Test API connections in settings
4. Check file permissions
5. Review the troubleshooting section above