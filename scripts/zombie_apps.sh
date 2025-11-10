#!/bin/sh

# Install Omarchy optional applications
omarchy-install-vscode

# Install Applications
sudo pacman -S --noconfirm --needed firefox
sudo pacman -S --noconfirm --needed gimp
sudo pacman -S --noconfirm --needed bitwarden bitwarden-cli
yay -S --noconfirm --needed boxes-gnome

# For the weather in the waybar
yay -S --noconfirm --needed wttrbar

# Install Web Apps
cp -R webapps/* ~/.local/share/applications/


echo "Installation of zombie-specific applications completed."
