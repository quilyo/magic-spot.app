#!/bin/bash

# MagicSpot Setup Script
# This script sets up the development environment for MagicSpot

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "═══════════════════════════════════════════════════════════"
echo "  MagicSpot Development Environment Setup"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

# Check Python
echo -e "\n${YELLOW}Checking Python...${NC}"
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Found: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.9 or higher.${NC}"
    exit 1
fi

# Check Node.js
echo -e "\n${YELLOW}Checking Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Found: Node.js $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 16 or higher.${NC}"
    exit 1
fi

# Setup Backend
echo -e "\n${BLUE}Setting up Backend...${NC}"
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating Python virtual environment...${NC}"
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}Installing Python dependencies...${NC}"
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo -e "${GREEN}✓ Python dependencies installed${NC}"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    
    # Generate random secret keys
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    
    # Update .env with generated keys
    sed -i.bak "s|your-secret-key-here|$SECRET_KEY|g" .env
    sed -i.bak "s|your-jwt-secret-key-here|$JWT_SECRET_KEY|g" .env
    rm .env.bak
    
    echo -e "${GREEN}✓ .env file created with random secret keys${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

cd ..

# Setup Frontend
echo -e "\n${BLUE}Setting up Frontend...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Node.js dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Node.js dependencies already installed${NC}"
fi

# Create frontend .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating frontend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Frontend .env file created${NC}"
else
    echo -e "${GREEN}✓ Frontend .env file already exists${NC}"
fi

# Summary
echo -e "\n${GREEN}"
echo "═══════════════════════════════════════════════════════════"
echo "  ✓ Setup Complete!"
echo "═══════════════════════════════════════════════════════════"
echo -e "${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "\n${BLUE}Terminal 1 - Start Backend:${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python app.py"

echo -e "\n${BLUE}Terminal 2 - Start Frontend:${NC}"
echo "  npm run dev"

echo -e "\n${BLUE}Terminal 3 - Send Data (optional):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python send_parking_data.py"

echo -e "\n${YELLOW}Documentation:${NC}"
echo "  • Quick Start: See QUICK_START.md"
echo "  • Full Guide: See README.md"
echo "  • Deployment: See DEPLOYMENT_GUIDE.md"

echo -e "\n${GREEN}Happy coding! 🚀${NC}\n"
