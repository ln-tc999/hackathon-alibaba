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

# Get commit mode from argument (all, individual, interactive)
commit_mode="${2:-all}"

echo "Finding changed files..."

# Get all changes including untracked files
git add -A

# Check if there are any changes
if git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Get list of staged files with their status
declare -a changed_files
declare -A file_status
while IFS= read -r line; do
    # Extract status and file path
    status="${line:0:2}"
    file="${line:3}"

    # Remove quotes if present
    file="${file%\"}"
    file="${file#\"}"

    changed_files+=("$file")
    file_status["$file"]="$status"
done < <(git status --porcelain)

echo "Found ${#changed_files[@]} changed file(s)"

# Function to get human-readable status
get_status_label() {
    local status="$1"
    case "$status" in
        M*) echo "Modified" ;;
        A*) echo "Added" ;;
        C*) echo "Copied" ;;
        D*) echo "Deleted" ;;
        R*) echo "Renamed" ;;
        U*) echo "Unmerged" ;;
        ??*) echo "Untracked" ;;
        *) echo "Unknown" ;;
    esac
}

# Function to commit a single file
commit_file() {
    local file="$1"
    local status="${file_status[$file]}"
    local label=$(get_status_label "$status")
    
    echo "[$label] $file"
    
    # Reset all and add only this file
    git reset HEAD > /dev/null 2>&1
    git add "$file"
    
    # Commit the file
    git commit -m "$commit_message"
    
    if [ $? -eq 0 ]; then
        echo "✓ Committed: $file"
        return 0
    else
        echo "✗ Failed to commit: $file"
        return 1
    fi
}

# Function for interactive mode
interactive_mode() {
    echo ""
    echo "Select files to commit (enter numbers separated by spaces, or 'a' for all):"
    echo ""
    
    local i=1
    for file in "${changed_files[@]}"; do
        local status="${file_status[$file]}"
        local label=$(get_status_label "$status")
        printf "  %2d) [%s] %s\n" "$i" "$label" "$file"
        ((i++))
    done
    
    echo ""
    echo -n "Your selection: "
    read selection
    
    if [ "$selection" = "a" ]; then
        # Commit all files one by one
        for file in "${changed_files[@]}"; do
            commit_file "$file"
            echo ""
        done
    else
        # Parse selected numbers
        local selected_indices=($selection)
        for idx in "${selected_indices[@]}"; do
            if [[ "$idx" =~ ^[0-9]+$ ]] && [ "$idx" -ge 1 ] && [ "$idx" -le "${#changed_files[@]}" ]; then
                local file="${changed_files[$((idx-1))]}"
                commit_file "$file"
                echo ""
            else
                echo "Invalid selection: $idx"
            fi
        done
    fi
}

# Function for individual mode (commit one file at a time with confirmation)
individual_mode() {
    echo ""
    echo "Committing files one by one..."
    echo ""
    
    for file in "${changed_files[@]}"; do
        local status="${file_status[$file]}"
        local label=$(get_status_label "$status")
        
        echo -n "Commit [$label] $file? (y/n/skip-all): "
        read confirm
        
        if [ "$confirm" = "skip-all" ]; then
            echo "Skipping remaining files."
            break
        elif [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
            commit_file "$file"
            echo ""
        else
            echo "Skipped: $file"
            echo ""
        fi
    done
}

# Main logic based on mode
if [ ${#changed_files[@]} -gt 0 ]; then
    case "$commit_mode" in
        all)
            # Original behavior - commit all at once
            echo "Committing all changes..."
            git commit -m "$commit_message"
            ;;
        individual)
            # Commit one by one with y/n confirmation
            individual_mode
            ;;
        interactive)
            # Select which files to commit
            interactive_mode
            ;;
        M|C|D|A|R)
            # Commit only files matching the status type
            echo "Committing only $commit_mode files..."
            for file in "${changed_files[@]}"; do
                local status="${file_status[$file]}"
                if [[ "$status" == ${commit_mode}* ]]; then
                    commit_file "$file"
                    echo ""
                fi
            done
            ;;
        *)
            echo "Unknown mode: $commit_mode"
            echo "Usage: $0 [message] [mode]"
            echo "  Modes: all (default), individual, interactive, M, C, D, A, R"
            exit 1
            ;;
    esac

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
