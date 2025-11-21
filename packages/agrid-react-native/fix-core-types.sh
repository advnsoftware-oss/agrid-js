#!/bin/bash

# Script để sửa lại các types từ @posthog/core về tên gốc

echo "Fixing PostHog core types..."

# Tìm tất cả các file .ts, .tsx
find src test -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
    # Sửa lại các types từ @posthog/core
    sed -i '' 's/AgridCaptureOptions/PostHogCaptureOptions/g' "$file"
    sed -i '' 's/AgridCore/PostHogCore/g' "$file"
    sed -i '' 's/AgridCoreOptions/PostHogCoreOptions/g' "$file"
    sed -i '' 's/AgridEventProperties/PostHogEventProperties/g' "$file"
    sed -i '' 's/AgridFetchOptions/PostHogFetchOptions/g' "$file"
    sed -i '' 's/AgridFetchResponse/PostHogFetchResponse/g' "$file"
    sed -i '' 's/AgridPersistedProperty/PostHogPersistedProperty/g' "$file"
done

echo "Done!"
