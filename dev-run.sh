#!/bin/bash
set -e

# Script to run the GitOps Auditor in development mode

# Terminal colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${CYAN}Starting GitOps Auditor in development mode...${NC}"

# Ensure we have the audit history directory
mkdir -p audit-history

# Install dependencies for API if needed
echo -e "${CYAN}Checking API dependencies...${NC}"
if [ ! -d "api/node_modules" ]; then
  cd api
  npm install express
  cd ..
fi

# Check dashboard dependencies
echo -e "${CYAN}Checking dashboard dependencies...${NC}"
cd dashboard
if [ ! -d "node_modules" ]; then
  echo -e "${CYAN}Installing dashboard dependencies...${NC}"
  npm install
fi

# Start the API server
echo -e "${GREEN}Starting API server...${NC}"
cd ..
NODE_ENV=development node api/server.js &
API_PID=$!

# Start the dashboard development server
echo -e "${GREEN}Starting dashboard dev server...${NC}"
cd dashboard
npm run dev &
DASHBOARD_PID=$!

# Function to kill processes on exit
cleanup() {
  echo -e "${RED}Shutting down servers...${NC}"
  kill $API_PID $DASHBOARD_PID 2>/dev/null || true
}

# Register cleanup function
trap cleanup EXIT

# Wait for user to press Ctrl+C
echo -e "${GREEN}✅ Development environment is running!${NC}"
echo -e "${CYAN}API server:${NC} http://localhost:3070"
echo -e "${CYAN}Dashboard:${NC} http://localhost:5173"
echo -e "Press Ctrl+C to stop the servers"
wait