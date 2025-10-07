#!/bin/bash

# Auto Database Keep-Alive Script for Supabase Free Tier
# Pings database every 5 minutes to prevent auto-pause

echo "🔄 Starting database keep-alive..."
echo "⏰ Pinging every 5 minutes to prevent Supabase pause"
echo "Press Ctrl+C to stop"
echo ""

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  echo "[$TIMESTAMP] Pinging database..."
  
  # Run the database test
  npm run db:test 2>&1 | grep -E "(SUCCESS|Found|ERROR)" || echo "  ⚠️  Ping failed"
  
  echo "  💤 Sleeping for 5 minutes..."
  echo ""
  
  # Sleep for 5 minutes (300 seconds)
  sleep 300
done
