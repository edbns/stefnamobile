#!/bin/bash

# Navigate to stefnamobile directory
cd /Users/sennie/Desktop/Stefna-main/stefnamobile

# Stage all changes
git add -A

# Commit with message
git commit -m "Complete rebuild - all 6 issues fixed"

# Push to main
git push origin main

echo "Done! Check Expo for deployment"

