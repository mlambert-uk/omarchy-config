#!/bin/sh

# Install my preferred terminal emulator
omarchy-install-terminal ghostty

# Check if the installation was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to install ghostty terminal."
    exit 1
fi

echo "ghostty terminal installed successfully."

# Install stow
sudo pacman -S --noconfirm --needed stow

if [ $? -ne 0 ]; then
    echo "Error: Failed to install stow."
    exit 1
fi

echo "Stow installed successfully."

# Install fonts
yay -S --noconfirm --needed otf-departure-mono