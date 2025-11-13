# Hướng dẫn Build và Publish Packages lên NPM

Tài liệu này hướng dẫn chi tiết cách build và publish các packages Agrid JS lên npmjs.com.

## Mục lục

1. [Chuẩn bị](#chuẩn-bị)
2. [Quy trình Build](#quy-trình-build)
3. [Quy trình Publish](#quy-trình-publish)
4. [Sử dụng Changesets](#sử-dụng-changesets)
5. [Publish thủ công](#publish-thủ-công)
6. [Troubleshooting](#troubleshooting)

---

## Chuẩn bị

### 1. Cài đặt dependencies

```bash
# Đảm bảo đang dùng đúng Node version
nvm use

# Cài đặt tất cả dependencies
pnpm install
```

### 2. Đăng nhập NPM

```bash
# Đăng nhập vào npm
npm login

# Hoặc sử dụng npm token
npm config set //registry.npmjs.org/:_authToken YOUR_NPM_TOKEN
```

### 3. Kiểm tra quyền truy cập

Đảm bảo bạn có quyền publish các packages sau:
- `agrid-js`
- `agrid-js-lite`
- `agrid-node`
- `agrid-react-native`
- `@agrid/core`
- `@agrid/react`
- `@agrid/ai`
- `@agrid/nextjs-config`
- `@agrid/nuxt`

Kiểm tra quyền:
```bash
npm access ls-packages
```

---

## Quy trình Build

### Build tất cả packages

```bash
# Build tất cả packages (tự động xử lý dependency order)
pnpm build
```

### Build một package cụ thể

```bash
# Build package agrid-js
pnpm --filter=agrid-js build

# Build package agrid-node
pnpm --filter=agrid-node build

# Build package @agrid/react
pnpm --filter=@agrid/react build
```

### Build với Turbo

```bash
# Build tất cả
pnpm turbo build

# Build một package và dependencies
pnpm turbo --filter=agrid-js build

# Build với cache
pnpm turbo build --force
```

### Kiểm tra build output

Sau khi build, kiểm tra thư mục `dist/` hoặc `lib/` trong mỗi package:

```bash
# Ví dụ: kiểm tra agrid-js
ls -la packages/browser/dist/

# Ví dụ: kiểm tra agrid-node
ls -la packages/node/dist/
```

---

## Quy trình Publish

### Phương pháp 1: Sử dụng Changesets (Khuyến nghị)

#### Bước 1: Tạo Changeset

Trước khi commit code, tạo changeset:

```bash
pnpm changeset
```

CLI sẽ hỏi:
1. **Which packages would you like to include?** - Chọn packages bị ảnh hưởng
2. **What kind of change is this?** - Chọn loại thay đổi:
   - `major` - Breaking changes
   - `minor` - New features (backward compatible)
   - `patch` - Bug fixes
3. **Please enter a summary for this change** - Mô tả thay đổi

Ví dụ:
```
? Which packages would you like to include? agrid-js
? What kind of change is this? minor
? Please enter a summary for this change: Add new tracking method for e-commerce
```

Changeset file sẽ được tạo trong `.changesets/` directory.

#### Bước 2: Commit và Push

```bash
git add .
git commit -m "feat: add new tracking method"
git push origin your-branch
```

#### Bước 3: Tạo Pull Request

Tạo PR và thêm label `release` để tự động publish khi merge.

#### Bước 4: Auto Publish (GitHub Actions)

Khi PR được merge vào `main`, GitHub Actions sẽ:
1. Tự động update versions
2. Update CHANGELOG files
3. Build packages
4. Publish lên npm
5. Tạo GitHub releases

### Phương pháp 2: Publish thủ công

#### Bước 1: Update version

Cập nhật version trong `package.json` của package cần publish:

```json
{
  "name": "agrid-js",
  "version": "1.293.0"  // Tăng version theo semver
}
```

#### Bước 2: Build package

```bash
# Build package cần publish
pnpm --filter=agrid-js build
```

#### Bước 3: Kiểm tra package

```bash
# Tạo tarball để kiểm tra
cd packages/browser
pnpm pack

# Kiểm tra nội dung
tar -tzf agrid-js-1.293.0.tgz | head -20
```

#### Bước 4: Publish

```bash
# Publish từ root
pnpm publish --filter=agrid-js --access public

# Hoặc publish từ package directory
cd packages/browser
npm publish --access public
```

#### Bước 5: Tạo Git tag

```bash
git tag -a "agrid-js@1.293.0" -m "Release agrid-js@1.293.0"
git push origin "agrid-js@1.293.0"
```

---

## Sử dụng Changesets

### Cấu hình Changesets

File `.changesets/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@2.3.1/schema.json",
  "changelog": "@changesets/changelog-github",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### Tạo Changeset

```bash
pnpm changeset
```

### Xem preview changesets

```bash
# Xem changesets đã tạo
ls -la .changesets/

# Preview version bumps
pnpm changeset version --dry-run
```

### Apply changesets

```bash
# Apply changesets và update versions
pnpm changeset version

# Commit changes
git add .
git commit -m "chore: version packages"
```

### Publish với changesets

```bash
# Publish packages đã được version
pnpm changeset publish
```

---

## Publish thủ công

### Publish một package

```bash
# Từ root directory
pnpm publish --filter=agrid-js --access public

# Với tag (beta, alpha, etc.)
pnpm publish --filter=agrid-js --access public --tag beta
```

### Publish tất cả packages đã thay đổi

```bash
# Publish tất cả packages có version mới
pnpm changeset publish
```

### Publish với dry-run

```bash
# Kiểm tra trước khi publish thật
pnpm publish --filter=agrid-js --dry-run
```

### Publish từ package directory

```bash
cd packages/browser
npm publish --access public
```

---

## Quy trình đầy đủ (Step-by-step)

### Ví dụ: Publish agrid-js version mới

#### 1. Chuẩn bị

```bash
# Đảm bảo code đã được commit
git status

# Pull latest changes
git pull origin main

# Cài đặt dependencies
pnpm install
```

#### 2. Tạo Changeset

```bash
pnpm changeset
# Chọn: agrid-js
# Chọn: minor (hoặc major/patch)
# Nhập: "Add new e-commerce tracking features"
```

#### 3. Build và Test

```bash
# Build package
pnpm --filter=agrid-js build

# Chạy tests
pnpm --filter=agrid-js test:unit

# Kiểm tra lint
pnpm --filter=agrid-js lint
```

#### 4. Commit và Push

```bash
git add .
git commit -m "feat: add new e-commerce tracking features"
git push origin your-branch
```

#### 5. Tạo Pull Request

- Tạo PR trên GitHub
- Thêm label `release`
- Đợi CI pass
- Merge PR

#### 6. Auto Publish (GitHub Actions)

Sau khi merge, GitHub Actions sẽ tự động:
- Update version
- Build packages
- Publish lên npm
- Tạo GitHub release

### Publish thủ công (nếu cần)

Nếu cần publish thủ công:

```bash
# 1. Update version trong package.json
# 2. Build
pnpm --filter=agrid-js build

# 3. Publish
pnpm publish --filter=agrid-js --access public

# 4. Tag
git tag -a "agrid-js@1.293.0" -m "Release agrid-js@1.293.0"
git push origin "agrid-js@1.293.0"
```

---

## Versioning

### Semantic Versioning (Semver)

- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes

### Kiểm tra version hiện tại

```bash
# Xem version của một package
cat packages/browser/package.json | grep version

# Hoặc
pnpm list --filter=agrid-js --depth=0
```

### Update version

```bash
# Sử dụng npm version
cd packages/browser
npm version patch  # hoặc minor, major

# Hoặc chỉnh sửa trực tiếp trong package.json
```

---

## NPM Token và Authentication

### Tạo NPM Token

1. Đăng nhập vào [npmjs.com](https://www.npmjs.com)
2. Vào **Access Tokens** → **Generate New Token**
3. Chọn **Automation** hoặc **Publish**
4. Copy token

### Sử dụng Token

```bash
# Cách 1: Login
npm login

# Cách 2: Sử dụng token
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN

# Cách 3: Environment variable
export NPM_TOKEN=your_token_here
```

### Kiểm tra authentication

```bash
npm whoami
```

---

## Best Practices

### 1. Luôn test trước khi publish

```bash
# Build và test
pnpm build
pnpm test

# Kiểm tra package
pnpm pack
```

### 2. Sử dụng Changesets

Luôn tạo changeset trước khi commit để quản lý version tự động.

### 3. Kiểm tra CHANGELOG

Đảm bảo CHANGELOG được update đúng cách.

### 4. Tag releases

Luôn tạo Git tag sau khi publish.

### 5. Không publish từ local

Nên để GitHub Actions tự động publish sau khi merge PR.

---

## Troubleshooting

### Lỗi: "You do not have permission to publish"

**Giải pháp:**
```bash
# Kiểm tra quyền
npm access ls-packages

# Yêu cầu quyền từ package owner
npm owner add your-username agrid-js
```

### Lỗi: "Package version already exists"

**Giải pháp:**
- Tăng version trong `package.json`
- Hoặc publish với tag khác: `--tag beta`

### Lỗi: "Build failed"

**Giải pháp:**
```bash
# Clean và rebuild
pnpm clean
pnpm install
pnpm build
```

### Lỗi: "Changeset not found"

**Giải pháp:**
```bash
# Tạo changeset mới
pnpm changeset
```

### Lỗi: "NPM_TOKEN not set"

**Giải pháp:**
- Đảm bảo NPM_TOKEN được set trong GitHub Secrets
- Hoặc set local: `export NPM_TOKEN=your_token`

---

## GitHub Actions Workflow

### Release Workflow

File `.github/workflows/release.yml` tự động:
1. Detect version changes
2. Build packages
3. Publish to npm
4. Create GitHub releases

### Manual Trigger

Có thể trigger thủ công từ GitHub Actions tab.

---

## Checklist trước khi Publish

- [ ] Code đã được review và merge
- [ ] Tests đã pass
- [ ] Build thành công
- [ ] Version đã được update
- [ ] CHANGELOG đã được update
- [ ] Changeset đã được tạo (nếu dùng changesets)
- [ ] NPM token đã được set
- [ ] Có quyền publish package

---

## Tài liệu tham khảo

- [Changesets Documentation](https://github.com/changesets/changesets)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [RELEASING.md](../RELEASING.md)

---

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra [Troubleshooting](#troubleshooting)
2. Xem [GitHub Issues](https://github.com/agrid/agrid-js/issues)
3. Liên hệ team phát triển

