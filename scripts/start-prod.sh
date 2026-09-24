#!/bin/bash

echo "Starting Driving School Production Environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found!"
    echo "Please copy env.txt to .env and update the values for production."
    exit 1
fi

# Start production environment
docker-compose -f docker-compose.prod.yml up --build -d

echo "Production environment started!"
echo "Website should be available at your configured domain"

