#!/bin/bash

# Get commit message from argument or prompt the user
commit_message="$1"

if [ -z "$commit_message" ]; then
    echo -n "Enter commit message: "
    read commit_message
fi

# Abort if message is still empty
if [ -z "$commit_message" ]; then
    echo "Commit message cannot be empty. Aborting."
    exit 1
fi

echo "Finding changed files..."
git status --porcelain | while IFS= read -r line; do
    # Extract file path (starting from column 4 to handle spaces properly)
    file="${line:3}"
    
    echo "Adding and committing: $file"
    git add "$file"
    git commit -m "$commit_message ($file)"
done

echo "Pushing to remote..."
git push

echo "Done! 🚀"
