#!/bin/bash

# Create a new feature
# Usage: ./create-new-feature.sh <feature description> <short-name> <number>

FEATURE_DESCRIPTION="$1"
SHORT_NAME="$2"
NUMBER="$3"

if [ -z "$FEATURE_DESCRIPTION" ] || [ -z "$SHORT_NAME" ] || [ -z "$NUMBER" ]; then
    echo "Usage: $0 \"<feature description>\" <short-name> <number>"
    exit 1
fi

# Create the branch name
BRANCH_NAME="${NUMBER}-${SHORT_NAME}"

# Create the spec directory if it doesn't exist
SPEC_DIR="specs/$BRANCH_NAME"
mkdir -p "$SPEC_DIR"

# Create the spec file
SPEC_FILE="$SPEC_DIR/spec.md"

# Create the history/prompts directory
mkdir -p "history/prompts/$BRANCH_NAME"

# Output the branch name and spec file path in JSON format
cat <<EOF
{
    "BRANCH_NAME": "$BRANCH_NAME",
    "SPEC_FILE": "$SPEC_FILE",
    "FEATURE_NUM": "$NUMBER",
    "HAS_GIT": true
}
EOF