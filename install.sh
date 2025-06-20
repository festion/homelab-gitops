#!/bin/bash

# GitOps Auditor One-Line Installer
# Inspired by Proxmox Community Helper Scripts
# Usage: bash -c "$(wget -qLO - https://raw.githubusercontent.com/festion/homelab-gitops-auditor/main/install.sh)"

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Header
header_info() {
  cat << 'EOF'
    ____  _ _    ___              
   / ___|| (_)  / _ \ _ __  ___   
  | |  _ | | | | | | | '_ \/ __|  
  | |_| || | | | |_| | |_) \__ \  
   \____||_|_|  \___/| .__/|___/  
    _                |_|          
   / \  _   _  __| (_) |_ ___  _ __ 
  / _ \| | | |/ _` | | __/ _ \| '__|
 / ___ \ |_| | (_| | | || (_) | |   
/_/   \_\__,_|\__,_|_|\__\___/|_|   

GitOps Repository Audit Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF
}

# Spinner function
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='|/-\'
    while [ "$(ps a | awk '{print $1}' | grep $pid)" ]; do
        local temp=${spinstr#?}
        printf " [%c]  " "$spinstr"
        local spinstr=$temp${spinstr%"$temp"}
        sleep $delay
        printf "\b\b\b\b\b\b"
    done
    printf "    \b\b\b\b"
}

# Error handling
msg_error() {
    echo -e "${RED}✗ ERROR: ${NC}$1"
    exit 1
}

msg_info() {
    echo -e "${BLUE}ℹ INFO: ${NC}$1"
}

msg_ok() {
    echo -e "${GREEN}✓ ${NC}$1"
}

msg_warn() {
    echo -e "${YELLOW}⚠ WARNING: ${NC}$1"
}

# Default configuration
DEFAULT_LXC_ID="123"
DEFAULT_HOSTNAME="gitops-audit"
DEFAULT_DISK_SIZE="8"
DEFAULT_RAM="2048"
DEFAULT_CORES="2"
DEFAULT_NETWORK="vmbr0"
DEFAULT_IP="dhcp"
DEFAULT_GATEWAY=""
DEFAULT_DNS="8.8.8.8"

# Function to get user input with defaults
get_input() {
    local prompt="$1"
    local default="$2"
    local variable="$3"
    
    if [[ "$ADVANCED" == "true" ]]; then
        read -p "$prompt [$default]: " input
        eval "$variable=\"${input:-$default}\""
    else
        eval "$variable=\"$default\""
    fi
}

# Function to validate IP address
validate_ip() {
    local ip=$1
    if [[ $ip =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        return 0
    fi
    return 1
}

# Function to create LXC container
create_lxc() {
    msg_info "Creating LXC container with ID $LXC_ID"
    
    # Download Ubuntu 22.04 template if not exists
    if ! pveam list local | grep -q "ubuntu-22.04"; then
        msg_info "Downloading Ubuntu 22.04 template..."
        pveam download local ubuntu-22.04-standard_22.04-1_amd64.tar.zst >/dev/null 2>&1 &
        spinner $!
        msg_ok "Ubuntu template downloaded"
    fi
    
    # Network configuration
    if [[ "$IP_ADDRESS" == "dhcp" ]]; then
        NET_CONFIG="name=eth0,bridge=$NETWORK,ip=dhcp"
    else
        if [[ -n "$GATEWAY" ]]; then
            NET_CONFIG="name=eth0,bridge=$NETWORK,ip=$IP_ADDRESS/24,gw=$GATEWAY"
        else
            NET_CONFIG="name=eth0,bridge=$NETWORK,ip=$IP_ADDRESS/24"
        fi
    fi
    
    # Create container
    pct create $LXC_ID local:vztmpl/ubuntu-22.04-standard_22.04-1_amd64.tar.zst \
        --hostname $HOSTNAME \
        --memory $RAM \
        --cores $CORES \
        --rootfs local-lvm:$DISK_SIZE \
        --net0 $NET_CONFIG \
        --nameserver $DNS \
        --features nesting=1,keyctl=1 \
        --unprivileged 1 \
        --onboot 1 >/dev/null 2>&1
    
    msg_ok "LXC container created (ID: $LXC_ID)"
}

# Function to start container and wait for it to be ready
start_container() {
    msg_info "Starting container..."
    pct start $LXC_ID >/dev/null 2>&1
    
    # Wait for container to be ready
    timeout=60
    while [ $timeout -gt 0 ]; do
        if pct exec $LXC_ID -- systemctl is-system-running --quiet 2>/dev/null; then
            break
        fi
        sleep 2
        ((timeout-=2))
    done
    
    if [ $timeout -le 0 ]; then
        msg_error "Container failed to start properly"
    fi
    
    msg_ok "Container started and ready"
}

# Function to install GitOps Auditor in the container
install_gitops_auditor() {
    msg_info "Installing GitOps Auditor..."
    
    # Update system and install dependencies
    pct exec $LXC_ID -- bash -c "
        export DEBIAN_FRONTEND=noninteractive
        apt-get update >/dev/null 2>&1
        apt-get install -y curl wget git jq nginx nodejs npm build-essential >/dev/null 2>&1
    " &
    spinner $!
    msg_ok "System dependencies installed"
    
    # Clone and setup GitOps Auditor
    pct exec $LXC_ID -- bash -c "
        cd /opt
        git clone https://github.com/festion/homelab-gitops-auditor.git gitops >/dev/null 2>&1
        cd gitops
        
        # Install API dependencies
        cd api && npm install --production >/dev/null 2>&1
        cd ..
        
        # Install and build dashboard
        cd dashboard
        npm install >/dev/null 2>&1
        npm run build >/dev/null 2>&1
        cd ..
        
        # Set up configuration with interactive prompts
        chmod +x scripts/*.sh
        
        # Create default configuration
        mkdir -p /opt/gitops/audit-history
        mkdir -p /opt/gitops/logs
        
        # Set up systemd service
        cat > /etc/systemd/system/gitops-audit-api.service << 'EOL'
[Unit]
Description=GitOps Audit API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/gitops/api
Environment=NODE_ENV=production
Environment=PORT=3070
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOL

        # Configure Nginx
        cat > /etc/nginx/sites-available/gitops-audit << 'EOL'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /opt/gitops/dashboard/dist;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control \"no-cache, no-store, must-revalidate\";
    }
    
    location /api/ {
        proxy_pass http://localhost:3070/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    location /audit {
        proxy_pass http://localhost:3070/audit;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOL

        # Enable services
        rm -f /etc/nginx/sites-enabled/default
        ln -sf /etc/nginx/sites-available/gitops-audit /etc/nginx/sites-enabled/
        
        systemctl daemon-reload
        systemctl enable gitops-audit-api
        systemctl enable nginx
        systemctl start gitops-audit-api
        systemctl restart nginx
        
        # Set up daily cron for audits
        echo '0 3 * * * /opt/gitops/scripts/comprehensive_audit.sh' | crontab -
    " &
    spinner $!
    msg_ok "GitOps Auditor installed and configured"
}

# Function to detect existing installation
detect_existing_installation() {
    # Check if any container has GitOps Auditor installed
    for id in $(pct list | awk 'NR>1 {print $1}'); do
        if pct exec $id -- test -d /opt/gitops 2>/dev/null; then
            EXISTING_CONTAINER=$id
            EXISTING_HOSTNAME=$(pct config $id | grep "hostname:" | cut -d' ' -f2)
            return 0
        fi
    done
    return 1
}

# Function to get current version
get_current_version() {
    if [ -n "$EXISTING_CONTAINER" ]; then
        CURRENT_VERSION=$(pct exec $EXISTING_CONTAINER -- bash -c "cd /opt/gitops && git describe --tags --always 2>/dev/null || echo 'unknown'")
    else
        CURRENT_VERSION="none"
    fi
}

# Function to get latest version
get_latest_version() {
    LATEST_VERSION=$(curl -s https://api.github.com/repos/festion/homelab-gitops-auditor/releases/latest | grep '"tag_name"' | cut -d'"' -f4 2>/dev/null || echo "main")
}

# Function to perform upgrade
perform_upgrade() {
    msg_info "Upgrading GitOps Auditor in container $EXISTING_CONTAINER..."
    
    # Backup current configuration
    pct exec $EXISTING_CONTAINER -- bash -c "
        cd /opt/gitops
        if [ -f config/settings.local.conf ]; then
            cp config/settings.local.conf /tmp/gitops-backup-config.conf
            echo '📋 Configuration backed up'
        fi
    "
    
    # Stop services
    pct exec $EXISTING_CONTAINER -- bash -c "
        systemctl stop gitops-audit-api nginx
    "
    
    # Update code
    pct exec $EXISTING_CONTAINER -- bash -c "
        cd /opt/gitops
        git fetch origin >/dev/null 2>&1
        git reset --hard origin/main >/dev/null 2>&1
        
        # Install/update dependencies
        cd api && npm install --production >/dev/null 2>&1
        cd ../dashboard && npm install >/dev/null 2>&1 && npm run build >/dev/null 2>&1
        cd ..
        
        # Restore configuration
        if [ -f /tmp/gitops-backup-config.conf ]; then
            cp /tmp/gitops-backup-config.conf config/settings.local.conf
            echo '📋 Configuration restored'
        fi
        
        # Update permissions
        chmod +x scripts/*.sh
        
        # Restart services
        systemctl daemon-reload
        systemctl start gitops-audit-api nginx
        systemctl enable gitops-audit-api nginx
    " &
    spinner $!
    
    msg_ok "Upgrade completed successfully"
}

# Function to show installation type selection
show_installation_options() {
    if detect_existing_installation; then
        get_current_version
        get_latest_version
        
        echo ""
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}    Existing Installation Detected   ${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "Container: ${BLUE}$EXISTING_CONTAINER${NC} (${EXISTING_HOSTNAME})"
        echo -e "Current Version: ${BLUE}$CURRENT_VERSION${NC}"
        echo -e "Latest Version: ${BLUE}$LATEST_VERSION${NC}"
        echo ""
        echo -e "Select an option:"
        echo -e "  ${BLUE}1)${NC} Upgrade existing installation (Recommended)"
        echo -e "  ${BLUE}2)${NC} Install new container"
        echo -e "  ${BLUE}3)${NC} Exit"
        echo ""
        read -p "Please choose [1-3]: " choice
        
        case $choice in
            1) 
                perform_upgrade
                show_completion_info
                exit 0
                ;;
            2) 
                msg_info "Proceeding with new installation..."
                return 0
                ;;
            3) 
                msg_info "Installation cancelled"
                exit 0
                ;;
            *) 
                msg_warn "Invalid choice, proceeding with new installation..."
                return 0
                ;;
        esac
    fi
    return 0
}

# Function to show completion information
show_completion_info() {
    if [ -n "$EXISTING_CONTAINER" ]; then
        # Get IP for existing container
        CONTAINER_IP=$(pct exec $EXISTING_CONTAINER -- hostname -I | awk '{print $1}' 2>/dev/null || echo "<CONTAINER_IP>")
        DISPLAY_CONTAINER=$EXISTING_CONTAINER
        DISPLAY_HOSTNAME=$EXISTING_HOSTNAME
    else
        # Use new installation values
        get_container_ip
        DISPLAY_CONTAINER=$LXC_ID
        DISPLAY_HOSTNAME=$HOSTNAME
    fi
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    if [ -n "$EXISTING_CONTAINER" ]; then
        echo -e "${GREEN}    Upgrade Complete!               ${NC}"
    else
        echo -e "${GREEN}    Installation Complete!          ${NC}"
    fi
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${CYAN}🌐 Dashboard URL:${NC} http://$CONTAINER_IP"
    echo -e "${CYAN}🔧 API Endpoint:${NC} http://$CONTAINER_IP:3070/audit"
    echo -e "${CYAN}📋 Container ID:${NC} $DISPLAY_CONTAINER"
    echo -e "${CYAN}🖥️  Hostname:${NC} $DISPLAY_HOSTNAME"
    echo ""
    echo -e "${YELLOW}📖 Next Steps:${NC}"
    echo -e "  1. Visit ${BLUE}http://$CONTAINER_IP${NC} to access the dashboard"
    echo -e "  2. Configure your Git repositories if needed"
    echo -e "  3. Run your first audit to see repository status"
    echo ""
    echo -e "${YELLOW}🔧 Container Management:${NC}"
    echo -e "  Start:  ${BLUE}pct start $DISPLAY_CONTAINER${NC}"
    echo -e "  Stop:   ${BLUE}pct stop $DISPLAY_CONTAINER${NC}"
    echo -e "  Shell:  ${BLUE}pct enter $DISPLAY_CONTAINER${NC}"
    echo ""
    echo -e "${YELLOW}📚 Documentation:${NC}"
    echo -e "  GitHub: ${BLUE}https://github.com/festion/homelab-gitops-auditor${NC}"
    echo -e "  Config: ${BLUE}pct exec $DISPLAY_CONTAINER -- /opt/gitops/scripts/config-manager.sh show${NC}"
    echo ""
}

# Function to get container IP
get_container_ip() {
    if [[ "$IP_ADDRESS" == "dhcp" ]]; then
        # Get IP from container
        CONTAINER_IP=$(pct exec $LXC_ID -- hostname -I | awk '{print $1}' 2>/dev/null || echo "")
        if [[ -z "$CONTAINER_IP" ]]; then
            msg_warn "Could not determine container IP address"
            CONTAINER_IP="<CONTAINER_IP>"
        fi
    else
        CONTAINER_IP=$(echo $IP_ADDRESS | cut -d'/' -f1)
    fi
}
# Function to run configuration wizard
run_config_wizard() {
    local container_id=${1:-$LXC_ID}
    
    msg_info "Running configuration wizard..."
    
    # Get user inputs for configuration
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}    GitOps Auditor Configuration    ${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    read -p "GitHub Username [festion]: " GITHUB_USER
    GITHUB_USER=${GITHUB_USER:-festion}
    
    read -p "Local Git Root Path [/mnt/git]: " LOCAL_GIT_ROOT
    LOCAL_GIT_ROOT=${LOCAL_GIT_ROOT:-/mnt/git}
    
    # Create user configuration in container
    pct exec $container_id -- bash -c "
        cd /opt/gitops
        cat > config/settings.local.conf << EOL
# GitOps Auditor User Configuration
PRODUCTION_SERVER_IP=\"$CONTAINER_IP\"
LOCAL_GIT_ROOT=\"$LOCAL_GIT_ROOT\"
GITHUB_USER=\"$GITHUB_USER\"
EOL
        
        # Restart service to pick up new config
        systemctl restart gitops-audit-api
    "
    
    msg_ok "Configuration saved"
}
}

# Main installation function
main() {
    # Clear screen and show header
    clear
    header_info
    
    echo ""
    echo -e "${GREEN}This script will install GitOps Auditor in a new LXC container${NC}"
    echo -e "${GREEN}Similar to Proxmox Community Helper Scripts${NC}"
    echo ""
    
    # Check if running on Proxmox
    if ! command -v pct >/dev/null 2>&1; then
        msg_error "This script must be run on a Proxmox VE host"
    fi
    
    # Check for existing installation and handle upgrade
    show_installation_options
    
    # Ask for installation type
    echo -e "Select installation type:"
    echo -e "  ${BLUE}1)${NC} Default (Recommended)"
    echo -e "  ${BLUE}2)${NC} Advanced"
    echo ""
    read -p "Please choose [1-2]: " choice
    
    case $choice in
        1) ADVANCED="false" ;;
        2) ADVANCED="true" ;;
        *) ADVANCED="false" ;;
    esac
    
    echo ""
    
    # Get configuration
    if [[ "$ADVANCED" == "true" ]]; then
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${CYAN}    Advanced Configuration Setup    ${NC}"
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
    fi
    
    get_input "LXC Container ID" "$DEFAULT_LXC_ID" "LXC_ID"
    get_input "Hostname" "$DEFAULT_HOSTNAME" "HOSTNAME"
    get_input "Disk Size (GB)" "$DEFAULT_DISK_SIZE" "DISK_SIZE"
    get_input "RAM (MB)" "$DEFAULT_RAM" "RAM"
    get_input "CPU Cores" "$DEFAULT_CORES" "CORES"
    get_input "Network Bridge" "$DEFAULT_NETWORK" "NETWORK"
    get_input "IP Address (dhcp or static)" "$DEFAULT_IP" "IP_ADDRESS"
    
    if [[ "$IP_ADDRESS" != "dhcp" && "$ADVANCED" == "true" ]]; then
        get_input "Gateway" "$DEFAULT_GATEWAY" "GATEWAY"
    fi
    
    get_input "DNS Server" "$DEFAULT_DNS" "DNS"
    
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}    Configuration Summary           ${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Container ID: ${BLUE}$LXC_ID${NC}"
    echo -e "Hostname: ${BLUE}$HOSTNAME${NC}"
    echo -e "Resources: ${BLUE}${RAM}MB RAM, ${CORES} cores, ${DISK_SIZE}GB disk${NC}"
    echo -e "Network: ${BLUE}$NETWORK${NC}"
    echo -e "IP Address: ${BLUE}$IP_ADDRESS${NC}"
    echo ""
    
    read -p "Continue with installation? [Y/n]: " confirm
    if [[ $confirm =~ ^[Nn]$ ]]; then
        msg_info "Installation cancelled"
        exit 0
    fi
    
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}    Starting Installation           ${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Check if container ID already exists
    if pct status $LXC_ID >/dev/null 2>&1; then
        msg_error "Container with ID $LXC_ID already exists"
    fi
    
    # Create and configure container
    create_lxc
    start_container
    install_gitops_auditor
    
    # Get final IP address
    get_container_ip
    
    # Run configuration wizard
    run_config_wizard $LXC_ID
    
    # Show completion info
    show_completion_info
}

# Run main function
main "$@"