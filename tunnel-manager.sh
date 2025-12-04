#!/bin/bash
# Cloudflare Tunnel Manager for thetruthdrivingschool.ca
# Interactive shell to manage tunnel operations

PROJECT_DIR="/Users/alextruong/Documents/driving_school"
cd "$PROJECT_DIR"

# Colors for better UI
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
show_banner() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                  ║${NC}"
    echo -e "${CYAN}║       ${BLUE}Cloudflare Tunnel Manager${CYAN}                ║${NC}"
    echo -e "${CYAN}║       ${BLUE}thetruthdrivingschool.ca${CYAN}                 ║${NC}"
    echo -e "${CYAN}║                                                  ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Start tunnel
start_tunnel() {
    echo -e "${BLUE}🚀 Starting Cloudflare tunnel...${NC}"
    echo ""
    
    # Check if tunnel is already running
    if [ -f tunnel.pid ]; then
        PID=$(cat tunnel.pid)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${YELLOW}✅ Tunnel is already running (PID: $PID)${NC}"
            echo -e "${GREEN}🌐 Website: https://thetruthdrivingschool.ca${NC}"
            return 0
        else
            # Clean up stale PID file
            rm tunnel.pid
        fi
    fi
    
    # Check if cloudflared is installed
    if ! command -v ~/bin/cloudflared &> /dev/null; then
        echo -e "${RED}❌ cloudflared not found in ~/bin/${NC}"
        echo -e "${YELLOW}💡 Install it first using: brew install cloudflared${NC}"
        return 1
    fi
    
    # Start tunnel in background
    ~/bin/cloudflared tunnel --config tunnel-config.yml run thetruthdrivingschool > tunnel.log 2>&1 &
    
    # Save PID
    echo $! > tunnel.pid
    sleep 2
    
    # Verify it started
    if ps -p $(cat tunnel.pid) > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Tunnel started successfully!${NC}"
        echo -e "${GREEN}📝 Process ID: $(cat tunnel.pid)${NC}"
        echo -e "${GREEN}🌐 Website: https://thetruthdrivingschool.ca${NC}"
        echo -e "${CYAN}📋 View logs: tail -f tunnel.log${NC}"
    else
        echo -e "${RED}❌ Failed to start tunnel${NC}"
        echo -e "${YELLOW}📋 Check tunnel.log for errors${NC}"
        rm -f tunnel.pid
        return 1
    fi
}

# Stop tunnel
stop_tunnel() {
    echo -e "${BLUE}🛑 Stopping Cloudflare tunnel...${NC}"
    echo ""
    
    if [ ! -f tunnel.pid ]; then
        echo -e "${YELLOW}⚠️  No tunnel PID file found${NC}"
        echo -e "${YELLOW}ℹ️  Tunnel is not running${NC}"
        return 1
    fi
    
    PID=$(cat tunnel.pid)
    
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "${YELLOW}🛑 Stopping tunnel (PID: $PID)...${NC}"
        kill $PID
        sleep 1
        
        # Force kill if still running
        if ps -p $PID > /dev/null 2>&1; then
            kill -9 $PID 2>/dev/null
        fi
        
        rm tunnel.pid
        echo -e "${GREEN}✅ Tunnel stopped successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Tunnel is not running${NC}"
        rm tunnel.pid
    fi
}

# Check status
check_status() {
    echo -e "${BLUE}🔍 Checking tunnel status...${NC}"
    echo ""
    
    # Check PID file
    if [ -f tunnel.pid ]; then
        PID=$(cat tunnel.pid)
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Tunnel is RUNNING${NC}"
            echo -e "${GREEN}📝 Process ID: $PID${NC}"
            echo -e "${GREEN}🌐 Website: https://thetruthdrivingschool.ca${NC}"
            echo ""
            echo -e "${CYAN}📊 Process details:${NC}"
            ps aux | grep cloudflared | grep -v grep | head -1
        else
            echo -e "${RED}❌ Tunnel is NOT running${NC}"
            echo -e "${YELLOW}ℹ️  Stale PID file found - cleaning up${NC}"
            rm tunnel.pid
        fi
    else
        echo -e "${RED}❌ Tunnel is NOT running${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}🌐 Testing website accessibility...${NC}"
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://thetruthdrivingschool.ca)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Website is ACCESSIBLE (HTTP $HTTP_CODE)${NC}"
        echo -e "${GREEN}🔗 https://thetruthdrivingschool.ca${NC}"
    elif [ "$HTTP_CODE" = "000" ]; then
        echo -e "${RED}❌ Website is NOT accessible (Connection failed)${NC}"
        echo -e "${YELLOW}💡 Make sure tunnel is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Website returned HTTP $HTTP_CODE${NC}"
        echo -e "${YELLOW}💡 DNS propagation may take a few minutes${NC}"
    fi
}

# Restart tunnel
restart_tunnel() {
    echo -e "${BLUE}🔄 Restarting tunnel...${NC}"
    echo ""
    stop_tunnel
    sleep 2
    start_tunnel
}

# View logs
view_logs() {
    echo -e "${BLUE}📋 Viewing tunnel logs (Ctrl+C to exit)...${NC}"
    echo ""
    
    if [ ! -f tunnel.log ]; then
        echo -e "${YELLOW}⚠️  No log file found${NC}"
        return 1
    fi
    
    tail -f tunnel.log
}

# View last 50 lines of logs
view_logs_tail() {
    echo -e "${BLUE}📋 Last 50 lines of tunnel logs:${NC}"
    echo ""
    
    if [ ! -f tunnel.log ]; then
        echo -e "${YELLOW}⚠️  No log file found${NC}"
        return 1
    fi
    
    tail -n 50 tunnel.log
}

# Show configuration
show_config() {
    echo -e "${BLUE}⚙️  Tunnel Configuration:${NC}"
    echo ""
    
    if [ -f tunnel-config.yml ]; then
        echo -e "${CYAN}📄 tunnel-config.yml:${NC}"
        cat tunnel-config.yml
    else
        echo -e "${RED}❌ Configuration file not found${NC}"
    fi
}

# Main menu
show_menu() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║              MAIN MENU                 ║${NC}"
    echo -e "${CYAN}╠════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║                                        ║${NC}"
    echo -e "${CYAN}║  ${GREEN}1${NC}) 🚀 Start Tunnel                  ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}2${NC}) 🛑 Stop Tunnel                   ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}3${NC}) 🔄 Restart Tunnel                ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}4${NC}) 🔍 Check Status                  ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}5${NC}) 📋 View Logs (Live)              ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}6${NC}) 📄 View Last 50 Lines            ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}7${NC}) ⚙️  Show Configuration            ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}8${NC}) 🌐 Open Website                  ${CYAN}║${NC}"
    echo -e "${CYAN}║  ${GREEN}0${NC}) 👋 Exit                          ${CYAN}║${NC}"
    echo -e "${CYAN}║                                        ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo ""
}

# Open website
open_website() {
    echo -e "${BLUE}🌐 Opening website in browser...${NC}"
    open https://thetruthdrivingschool.ca 2>/dev/null || \
    xdg-open https://thetruthdrivingschool.ca 2>/dev/null || \
    echo -e "${CYAN}🔗 Visit: https://thetruthdrivingschool.ca${NC}"
}

# Main loop
main() {
    show_banner
    
    while true; do
        show_menu
        echo -ne "${YELLOW}Select an option (0-8): ${NC}"
        read -r choice
        echo ""
        
        case $choice in
            1)
                start_tunnel
                ;;
            2)
                stop_tunnel
                ;;
            3)
                restart_tunnel
                ;;
            4)
                check_status
                ;;
            5)
                view_logs
                ;;
            6)
                view_logs_tail
                ;;
            7)
                show_config
                ;;
            8)
                open_website
                ;;
            0)
                echo -e "${GREEN}👋 Goodbye!${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid option. Please choose 0-8.${NC}"
                ;;
        esac
        
        echo ""
        echo -e "${CYAN}Press Enter to continue...${NC}"
        read -r
        show_banner
    done
}

# Run main function
main

