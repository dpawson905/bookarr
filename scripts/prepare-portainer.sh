#!/bin/bash

# Bookarr Portainer Preparation Script
# This script builds the Docker image and prepares it for Portainer deployment

set -e

echo "🚀 Preparing Bookarr for Portainer deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "Dockerfile" ]; then
    print_error "Dockerfile not found. Please run this script from the Bookarr root directory."
    exit 1
fi

# Build the Docker image
print_status "Building Docker image..."
if docker build -t bookarr:latest .; then
    print_success "Docker image built successfully!"
else
    print_error "Failed to build Docker image."
    exit 1
fi

# Create output directory
mkdir -p dist

# Save the image
print_status "Saving Docker image..."
if docker save bookarr:latest | gzip > dist/bookarr.tar.gz; then
    print_success "Docker image saved to dist/bookarr.tar.gz"
else
    print_error "Failed to save Docker image."
    exit 1
fi

# Get image size
IMAGE_SIZE=$(du -h dist/bookarr.tar.gz | cut -f1)
print_status "Image size: $IMAGE_SIZE"

# Create Portainer stack file
print_status "Creating Portainer stack configuration..."
if cp portainer-stack.yml dist/; then
    print_success "Portainer stack configuration copied to dist/"
else
    print_warning "Could not copy portainer-stack.yml to dist/"
fi

# Create deployment instructions
cat > dist/DEPLOYMENT_INSTRUCTIONS.md << EOF
# Bookarr Portainer Deployment

## Files Included
- \`bookarr.tar.gz\` - Docker image for import into Portainer
- \`portainer-stack.yml\` - Stack configuration for Portainer
- \`DEPLOYMENT_INSTRUCTIONS.md\` - This file

## Deployment Steps

### 1. Import the Image
1. Open Portainer web interface
2. Go to "Images" in the left sidebar
3. Click "Import image"
4. Upload \`bookarr.tar.gz\`
5. Wait for import to complete

### 2. Create the Stack
1. Go to "Stacks" in the left sidebar
2. Click "Add stack"
3. Name: "bookarr"
4. Copy contents from \`portainer-stack.yml\`
5. Update environment variables as needed
6. Click "Deploy the stack"

### 3. Access the Application
1. Wait for containers to start
2. Navigate to \`http://your-server:2665\`
3. Complete first-time setup

## Environment Variables to Update

Before deploying, update these variables in the stack configuration:

- \`NEXTAUTH_URL\` - Your application URL
- \`NEXTAUTH_SECRET\` - A secure secret key
- \`GOOGLE_BOOKS_API_KEY\` - Your Google Books API key (optional)
- \`SABNZBD_API_KEY\` - Your SABnzbd API key (optional)
- \`NZBGEEK_API_KEY\` - Your NZBGeek API key (optional)

## Troubleshooting

- Check container logs in Portainer
- Verify all environment variables are set
- Ensure ports 2665 and 27017 are available
- Check health endpoint: \`http://your-server:2665/api/health\`

## Support

For issues and questions, check the main documentation or create an issue on GitHub.
EOF

print_success "Deployment instructions created in dist/DEPLOYMENT_INSTRUCTIONS.md"

# Summary
echo ""
echo "🎉 Preparation complete!"
echo ""
echo "📁 Files created in dist/:"
echo "   - bookarr.tar.gz ($IMAGE_SIZE)"
echo "   - portainer-stack.yml"
echo "   - DEPLOYMENT_INSTRUCTIONS.md"
echo ""
echo "📋 Next steps:"
echo "   1. Upload bookarr.tar.gz to Portainer"
echo "   2. Import the image"
echo "   3. Create stack using portainer-stack.yml"
echo "   4. Update environment variables"
echo "   5. Deploy the stack"
echo ""
echo "🌐 Access the application at: http://your-server:2665"
echo ""
print_success "Ready for Portainer deployment!"
