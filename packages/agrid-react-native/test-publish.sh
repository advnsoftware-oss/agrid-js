#!/bin/bash

# Script để test package locally trước khi publish
# Sử dụng: ./test-publish.sh

set -e

echo "🧪 Testing package locally..."

# Clean
echo "🧹 Cleaning..."
npm run clean || rm -rf dist

# Build
echo "🔨 Building..."
npm run build

# Pack
echo "📦 Creating tarball..."
npm pack

TARBALL=$(ls agrid-react-native-*.tgz | tail -n 1)

if [ -z "$TARBALL" ]; then
    echo "❌ Không tìm thấy tarball"
    exit 1
fi

echo "✅ Đã tạo: $TARBALL"
echo ""
echo "Để test package này trong project khác, chạy:"
echo "  npm install $(pwd)/$TARBALL"
echo ""
echo "Hoặc trong demo_agrid:"
echo "  cd /Users/hieu/Downloads/Projects/react-native/demo_agrid"
echo "  npm install $(pwd)/$TARBALL"
