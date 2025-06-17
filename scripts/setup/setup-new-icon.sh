#!/bin/bash

# LeadFlow Icon Setup Script
# This script helps you set up the new blue gear icon for your app

echo "🎯 LeadFlow Icon Setup"
echo "======================"
echo ""

echo "📁 Icon files created:"
echo "• /public/icon.svg - Main SVG icon (updated)"
echo "• /public/app-icon.svg - Alternative SVG version"
echo "• /public/leadflow-icon.svg - Development version"
echo ""

echo "🌐 Icon generator page:"
echo "• Open http://localhost:9002/generate-leadflow-icons.html"
echo "• Click 'Generate All PNG Icons'"
echo "• Download all the PNG files and place them in /public/"
echo ""

echo "📋 Required PNG files to download:"
echo "• icon-16x16.png"
echo "• icon-32x32.png" 
echo "• icon-48x48.png"
echo "• icon-64x64.png"
echo "• icon-96x96.png"
echo "• icon-128x128.png"
echo "• icon-192x192.png (replace existing)"
echo "• icon-256x256.png"
echo "• icon-512x512.png"
echo ""

echo "✅ Already updated:"
echo "• /src/app/layout.tsx - Added proper favicon links"
echo "• /public/manifest.json - Updated theme color to blue (#3B82F6)"
echo ""

echo "🎨 Icon Features:"
echo "• Blue gradient gear design matching your original"
echo "• SVG format for crisp scaling"
echo "• 8 gear teeth in symmetrical pattern"
echo "• White center hole"
echo "• Modern blue gradient (#3B82F6 to #1D4ED8)"
echo ""

echo "🚀 Next Steps:"
echo "1. Open the icon generator page"
echo "2. Generate and download all PNG sizes"
echo "3. Replace the PNG files in /public/"
echo "4. Your new icon will appear throughout the app!"
echo ""

# Open the generator page if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 Opening icon generator..."
    open http://localhost:9002/generate-leadflow-icons.html
fi
