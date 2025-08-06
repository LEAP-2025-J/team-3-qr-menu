# Git Training Guide - Complete Step-by-Step Tutorial

## Table of Contents

1. [Git Basics](#git-basics)
2. [Repository Setup](#repository-setup)
3. [Basic Operations](#basic-operations)
4. [Branching](#branching)
5. [Collaboration](#collaboration)
6. [Advanced Operations](#advanced-operations)
7. [Troubleshooting](#troubleshooting)

---

## Git Basics

### What is Git?

Git is a distributed version control system that tracks changes in your code and allows collaboration.

### Key Concepts:

- **Repository**: A folder containing your project and its version history
- **Commit**: A snapshot of your code at a specific point in time
- **Branch**: A separate line of development
- **Remote**: A copy of your repository stored on a server (like GitHub)

---

## Repository Setup

### 1. Initialize a New Repository

```bash
# Create a new directory
mkdir my-project
cd my-project

# Initialize git repository
git init
```

### 2. Clone an Existing Repository

```bash
# Clone from GitHub
git clone https://github.com/username/repository-name.git

# Clone to a specific folder
git clone https://github.com/username/repository-name.git my-folder-name
```

### 3. Configure Git (First Time Setup)

```bash
# Set your name and email
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Check your configuration
git config --list
```

---

## Basic Operations

### 1. Check Repository Status

```bash
# See current status
git status

# See commit history
git log

# See commit history (compact)
git log --oneline
```

### 2. Add Files to Staging

```bash
# Add specific file
git add filename.txt

# Add all files
git add .

# Add all files with specific extension
git add *.js
```

### 3. Commit Changes

```bash
# Commit with message
git commit -m "Your commit message"

# Add and commit in one step
git commit -am "Your commit message"
```

### 4. View Changes

```bash
# See what files have changed
git status

# See detailed changes
git diff

# See staged changes
git diff --staged
```

---

## Branching

### 1. Create and Switch Branches

```bash
# Create and switch to new branch
git checkout -b new-branch-name

# Switch to existing branch
git checkout branch-name

# List all branches
git branch

# List all branches (including remote)
git branch -a
```

### 2. Merge Branches

```bash
# Switch to target branch (usually main)
git checkout main

# Merge feature branch into main
git merge feature-branch-name

# Delete branch after merging
git branch -d feature-branch-name
```

### 3. Branch Management

```bash
# Rename current branch
git branch -m new-name

# Delete local branch
git branch -d branch-name

# Force delete branch
git branch -D branch-name
```

---

## Collaboration

### 1. Remote Repository Setup

```bash
# Add remote repository
git remote add origin https://github.com/username/repository.git

# Check remote repositories
git remote -v

# Remove remote
git remote remove origin
```

### 2. Push Changes

```bash
# Push to remote (first time)
git push -u origin branch-name

# Push to remote (subsequent times)
git push

# Push all branches
git push --all
```

### 3. Pull Changes

```bash
# Pull latest changes
git pull

# Pull from specific branch
git pull origin branch-name

# Fetch changes without merging
git fetch
```

### 4. Clone and Work with Remote

```bash
# Clone repository
git clone https://github.com/username/repository.git

# Create new branch for your work
git checkout -b your-feature-branch

# Make changes, add, commit
git add .
git commit -m "Your changes"

# Push your branch
git push -u origin your-feature-branch
```

---

## Advanced Operations

### 1. Stashing

```bash
# Save changes temporarily
git stash

# Save with description
git stash push -m "Work in progress"

# List stashes
git stash list

# Apply latest stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Drop stash
git stash drop stash@{0}
```

### 2. Rebasing

```bash
# Rebase current branch onto main
git rebase main

# Interactive rebase (last 3 commits)
git rebase -i HEAD~3
```

### 3. Cherry-picking

```bash
# Apply specific commit to current branch
git cherry-pick commit-hash
```

### 4. Reset and Revert

```bash
# Soft reset (keep changes staged)
git reset --soft HEAD~1

# Mixed reset (keep changes unstaged)
git reset HEAD~1

# Hard reset (discard changes)
git reset --hard HEAD~1

# Revert last commit
git revert HEAD
```

---

## Common Workflows

### 1. Feature Development Workflow

```bash
# 1. Update main branch
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/new-feature

# 3. Make changes and commit
git add .
git commit -m "Add new feature"

# 4. Push feature branch
git push -u origin feature/new-feature

# 5. Create Pull Request on GitHub
# 6. After approval, merge and delete branch
```

### 2. Bug Fix Workflow

```bash
# 1. Create hotfix branch
git checkout -b hotfix/bug-fix

# 2. Fix the bug
# 3. Commit fix
git add .
git commit -m "Fix bug description"

# 4. Push and create PR
git push -u origin hotfix/bug-fix
```

### 3. Release Workflow

```bash
# 1. Create release branch
git checkout -b release/v1.0.0

# 2. Make release-specific changes
# 3. Commit changes
git commit -m "Prepare release v1.0.0"

# 4. Merge to main
git checkout main
git merge release/v1.0.0

# 5. Create tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 6. Delete release branch
git branch -d release/v1.0.0
```

---

## Troubleshooting

### 1. Undo Last Commit

```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes
git reset --hard HEAD~1
```

### 2. Fix Merge Conflicts

```bash
# 1. During merge conflict, edit files
# 2. Add resolved files
git add .

# 3. Complete merge
git commit
```

### 3. Recover Deleted Branch

```bash
# Find the commit hash
git reflog

# Recreate branch
git checkout -b recovered-branch commit-hash
```

### 4. Clean Working Directory

```bash
# Remove untracked files
git clean -f

# Remove untracked files and directories
git clean -fd

# See what would be removed
git clean -n
```

---

## Best Practices

### 1. Commit Messages

- Use present tense: "Add feature" not "Added feature"
- Be descriptive but concise
- Start with a verb: Add, Fix, Update, Remove, etc.

### 2. Branch Naming

- `feature/description` for new features
- `bugfix/description` for bug fixes
- `hotfix/description` for urgent fixes
- `release/version` for releases

### 3. Regular Workflow

```bash
# Daily routine
git status                    # Check what's changed
git pull                      # Get latest changes
# ... work on your code ...
git add .                     # Stage changes
git commit -m "Description"   # Commit changes
git push                      # Push to remote
```

### 4. Before Committing

```bash
# Always check what you're committing
git status
git diff --staged

# Make sure tests pass
npm test  # or your test command
```

---

## Quick Reference

### Essential Commands

```bash
git init              # Initialize repository
git clone URL         # Clone repository
git add FILE          # Stage file
git commit -m "MSG"   # Commit changes
git push              # Push to remote
git pull              # Pull from remote
git status            # Check status
git log               # View history
git branch            # List branches
git checkout BRANCH   # Switch branch
git merge BRANCH      # Merge branch
```

### Common Patterns

```bash
# Start new feature
git checkout -b feature/new-feature
# ... work ...
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature

# Update existing feature
git pull origin main
git checkout feature/new-feature
git merge main
```

---

## Tips and Tricks

1. **Use aliases** for common commands:

   ```bash
   git config --global alias.st status
   git config --global alias.co checkout
   git config --global alias.br branch
   git config --global alias.ci commit
   ```

2. **Use .gitignore** to exclude files:

   ```bash
   # Create .gitignore file
   echo "node_modules/" >> .gitignore
   echo "*.log" >> .gitignore
   ```

3. **Use meaningful commit messages**:

   ```bash
   git commit -m "Add user authentication feature"
   git commit -m "Fix login button alignment"
   git commit -m "Update README with installation steps"
   ```

4. **Regular backups**:
   ```bash
   git push origin main  # Always push your work
   ```

---

_This guide covers the essential Git operations you'll use daily. Practice these commands regularly to become proficient with Git!_
