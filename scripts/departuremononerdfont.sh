#!/bin/sh

#Download and install the Departure Mono Nerd Font
FONT_URL="https://github.com/ryanoasis/nerd-fonts/releases/latest/download/DepartureMono.tar.xz"
TEMP_DIR="/tmp/departure-mono-nerd-font"

# Create temporary directory
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Download the font archive
echo "Downloading Departure Mono Nerd Font..."
curl -LO "$FONT_URL"
if [ $? -ne 0 ]; then
    echo "Error: Failed to download the font."
    exit 1
fi

# Extract the archive
echo "Extracting font files..."
tar -xf DepartureMono.tar.xz
if [ $? -ne 0 ]; then
    echo "Error: Failed to extract the font files."
    exit 1
fi

# Create font directory if it doesn't exist
FONT_DIR="$HOME/.local/share/fonts"
mkdir -p "$FONT_DIR"

# Move font files to the font directory
echo "Installing font files..."
mv *.otf "$FONT_DIR/"
if [ $? -ne 0 ]; then
    echo "Error: Failed to move font files to $FONT_DIR."
    exit 1
fi

# Refresh font cache
echo "Refreshing font cache..."
fc-cache -fv
if [ $? -ne 0 ]; then
    echo "Error: Failed to refresh font cache."
    exit 1
fi

# Clean up temporary files
cd ..
rm -rf "$TEMP_DIR"

echo "Departure Mono Nerd Font installed successfully."
