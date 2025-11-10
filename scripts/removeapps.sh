#!/usr/sh

# Remove the default apps installed by Omarchy that are not wanted

# Remove basecamp
echo "Removing Basecamp web app..."
omarchy-webapp-remove Basecamp

# Remove HEY
echo "Removing HEY web app..."
omarchy-webapp-remove HEY

# Remove whatsapp
echo "Removing WhatsApp web app..."
omarchy-webapp-remove WhatsApp

# Remove X 
echo "Removing X web app..."
omarchy-webapp-remove X

echo "Removal of unwanted apps completed."
