#!/bin/bash

echo "Stopping Driving School Docker Environment..."

# Stop all containers
docker-compose down

# Optionally remove volumes (uncomment if you want to reset database)
# docker-compose down -v

echo "Docker environment stopped!"

