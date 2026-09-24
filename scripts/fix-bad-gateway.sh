#!/bin/bash
# Fix Bad Gateway Error - Restart nginx with updated configuration

echo "🔧 Fixing Bad Gateway Error on thetruthdrivingschool.ca"
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"
echo ""

# Navigate to project directory
cd "$(dirname "$0")/.."

echo "📦 Checking container status..."
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "🔄 Restarting nginx container with fixed configuration..."
docker-compose -f docker-compose.prod.yml restart nginx
echo ""

# Wait a moment for nginx to start
sleep 3

echo "🔍 Checking if nginx is running..."
if docker ps | grep -q "driving_school_nginx_prod"; then
    echo "✅ Nginx container is running!"
else
    echo "⚠️  Nginx container may not be running. Check with: docker-compose -f docker-compose.prod.yml ps"
fi

echo ""
echo "🌐 Testing website..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:80/health)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed! (HTTP $HTTP_CODE)"
    echo ""
    echo "🎉 Fix applied successfully!"
    echo "🔗 Your website should now be accessible at: https://thetruthdrivingschool.ca"
    echo ""
    echo "💡 If you still see a bad gateway:"
    echo "   1. Clear your browser cache (Cmd+Shift+R on Mac)"
    echo "   2. Wait 1-2 minutes for Cloudflare tunnel to reconnect"
    echo "   3. Check logs: docker-compose -f docker-compose.prod.yml logs nginx"
else
    echo "⚠️  Health check returned HTTP $HTTP_CODE"
    echo "📋 Check nginx logs for errors:"
    echo "   docker-compose -f docker-compose.prod.yml logs nginx --tail=50"
fi

