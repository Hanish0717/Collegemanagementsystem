#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

VPS_IP="145.223.18.5"
VPS_USER="root"
DOMAIN="cms1.thehps.in"
APP_DIR="/var/www/college-management"
BACKEND_PORT="5051"
FRONTEND_PORT="5050"

echo "============================================="
echo "🚀 Preparing deployment package..."
echo "============================================="

# Create a temporary archive of the project, excluding large/unnecessary directories
ARCHIVE_NAME="college_management_deploy.tar.gz"
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='client/node_modules' \
    --exclude='server/node_modules' \
    --exclude='client/.output' \
    --exclude='client/dist' \
    -czf $ARCHIVE_NAME client server docker-compose.yml 2>/dev/null || \
tar -czf $ARCHIVE_NAME client server docker-compose.yml

echo "✅ Package created: $ARCHIVE_NAME"

echo "============================================="
echo "📤 Uploading package to VPS ($VPS_IP)..."
echo "============================================="
scp $ARCHIVE_NAME $VPS_USER@$VPS_IP:/tmp/

echo "============================================="
echo "🛠️ Running setup and deployment on VPS..."
echo "============================================="

ssh $VPS_USER@$VPS_IP DOMAIN="$DOMAIN" ARCHIVE_NAME="$ARCHIVE_NAME" APP_DIR="$APP_DIR" BACKEND_PORT="$BACKEND_PORT" FRONTEND_PORT="$FRONTEND_PORT" 'bash -s' << 'EOF_SSH'
set -e

echo "Installing system prerequisites (Node.js, Nginx, Certbot)..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

if ! command -v certbot &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi

echo "Creating application directory..."
mkdir -p "$APP_DIR"
tar -xzf /tmp/"$ARCHIVE_NAME" -C "$APP_DIR" --strip-components=0
rm -f /tmp/"$ARCHIVE_NAME"

cd "$APP_DIR"

echo "Starting Docker PostgreSQL database..."
docker compose up -d db || docker-compose up -d db

echo "Setting up Server environment..."
cat << EOF_ENV > server/.env
# Server configuration
PORT=$BACKEND_PORT
NODE_ENV=production

# JWT configuration
JWT_SECRET=super_secret_jwt_key_12345_college_management
JWT_EXPIRE=7d

# Frontend application URL
FRONTEND_URL=https://cms1.thehps.in

# Email SMTP configuration (Nodemailer)
EMAIL_USER=23341a05d0@gmail.com
EMAIL_PASS=your_gmail_app_password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false

# API Keys
FAST2SMS_API_KEY=your_fast2sms_api_key
TEXTBELT_API_KEY=your_textbelt_api_key

# Google OAuth Credentials
GOOGLE_CLIENT_ID=58869313314-5rpg0hrsgt2f9sf8ugckrad38hr98d35.apps.googleusercontent.com

DATABASE_URL=postgresql://postgres:postgres@localhost:5435/college_management
DATABASE_SSL=false
FORCE_MOCK_MODE=false

# Gemini API Key configuration
GEMINI_API_KEY=your_gemini_api_key
EOF_ENV

echo "Installing server dependencies..."
cd server
npm install --production=false
cd ..

echo "Installing client dependencies and building client..."
cd client
npm install
npm run build
cd ..

echo "Setting permissions..."
chmod -R 755 "$APP_DIR"

echo "Starting backend server and frontend client under PM2..."
# Stop existing PM2 process if it exists
pm2 delete college-backend || true
pm2 delete college-frontend || true

# Force kill any stale processes holding frontend/backend ports
fuser -k $BACKEND_PORT/tcp || true
fuser -k $FRONTEND_PORT/tcp || true
sleep 1

# Start Backend (Port 5051)
cd server
pm2 start src/server.js --name "college-backend" --cwd "$APP_DIR/server" --env PORT=$BACKEND_PORT
cd ..

# Start Frontend (Vite SPA mode on Port 5050 - matches localhost dev execution)
cd client
pm2 start "npx vite --host 0.0.0.0 --port $FRONTEND_PORT" --name "college-frontend" --cwd "$APP_DIR/client"
cd ..

pm2 save

echo "Configuring Nginx..."
cat << 'EOF_NGINX' > /etc/nginx/sites-available/college-management
server {
    listen 80;
    server_name cms1.thehps.in;

    client_max_body_size 50M;

    # Backend API proxy
    location /api {
        proxy_pass http://127.0.0.1:5051;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend TanStack Start application proxy
    location / {
        proxy_pass http://127.0.0.1:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF_NGINX

# Enable Nginx configuration
ln -sf /etc/nginx/sites-available/college-management /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default || true

# Test Nginx and reload
nginx -t
systemctl reload nginx

echo "Setting up SSL Certificate with Certbot..."
certbot --nginx -d cms1.thehps.in --non-interactive --agree-tos -m 23341a05d0@gmail.com --redirect

echo "Deployment successfully configured!"
pm2 list
EOF_SSH

# Clean up local archive
rm -f $ARCHIVE_NAME

echo "============================================="
echo "🎉 Deployment process completed!"
echo "Website URL: https://$DOMAIN"
echo "============================================="
