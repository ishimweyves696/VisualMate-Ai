#!/bin/bash

# Build the app
echo "Building the application..."
npm run build

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null
then
    echo "Firebase CLI could not be found. Please install it with: npm install -g firebase-tools"
    exit
fi

# Deploy to Firebase
echo "Deploying to Firebase Hosting, Firestore, and Storage..."
firebase deploy
