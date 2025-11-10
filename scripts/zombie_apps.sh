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
omarchy-webapp-install "https://mail.google.com/mail/u/0/" "Gmail"
omarchy-webapp-install "https://calendar.google.com/calendar/u/0/r" "Google Calendar"
omarchy-webapp-install "https://www.facebook.com/messages/t/" "Facebook Messenger"
omarchy-webapp-install "https://www.google.com/maps" "Google Maps"

# Install AI Tools
omarchy-webapp-install "https://copilot.github.com/" "GitHub Copilot"
omarchy-webapp-install "https://gemini.google.com/" "Google Gemini"

echo "Installation of zombie-specific applications completed."
