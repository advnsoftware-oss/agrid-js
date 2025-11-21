# Quick Start: Publish agrid-react-native

## Bước 1: Đăng nhập NPM

```bash
npm login
```

## Bước 2: Test package locally (Khuyến nghị)

```bash
./test-publish.sh
```

Sau đó test tarball trong demo_agrid:

```bash
cd /Users/hieu/Downloads/Projects/react-native/demo_agrid
npm install /Users/hieu/Downloads/Projects/react-native/posthog-js/packages/agrid-react-native/hieunguyen2025-agrid-react-native-*.tgz
```

## Bước 3: Publish lên NPM

### Cách 1: Sử dụng script tự động (Khuyến nghị)

```bash
# Patch version (4.12.0 -> 4.12.1) - cho bug fixes
./publish.sh patch

# Minor version (4.12.0 -> 4.13.0) - cho features mới
./publish.sh minor

# Major version (4.12.0 -> 5.0.0) - cho breaking changes
./publish.sh major
```

### Cách 2: Thủ công

```bash
# Clean và build
npm run clean
npm run build

# Bump version
npm version patch  # hoặc minor, major

# Publish
npm publish --access public

# Push git tags
git push --follow-tags
```

## Kiểm tra sau khi publish

```bash
# Xem thông tin package trên npm
npm view @agrid/agrid-react-native

# Hoặc truy cập
# https://www.npmjs.com/package/@agrid/agrid-react-native
```

## Lưu ý quan trọng

1. **Package name**: `@agrid/agrid-react-native` (scoped package)

2. **Đã fix dependencies**: 
   - ✅ `@posthog/core`: `workspace:*` → `^1.5.3`
   - ✅ Đã xóa các workspace tooling dependencies
   - ✅ Đã thay thế `catalog:` dependencies

3. **Version hiện tại**: `4.12.1`

4. **Cài đặt**: Người dùng sẽ cài đặt bằng:
   ```bash
   npm install @agrid/agrid-react-native
   ```
   
   Nhưng import trong code vẫn là:
   ```tsx
   import { AgridProvider } from 'agrid-react-native'
   ```

## Troubleshooting

### "You do not have permission to publish"
- Kiểm tra: `npm whoami`
- Đảm bảo đã login với tài khoản có quyền publish

### "Package name already exists"
- Đổi tên trong `package.json`
- Hoặc dùng scoped package: `@your-org/agrid-react-native`

### Build errors
- Đảm bảo đã cài đủ dependencies: `npm install`
- Kiểm tra TypeScript config
- Xem log chi tiết trong terminal

## Xem thêm

- [PUBLISH.md](./PUBLISH.md) - Hướng dẫn chi tiết đầy đủ
- [README.md](./README.md) - Tài liệu sử dụng thư viện
