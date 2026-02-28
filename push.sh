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

# Get all changes including untracked files
git add -A

# Check if there are any changes
if git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Get list of staged files
changed_files=()
while IFS= read -r line; do
    # Extract status and file path
    status="${line:0:2}"
    file="${line:3}"
    
    # Remove quotes if present
    file="${file%\"}"
    file="${file#\"}"
    
    changed_files+=("$file")
done < <(git status --porcelain)

echo "Found ${#changed_files[@]} changed file(s)"

# Create a single commit with all changes
if [ ${#changed_files[@]} -gt 0 ]; then
    echo "Committing all changes..."
    git commit -m "$commit_message"
    
    echo "Pushing to remote..."
    # Check if upstream is set
    if ! git rev-parse --abbrev-ref --symbolic-full-name @{u} > /dev/null 2>&1; then
        current_branch=$(git rev-parse --abbrev-ref HEAD)
        echo "Setting upstream for branch: $current_branch"
        git push --set-upstream origin "$current_branch"
    else
        git push
    fi
    
    echo "Done! 🚀"
else
    echo "No files to commit."
fi
