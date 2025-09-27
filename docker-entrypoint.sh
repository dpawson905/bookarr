#!/bin/sh

# Generate or load NextAuth secret
SECRET_FILE="/app/data/nextauth-secret"

if [ -z "$NEXTAUTH_SECRET" ]; then
    if [ -f "$SECRET_FILE" ]; then
        # Load existing secret from file
        export NEXTAUTH_SECRET=$(cat "$SECRET_FILE")
        echo "🔐 Loaded NEXTAUTH_SECRET from persistent storage"
    else
        # Generate new secret and save it
        export NEXTAUTH_SECRET=$(openssl rand -base64 32)
        echo "$NEXTAUTH_SECRET" > "$SECRET_FILE"
        chmod 600 "$SECRET_FILE"  # Secure file permissions
        echo "🔐 Generated new NEXTAUTH_SECRET and saved to persistent storage"
    fi
    echo "💡 To use a custom secret, set NEXTAUTH_SECRET environment variable"
else
    echo "🔐 Using NEXTAUTH_SECRET from environment variable"
fi

# Database path is hardcoded in schema - no configuration needed
echo "🗄️  Database: SQLite at /app/data/bookarr.db (hardcoded)"

# Database will be initialized by the application on first run
echo "📊 Database will be initialized by the application on first run"

if [ -z "$NEXTAUTH_URL" ]; then
    export NEXTAUTH_URL="http://localhost:2665"
    echo "🌐 Using default NEXTAUTH_URL: $NEXTAUTH_URL"
fi

echo "🚀 Starting Bookarr..."
echo "📚 Access the application at: $NEXTAUTH_URL"
echo "⚙️  Configure API keys in Settings > API Keys after first login"

# Execute the main command
exec "$@"
