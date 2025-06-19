#!/bin/bash

# LeadFlow Development Environment Setup
echo "🚀 Setting up LeadFlow development environment..."

# Start Firebase emulator
echo "📱 Starting Firebase Firestore emulator..."
firebase emulators:start --only firestore --project leadflow-4lvrr &
EMULATOR_PID=$!

# Wait for emulator to start
echo "⏳ Waiting for emulator to initialize..."
sleep 5

# Start Next.js development server
echo "🌐 Starting Next.js development server..."
npm run dev &
NEXTJS_PID=$!

echo "✅ Development environment ready!"
echo "📱 Firestore Emulator: http://localhost:8080"
echo "🌐 Next.js App: http://localhost:9002"
echo ""
echo "To stop both services, press Ctrl+C"

# Wait for both processes
wait $EMULATOR_PID $NEXTJS_PID
