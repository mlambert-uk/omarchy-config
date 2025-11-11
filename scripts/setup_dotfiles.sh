#!/bin/sh

# Set up dotfiles using GNU Stow
echo "Setting up dotfiles with Stow..."

stow -d dotfiles -t $HOME ghostty -R
if [ $? -ne 0 ]; then
    echo "Error: Failed to stow ghostty configuration."
    exit 1
fi

# Set up waybar configuration
stow -d dotfiles -t $HOME waybar -R
if [ $? -ne 0 ]; then
    echo "Error: Failed to stow waybar configuration."
    exit 1
fi


