#!/bin/bash

# LeadFlow iOS Push Notifications Setup Script
echo "🔔 Setting up push notifications for iOS/iPad..."

echo ""
echo "📋 STEP 1: Get your VAPID key from Firebase Console"
echo "   1. Go to https://console.firebase.google.com"
echo "   2. Select your project: leadflow-4lvrr"
echo "   3. Go to Project Settings (gear icon)"
echo "   4. Click 'Cloud Messaging' tab"
echo "   5. Scroll to 'Web Push certificates'"
echo "   6. If no key exists, click 'Generate key pair'"
echo "   7. Copy the key and paste it in .env.local"

echo ""
echo "📋 STEP 2: Update .env.local file"
echo "   Replace 'your-vapid-key-here' with your actual VAPID key"

echo ""
echo "📋 STEP 3: iOS-specific requirements"
echo "   • Ensure you've added the app to your iPad home screen"
echo "   • Open the app from the home screen (not Safari)"
echo "   • The app must be installed as a PWA for notifications to work"

echo ""
echo "📋 STEP 4: Test notifications"
echo "   1. Open the PWA on your iPad"
echo "   2. Go to Profile or Settings"
echo "   3. Enable push notifications"
echo "   4. Test notifications work"

echo ""
echo "🔧 Debug checklist if notifications don't work:"
echo "   • Check browser console for errors"
echo "   • Verify VAPID key is correct"
echo "   • Ensure app is installed as PWA, not just bookmarked"
echo "   • Check iOS Settings > [Your App] > Notifications"
echo "   • Try creating a test lead to trigger a notification"

echo ""
echo "✅ Ready to continue with setup!"
