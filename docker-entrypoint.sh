#!/bin/sh

# Generate NextAuth secret if not provided
if [ -z "$NEXTAUTH_SECRET" ]; then
    export NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "🔐 Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
    echo "💡 To use a custom secret, set NEXTAUTH_SECRET environment variable"
fi

# Database path is hardcoded in schema - no configuration needed
echo "🗄️  Database: SQLite at /app/data/bookarr.db (hardcoded)"

if [ -z "$NEXTAUTH_URL" ]; then
    export NEXTAUTH_URL="http://localhost:2665"
    echo "🌐 Using default NEXTAUTH_URL: $NEXTAUTH_URL"
fi

echo "🚀 Starting Bookarr..."
echo "📚 Access the application at: $NEXTAUTH_URL"
echo "⚙️  Configure API keys in Settings > API Keys after first login"

# Execute the main command
exec "$@"
