#!/bin/sh

set -e

echo -e "\nRunning zombie_install...\n"

show_logo()
{
    ansi_art='
█▀▀▀▀▀██   ▄▄█▀▀██   ▀██    ██▀ ▀██▀▀█▄    ██  ▀██▀▀▀▀█  
    ▄█▀   ▄█▀    ██   ███  ███   ██   ██  ▄▄▄   ██  ▄    
   ██     ██      ██  █▀█▄▄▀██   ██▀▀▀█▄   ██   ██▀▀█    
 ▄█▀      ▀█▄     ██  █ ▀█▀ ██   ██    ██  ██   ██       
██▄▄▄▄▄▄█  ▀▀█▄▄▄█▀  ▄█▄ █ ▄██▄ ▄██▄▄▄█▀  ▄██▄ ▄██▄▄▄▄▄█ 
'
    clear
    echo -e "\n$ansi_art\n"
}

show_subtext() {
    echo "$1" 
    echo
}

# Install essential packages
show_logo
show_subtext "Installing essentials..."

source ./scripts/essentials.sh

# Install Departure Mono Nerd Font
show_logo
show_subtext "Installing Departure Mono Nerd Font..."
source ./scripts/departuremononerdfont.sh

# Clean up unrequired packages and Omarchy things that are not wanted
show_logo
show_subtext "Cleaning up Omarchy default install..."
source ./scripts/removeapps.sh

# Fix Omarchy issues
show_logo
show_subtext "Fixing Omarchy issues..."
source ./scripts/fixomarchy.sh

# Install zombie-specific applications
show_logo
show_subtext "Installing preferred applications..."
source ./scripts/zombie_apps.sh

# Set up dotfiles using stow
show_logo
show_subtext "Setting up dotfiles with stow..."
source ./scripts/setup_dotfiles.sh

# Final message
show_logo
show_subtext "Installation completed successfully!"
