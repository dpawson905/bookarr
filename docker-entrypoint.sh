#!/bin/sh

# Fix permissions for mounted volumes
chown -R nextjs:nodejs /config /books /downloads 2>/dev/null || true
chmod -R 755 /config /books /downloads 2>/dev/null || true

# Generate or load NextAuth secret
SECRET_FILE="/config/nextauth-secret"

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

# Database path is configured via DATABASE_URL environment variable
echo "🗄️  Database: SQLite at /config/bookarr.db"

# Initialize database if it doesn't exist or is empty
if [ ! -f "/config/bookarr.db" ] || [ ! -s "/config/bookarr.db" ]; then
    echo "📊 Initializing database with schema..."
    # Create a simple SQL script to initialize the database
    cat > /tmp/init_db.sql << 'EOF'
-- Enable foreign keys
PRAGMA foreign_keys=ON;

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL UNIQUE,
    "email" TEXT UNIQUE,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create UserPreferences table
CREATE TABLE IF NOT EXISTS "UserPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'system',
    "language" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "defaultFormat" TEXT NOT NULL DEFAULT 'epub',
    "autoDownload" BOOLEAN NOT NULL DEFAULT false,
    "defaultCategory" TEXT NOT NULL DEFAULT 'books',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "downloadComplete" BOOLEAN NOT NULL DEFAULT true,
    "newBookAvailable" BOOLEAN NOT NULL DEFAULT false,
    "readingGoal" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Author table
CREATE TABLE IF NOT EXISTS "Author" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "biography" TEXT,
    "birthDate" DATETIME,
    "deathDate" DATETIME,
    "nationality" TEXT,
    "website" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Series table
CREATE TABLE IF NOT EXISTS "Series" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "totalBooks" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Book table
CREATE TABLE IF NOT EXISTS "Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "isbn" TEXT,
    "publishedDate" DATETIME,
    "pageCount" INTEGER,
    "language" TEXT NOT NULL DEFAULT 'en',
    "publisher" TEXT,
    "imageUrl" TEXT,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "format" TEXT NOT NULL DEFAULT 'epub',
    "status" TEXT NOT NULL DEFAULT 'WANTED',
    "rating" INTEGER,
    "notes" TEXT,
    "seriesId" TEXT,
    "seriesOrder" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create BookAuthor table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS "BookAuthor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Download table
CREATE TABLE IF NOT EXISTS "Download" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "downloadUrl" TEXT,
    "filePath" TEXT,
    "fileSize" INTEGER,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "Book_title_idx" ON "Book"("title");
CREATE INDEX IF NOT EXISTS "Book_isbn_idx" ON "Book"("isbn");
CREATE INDEX IF NOT EXISTS "Book_status_idx" ON "Book"("status");
CREATE INDEX IF NOT EXISTS "Author_name_idx" ON "Author"("name");
CREATE INDEX IF NOT EXISTS "Series_name_idx" ON "Series"("name");
CREATE INDEX IF NOT EXISTS "Download_status_idx" ON "Download"("status");
CREATE INDEX IF NOT EXISTS "BookAuthor_bookId_idx" ON "BookAuthor"("bookId");
CREATE INDEX IF NOT EXISTS "BookAuthor_authorId_idx" ON "BookAuthor"("authorId");
EOF

    # Execute the SQL script
    sqlite3 /config/bookarr.db < /tmp/init_db.sql
    echo "✅ Database initialized successfully"
else
    echo "📊 Database already exists"
fi

if [ -z "$NEXTAUTH_URL" ]; then
    export NEXTAUTH_URL="http://localhost:2665"
    echo "🌐 Using default NEXTAUTH_URL: $NEXTAUTH_URL"
fi

echo "🚀 Starting Bookarr..."
echo "📚 Access the application at: $NEXTAUTH_URL"
echo "⚙️  Configure API keys in Settings > API Keys after first login"

# Switch to nextjs user and execute the main command
exec su-exec nextjs "$@"
