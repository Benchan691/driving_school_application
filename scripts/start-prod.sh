#!/bin/bash

echo "Starting Driving School Production Environment..."

# Check if .env.production file exists
if [ ! -f .env.production ]; then
    echo "Error: .env.production file not found!"
    echo "Please create .env.production and update the values for production."
    exit 1
fi

# Start production environment
docker-compose -f docker-compose.prod.yml up --build -d

echo "Production environment started!"
echo "Website should be available at your configured domain"

