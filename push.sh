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

# Store changed files in an array
changed_files=()
while IFS= read -r line; do
    # Extract file path (starting from column 4 to handle spaces properly)
    file="${line:3}"
    changed_files+=("$file")
done < <(git status --porcelain)

# Check if there are any changes
if [ ${#changed_files[@]} -eq 0 ]; then
    echo "No changes to commit."
    exit 0
fi

# Add and commit each file separately
for file in "${changed_files[@]}"; do
    echo "Adding and committing: $file"
    git add "$file"
    git commit -m "$commit_message ($file)"
done

echo "Pushing to remote..."
git push

echo "Done! 🚀"
