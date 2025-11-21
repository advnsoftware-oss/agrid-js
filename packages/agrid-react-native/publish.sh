#!/bin/bash

# Script để publish agrid-react-native lên npm
# Sử dụng: ./publish.sh [patch|minor|major]

set -e

echo "🚀 Bắt đầu quy trình publish agrid-react-native..."

# Kiểm tra đã login npm chưa
if ! npm whoami &> /dev/null; then
    echo "❌ Bạn chưa đăng nhập npm. Vui lòng chạy: npm login"
    exit 1
fi

echo "✅ Đã đăng nhập npm: $(npm whoami)"

# Lấy version type từ argument (mặc định là patch)
VERSION_TYPE=${1:-patch}

if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo "❌ Version type không hợp lệ. Sử dụng: patch, minor, hoặc major"
    exit 1
fi

echo "📦 Version type: $VERSION_TYPE"

# Kiểm tra git status
if [[ -n $(git status -s) ]]; then
    echo "⚠️  Có thay đổi chưa commit trong git. Bạn có muốn tiếp tục? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Hủy publish"
        exit 1
    fi
fi

# Clean
echo "🧹 Cleaning..."
npm run clean || rm -rf dist

# Build
echo "🔨 Building..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build thất bại - thư mục dist không tồn tại"
    exit 1
fi

# Test (optional - comment out nếu không cần)
# echo "🧪 Running tests..."
# npm test

# Bump version
echo "⬆️  Bumping version ($VERSION_TYPE)..."
npm version $VERSION_TYPE

# Get new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "📌 New version: $NEW_VERSION"

# Publish
echo "📤 Publishing to npm..."
npm publish --access public

echo "✅ Đã publish thành công agrid-react-native@$NEW_VERSION!"

# Push git tags
echo "🏷️  Pushing git tags..."
git push --follow-tags

echo "🎉 Hoàn thành!"
echo ""
echo "Kiểm tra package tại: https://www.npmjs.com/package/agrid-react-native"
