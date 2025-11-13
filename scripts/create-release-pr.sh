#!/bin/bash
# Script helper để tạo release PR

set -e

echo "🚀 Tạo Release PR cho Agrid JS"
echo "================================"
echo ""

# Kiểm tra đang ở main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Bạn đang ở branch: $CURRENT_BRANCH"
    read -p "Bạn có muốn checkout sang main? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git checkout main
        git pull origin main
    else
        echo "❌ Hủy. Vui lòng checkout sang main trước."
        exit 1
    fi
fi

# Pull latest
echo "📥 Pulling latest changes..."
git pull origin main

# Kiểm tra changeset
if [ ! -f .changeset/fork-to-agrid-js.md ]; then
    echo "⚠️  Không tìm thấy changeset file!"
    echo "Tạo changeset trước: pnpm changeset"
    exit 1
fi

echo "✅ Changeset file found: .changeset/fork-to-agrid-js.md"
echo ""

# Tạo branch
BRANCH_NAME="release/fork-to-agrid-js"
echo "🌿 Creating branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

# Kiểm tra changeset đã commit chưa
if git diff --quiet .changeset/; then
    echo "✅ Changeset đã được commit"
else
    echo "📝 Committing changeset..."
    git add .changeset/
    git commit -m "feat: fork posthog-js to agrid-js"
fi

# Push
echo "📤 Pushing branch..."
git push -u origin "$BRANCH_NAME"

echo ""
echo "✅ Đã tạo branch và push thành công!"
echo ""
echo "📋 CÁC BƯỚC TIẾP THEO:"
echo "1. Tạo PR tại: https://github.com/advnsoftware-oss/agrid-js/pull/new/$BRANCH_NAME"
echo "2. Thêm label 'release' vào PR"
echo "3. Merge PR"
echo "4. Chờ auto version bump và publish"
echo ""
echo "📖 Xem hướng dẫn chi tiết: docs/RELEASE_PROCESS.md"
