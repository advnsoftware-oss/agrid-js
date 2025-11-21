#!/bin/bash

# Script để thay thế PostHog thành Agrid trong test files

find test -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.spec.ts" \) | while read file; do
    echo "Processing: $file"
    
    # Thay thế PostHog -> Agrid
    sed -i '' 's/PostHog/Agrid/g' "$file"
    
    # Thay thế posthog -> agrid
    sed -i '' 's/posthog/agrid/g' "$file"
    
    # Khôi phục lại @posthog/core
    sed -i '' 's/@agrid\/core/@posthog\/core/g' "$file"
    
    # Khôi phục lại posthog-react-native-session-replay
    sed -i '' 's/agrid-react-native-session-replay/posthog-react-native-session-replay/g' "$file"
done

echo "Done!"
