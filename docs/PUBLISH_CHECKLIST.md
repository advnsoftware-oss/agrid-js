# Checklist chuẩn bị Publish lên NPM

Tài liệu này liệt kê tất cả các bước và kiểm tra cần thiết trước khi publish packages lên npm.

## ✅ Đã hoàn thành

### 1. Package Names
- ✅ `agrid-js` - Main browser SDK
- ✅ `agrid-js-lite` - Lightweight browser SDK
- ✅ `agrid-node` - Node.js SDK
- ✅ `agrid-react-native` - React Native SDK
- ✅ `@agrid/core` - Core functionality
- ✅ `@agrid/react` - React components
- ✅ `@agrid/nuxt` - Nuxt module
- ✅ `@agrid/nextjs-config` - Next.js config
- ✅ `@agrid/ai` - AI integrations

### 2. Package.json Updates
Tất cả packages đã được cập nhật với:
- ✅ **name** - Đã đổi sang agrid-*
- ✅ **description** - Mô tả rõ ràng, không còn "PostHog"
- ✅ **repository** - Đã cập nhật sang `github.com/agrid/agrid-js`
- ✅ **author** - Thông tin Agrid đầy đủ
- ✅ **homepage** - Links đến agrid.com/docs
- ✅ **keywords** - Keywords phù hợp cho npm search
- ✅ **publishConfig** - `"access": "public"` để publish public packages
- ✅ **license** - MIT (hoặc đúng license)
- ✅ **files** - Đã chỉ định files nào được publish

### 3. Configuration Files
- ✅ `.changeset/config.json` - Đã cập nhật `access: "public"` và repo
- ✅ Root `package.json` - Đã có `"private": true` (không publish root)

## 📋 Checklist trước khi Publish

### Pre-Publish Checks

#### 1. Build & Test
```bash
# Build tất cả packages
pnpm build

# Test tất cả packages
pnpm test:unit

# Lint check
pnpm lint
```

#### 2. Kiểm tra Package Contents
```bash
# Tạo tarball để kiểm tra
pnpm package

# Kiểm tra nội dung một package
cd packages/browser
pnpm pack
tar -tzf agrid-js-*.tgz | head -20
```

#### 3. NPM Authentication
```bash
# Đăng nhập npm
npm login

# Kiểm tra đã đăng nhập
npm whoami

# Kiểm tra quyền publish
npm access ls-packages
```

#### 4. Version Check
```bash
# Kiểm tra version hiện tại
cat packages/browser/package.json | grep version

# Đảm bảo version chưa tồn tại trên npm
npm view agrid-js version
```

#### 5. Dependencies Check
```bash
# Đảm bảo workspace dependencies đúng
# Các packages nên dùng workspace:* trong dev
# Và version cụ thể hoặc ^ trong dependencies khi publish
```

### Publish Process

#### Option 1: Sử dụng Changesets (Khuyến nghị)

1. **Tạo Changeset**
   ```bash
   pnpm changeset
   ```
   - Chọn packages cần publish
   - Chọn version bump (major/minor/patch)
   - Nhập mô tả

2. **Commit và Push**
   ```bash
   git add .
   git commit -m "feat: your changes"
   git push origin your-branch
   ```

3. **Tạo PR với label `release`**
   - GitHub Actions sẽ tự động publish khi merge

#### Option 2: Publish thủ công

1. **Update Version**
   ```bash
   # Tăng version trong package.json
   # Hoặc dùng npm version
   cd packages/browser
   npm version patch  # hoặc minor, major
   ```

2. **Build**
   ```bash
   pnpm --filter=agrid-js build
   ```

3. **Publish**
   ```bash
   pnpm publish --filter=agrid-js --access public
   ```

4. **Tag và Push**
   ```bash
   git tag -a "agrid-js@1.293.0" -m "Release agrid-js@1.293.0"
   git push origin "agrid-js@1.293.0"
   ```

## 🔍 Verification sau khi Publish

### 1. Kiểm tra trên npm
```bash
# Xem package đã được publish
npm view agrid-js

# Xem version mới nhất
npm view agrid-js version

# Xem tất cả versions
npm view agrid-js versions
```

### 2. Test Installation
```bash
# Test install package mới
npm install agrid-js@latest

# Hoặc test trong project khác
cd /tmp
mkdir test-agrid
cd test-agrid
npm init -y
npm install agrid-js
```

### 3. Kiểm tra Package Contents
```bash
# Xem files được publish
npm view agrid-js dist.tarball
curl -L $(npm view agrid-js dist.tarball) | tar -tzf - | head -20
```

## ⚠️ Lưu ý quan trọng

### 1. Version Management
- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### 2. Dependencies
- Đảm bảo `workspace:*` dependencies được resolve đúng khi publish
- Kiểm tra `peerDependencies` đã đúng
- Đảm bảo không có dependencies bị thiếu

### 3. Files Field
- Chỉ định rõ files nào được publish trong `files` field
- Không publish source code không cần thiết
- Đảm bảo `dist/` hoặc build output được include

### 4. Scoped Packages
- Packages với scope `@agrid/*` cần `publishConfig.access: "public"`
- Đảm bảo có quyền publish scoped packages

### 5. First Time Publish
- Packages mới cần đảm bảo tên chưa tồn tại trên npm
- Kiểm tra namespace/scope đã được tạo chưa
- Có thể cần verify email với npm

## 🚨 Troubleshooting

### Lỗi: "You do not have permission"
```bash
# Kiểm tra quyền
npm access ls-packages

# Yêu cầu quyền từ owner
npm owner add your-username agrid-js
```

### Lỗi: "Package version already exists"
- Tăng version trong package.json
- Hoặc publish với tag khác: `--tag beta`

### Lỗi: "Invalid package name"
- Kiểm tra tên package đúng format
- Scoped packages: `@agrid/package-name`
- Unscoped: `agrid-package-name`

### Lỗi: "Missing files"
- Kiểm tra `files` field trong package.json
- Đảm bảo build output tồn tại
- Chạy `pnpm build` trước khi publish

## 📝 Package.json Template

Một package.json chuẩn để publish:

```json
{
  "name": "agrid-js",
  "version": "1.0.0",
  "description": "Clear description of the package",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "src",
    "!src/__tests__"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/agrid/agrid-js.git",
    "directory": "packages/browser"
  },
  "author": {
    "name": "Agrid",
    "email": "hey@agrid.com",
    "url": "https://agrid.com"
  },
  "license": "MIT",
  "homepage": "https://github.com/advnsoftware-oss/agrid-js#readme",
  "keywords": [
    "agrid",
    "analytics"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

## ✅ Final Checklist

Trước khi publish, đảm bảo:

- [ ] Tất cả packages đã được build thành công
- [ ] Tests đã pass
- [ ] Lint không có lỗi
- [ ] Version đã được update
- [ ] CHANGELOG đã được update (nếu có)
- [ ] Description và metadata đã đúng
- [ ] Repository URLs đã đúng
- [ ] Author information đã đúng
- [ ] Keywords phù hợp
- [ ] `publishConfig.access: "public"` đã có
- [ ] `files` field đã chỉ định đúng
- [ ] NPM đã đăng nhập
- [ ] Có quyền publish packages
- [ ] Đã test install package locally

---

Xem [PUBLISH_NPM.md](./PUBLISH_NPM.md) để biết hướng dẫn chi tiết.

