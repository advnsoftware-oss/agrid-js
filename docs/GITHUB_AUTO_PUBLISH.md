# Hướng dẫn Publish Tự Động lên NPM bằng GitHub Actions

Hướng dẫn chi tiết về cách thiết lập và sử dụng GitHub Actions để tự động publish packages lên npm.

## 📋 Tổng Quan

Hệ thống publish tự động hoạt động như sau:

1. **Developer** tạo changeset và commit code
2. **Pull Request** được merge vào `main` branch
3. **GitHub Actions** tự động:
   - Kiểm tra version mới
   - Build packages
   - Publish lên npm
   - Tạo Git tags
   - Tạo GitHub releases

## 🔧 Thiết Lập Ban Đầu

### Bước 1: Tạo NPM Token

1. Đăng nhập vào [npmjs.com](https://www.npmjs.com)
2. Vào **Settings** → **Access Tokens** → **Generate New Token**
3. Chọn loại token:
   - **Automation** (khuyến nghị) - cho CI/CD
   - **Publish** - chỉ để publish packages
4. Copy token (chỉ hiển thị 1 lần!)

### Bước 2: Thêm NPM Token vào GitHub Secrets

1. Vào repository trên GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Thêm secret:
   - **Name**: `NPM_TOKEN`
   - **Value**: Token bạn vừa copy
5. Click **Add secret**

### Bước 3: Kiểm Tra Workflow Files

Đảm bảo các file sau tồn tại:

- `.github/workflows/release.yml` - Workflow chính
- `.github/actions/release/action.yaml` - Custom action để publish

## 🆕 Publish Lần Đầu (First Publish)

### Trường Hợp Đặc Biệt: Package Chưa Tồn Tại Trên NPM

Khi publish package lần đầu tiên (hoặc sau khi bị unpublish), có một số điểm cần lưu ý:

#### Bước 1: Kiểm Tra Package Đã Tồn Tại Chưa

```bash
# Kiểm tra package có tồn tại trên npm không
npm view agrid-js

# Nếu package chưa tồn tại, bạn sẽ thấy lỗi 404
# Nếu package đã bị unpublish, cũng sẽ thấy lỗi 404
```

#### Bước 2: Đảm Bảo Package.json Đúng Cấu Hình

Kiểm tra các trường quan trọng:

```json
{
  "name": "agrid-js",
  "version": "1.0.0",  // Version hợp lệ (không được là 0.0.0)
  "publishConfig": {
    "access": "public"  // Bắt buộc cho scoped packages hoặc public packages
  },
  "description": "...",
  "repository": {
    "type": "git",
    "url": "https://github.com/agrid/agrid-js.git"
  },
  "files": ["dist/**", "lib/**"]  // Chỉ định files sẽ publish
}
```

#### Bước 3: Build Package

```bash
# Build package
pnpm --filter=agrid-js build

# Kiểm tra build output tồn tại
ls -la packages/browser/dist/
```

#### Bước 4: Test Publish (Dry-Run)

```bash
# Test publish mà không thực sự publish
pnpm publish --filter=agrid-js --dry-run --access public --no-git-checks
```

**Lưu ý:** Flag `--no-git-checks` cần thiết khi package chưa tồn tại trên npm để tránh lỗi `ERR_PNPM_NO_VERSIONS`.

#### Bước 5: Publish Lần Đầu

**Cách 1: Publish Thủ Công (Khuyến Nghị cho First Publish)**

```bash
# Publish với flag --no-git-checks
pnpm publish --filter=agrid-js --access public --no-git-checks
```

**Cách 2: Sử Dụng GitHub Actions**

Cần cập nhật workflow để handle first publish:

1. **Cập nhật `.github/actions/release/action.yaml`:**

```yaml
- name: Publish package to NPM
  shell: bash
  run: |
    # Kiểm tra package đã tồn tại chưa
    if npm view ${{ inputs.package_name }} version > /dev/null 2>&1; then
      # Package đã tồn tại, publish bình thường
      pnpm publish --filter=${{ inputs.package_name }} --access public
    else
      # Package chưa tồn tại, dùng --no-git-checks
      pnpm publish --filter=${{ inputs.package_name }} --access public --no-git-checks
    fi
  env:
    NODE_AUTH_TOKEN: ${{ inputs.npm_token }}
```

2. **Hoặc đơn giản hơn, luôn dùng `--no-git-checks`:**

```yaml
- name: Publish package to NPM
  shell: bash
  run: |
    pnpm publish --filter=${{ inputs.package_name }} --access public --no-git-checks
  env:
    NODE_AUTH_TOKEN: ${{ inputs.npm_token }}
```

#### Bước 6: Xác Nhận Đã Publish

```bash
# Kiểm tra package đã có trên npm
npm view agrid-js

# Xem thông tin chi tiết
npm view agrid-js version
npm view agrid-js versions --json
```

### Lỗi Thường Gặp Khi Publish Lần Đầu

#### Lỗi: "ERR_PNPM_NO_VERSIONS - No versions available"

**Nguyên nhân:** Package chưa tồn tại trên npm, pnpm không thể check version.

**Giải pháp:**
```bash
# Thêm flag --no-git-checks
pnpm publish --filter=agrid-js --access public --no-git-checks
```

#### Lỗi: "You do not have permission to publish"

**Nguyên nhân:**
- Chưa đăng nhập npm
- Token không có quyền publish
- Chưa verify email với npm (bắt buộc cho first publish)

**Giải pháp:**
```bash
# 1. Đăng nhập
npm login

# 2. Verify email (kiểm tra email từ npm)
# 3. Kiểm tra quyền
npm whoami
npm access list packages
```

#### Lỗi: "Package name already exists"

**Nguyên nhân:** Tên package đã được sử dụng bởi người khác.

**Giải pháp:**
- Đổi tên package trong `package.json`
- Hoặc sử dụng scoped package: `@agrid/package-name`

### Checklist Cho First Publish

- [ ] Package name chưa tồn tại trên npm
- [ ] `package.json` có `publishConfig.access: "public"`
- [ ] Version hợp lệ (không phải 0.0.0)
- [ ] Build output tồn tại (`dist/` hoặc `lib/`)
- [ ] Đã đăng nhập npm và verify email
- [ ] Có quyền publish package
- [ ] Test với `--dry-run` thành công
- [ ] Sử dụng `--no-git-checks` flag nếu cần

## 🚀 Quy Trình Publish Tự Động (Sau First Publish)

### Phương Pháp 1: Sử Dụng Changesets (Khuyến Nghị)

#### Bước 1: Tạo Changeset

Trước khi commit, tạo changeset:

```bash
pnpm changeset
```

CLI sẽ hỏi:
1. **Which packages would you like to include?**
   - Chọn package(s) bị ảnh hưởng (ví dụ: `agrid-js`)
2. **What kind of change is this?**
   - `major` - Breaking changes (1.0.0 → 2.0.0)
   - `minor` - New features (1.0.0 → 1.1.0)
   - `patch` - Bug fixes (1.0.0 → 1.0.1)
3. **Please enter a summary for this change**
   - Mô tả ngắn gọn về thay đổi

**Ví dụ:**
```
? Which packages would you like to include? agrid-js
? What kind of change is this? minor
? Please enter a summary for this change: Add new e-commerce tracking methods
```

File changeset sẽ được tạo trong `.changesets/` directory.

#### Bước 2: Commit và Push

```bash
git add .
git commit -m "feat: add e-commerce tracking"
git push origin your-branch
```

#### Bước 3: Tạo Pull Request

1. Tạo PR trên GitHub
2. **Quan trọng**: Thêm label `release` vào PR
3. Đợi CI checks pass
4. Merge PR vào `main`

#### Bước 4: Tự Động Publish

Sau khi merge, GitHub Actions sẽ tự động:

1. ✅ Kiểm tra version mới (sử dụng `check-package-version` action)
2. ✅ Update version trong `package.json` (nếu dùng changesets)
3. ✅ Update CHANGELOG.md
4. ✅ Build packages
5. ✅ Publish lên npm
6. ✅ Tạo Git tag (ví dụ: `agrid-js@1.293.0`)
7. ✅ Tạo GitHub release

### Phương Pháp 2: Publish Thủ Công (Manual Version Update)

Nếu không dùng changesets, bạn có thể update version thủ công:

#### Bước 1: Update Version

```bash
# Cách 1: Sử dụng npm version
cd packages/browser
npm version patch  # hoặc minor, major

# Cách 2: Chỉnh sửa trực tiếp trong package.json
# "version": "1.293.0"
```

#### Bước 2: Commit và Push

```bash
git add packages/browser/package.json
git commit -m "chore: bump version to 1.293.0"
git push origin main
```

#### Bước 3: Tự Động Publish

Workflow sẽ tự động detect version mới và publish.

## 📁 Cấu Trúc Workflow

### File: `.github/workflows/release.yml`

Workflow này chạy khi có push vào `main` branch:

```yaml
on:
  push:
    branches:
      - main
```

**Các bước chính:**
1. Checkout code
2. Setup environment
3. Get package path
4. **Check version** - So sánh version trong code vs npm
5. **Publish** - Chỉ publish nếu có version mới
6. **Create release** - Tạo GitHub release

### File: `.github/actions/release/action.yaml`

Custom action thực hiện:
- Build package
- Tạo Git tag
- Publish lên npm
- Push tag
- Tạo GitHub release

## 🔍 Kiểm Tra Trạng Thái

### Xem Workflow Runs

1. Vào repository trên GitHub
2. Click tab **Actions**
3. Chọn workflow **Release**
4. Xem logs của từng step

### Kiểm Tra NPM

```bash
# Xem version mới nhất trên npm
npm view agrid-js version

# Xem tất cả versions
npm view agrid-js versions --json
```

### Kiểm Tra GitHub Releases

1. Vào repository → **Releases**
2. Xem release mới được tạo

## ⚙️ Cấu Hình Nâng Cao

### Publish Nhiều Packages

Workflow sử dụng matrix strategy để publish nhiều packages:

```yaml
strategy:
  matrix:
    package:
      - name: agrid-js
      - name: agrid-js-lite
      - name: agrid-node
      - name: "@agrid/core"
      - name: "@agrid/react"
```

### Điều Kiện Publish

Workflow chỉ publish khi:
- Version trong `package.json` > version trên npm
- Package có thay đổi trong commit

### Custom Release Notes

Release notes được lấy từ CHANGELOG.md:

```bash
# Workflow tự động đọc phần đầu tiên của CHANGELOG.md
LAST_CHANGELOG_ENTRY=$(awk '/^## /{if (flag) exit; flag=1} flag' CHANGELOG.md)
```

## 🐛 Troubleshooting

### Lỗi: "NPM_TOKEN not found"

**Nguyên nhân:** Secret chưa được set trong GitHub

**Giải pháp:**
1. Vào **Settings** → **Secrets and variables** → **Actions**
2. Kiểm tra `NPM_TOKEN` đã được thêm chưa
3. Đảm bảo tên secret đúng: `NPM_TOKEN` (chữ hoa)

### Lỗi: "You do not have permission to publish"

**Nguyên nhân:** Token không có quyền publish

**Giải pháp:**
1. Tạo token mới với quyền **Automation** hoặc **Publish**
2. Update secret `NPM_TOKEN` trong GitHub
3. Kiểm tra bạn có quyền publish package:
   ```bash
   npm access list packages
   ```

### Lỗi: "Package version already exists"

**Nguyên nhân:** Version đã tồn tại trên npm

**Giải pháp:**
- Tăng version trong `package.json`
- Hoặc publish với tag khác: `--tag beta`

### Workflow Không Chạy

**Kiểm tra:**
1. Workflow file có đúng path không: `.github/workflows/release.yml`
2. Trigger có đúng không: `push` vào `main`
3. File có syntax error không: Check YAML syntax

### Version Không Được Detect

**Nguyên nhân:** `check-package-version` action không detect được version mới

**Giải pháp:**
- Đảm bảo version trong `package.json` đã được update
- Kiểm tra package name trong matrix có đúng không

## 📝 Best Practices

### 1. Luôn Test Trước Khi Merge

```bash
# Build và test local
pnpm build
pnpm test

# Kiểm tra package
pnpm pack
```

### 2. Sử Dụng Changesets

Luôn tạo changeset để quản lý version tự động và CHANGELOG.

### 3. Review Code Trước Khi Merge

Đảm bảo code đã được review và tests pass trước khi merge.

### 4. Kiểm Tra CHANGELOG

Đảm bảo CHANGELOG.md được update đúng cách.

### 5. Không Publish Từ Local

Nên để GitHub Actions tự động publish sau khi merge PR.

## 🔐 Bảo Mật

### NPM Token

- ✅ **Nên**: Lưu token trong GitHub Secrets
- ✅ **Nên**: Sử dụng Automation token cho CI/CD
- ❌ **Không nên**: Commit token vào code
- ❌ **Không nên**: Share token công khai

### Package Access

- Chỉ những người có quyền mới có thể publish
- Kiểm tra quyền: `npm access list packages`

## 📊 Monitoring

### Xem Lịch Sử Publish

```bash
# Xem tất cả versions đã publish
npm view agrid-js versions --json

# Xem thông tin version cụ thể
npm view agrid-js@1.292.0
```

### GitHub Actions Logs

Xem logs chi tiết trong tab **Actions** để debug nếu có lỗi.

## 🎯 Checklist Trước Khi Publish

- [ ] Code đã được review và merge
- [ ] Tests đã pass
- [ ] Build thành công
- [ ] Changeset đã được tạo (nếu dùng)
- [ ] Version đã được update
- [ ] CHANGELOG đã được update
- [ ] NPM_TOKEN đã được set trong GitHub Secrets
- [ ] Có quyền publish package
- [ ] PR có label `release` (nếu dùng changesets)

## 📚 Tài Liệu Tham Khảo

- [Changesets Documentation](https://github.com/changesets/changesets)
- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)

## 💡 Ví Dụ Thực Tế

### Ví Dụ 1: Publish Feature Mới

```bash
# 1. Tạo changeset
pnpm changeset
# Chọn: agrid-js, minor, "Add new tracking method"

# 2. Commit
git add .
git commit -m "feat: add new tracking method"
git push origin feature-branch

# 3. Tạo PR với label "release"
# 4. Merge PR
# 5. GitHub Actions tự động publish
```

### Ví Dụ 2: Publish Bug Fix

```bash
# 1. Tạo changeset
pnpm changeset
# Chọn: agrid-js, patch, "Fix memory leak in session recording"

# 2. Commit và merge
# 3. Tự động publish
```

## ❓ FAQ

**Q: Làm sao để skip publish cho một commit?**
A: Không update version trong `package.json`, workflow sẽ skip.

**Q: Có thể publish với tag khác không?**
A: Có, thêm `--tag beta` vào publish command trong workflow.

**Q: Làm sao để rollback một version?**
A: Không thể rollback trên npm, nhưng có thể publish version mới với fix.

**Q: Workflow chạy bao lâu?**
A: Thường 5-10 phút tùy vào số lượng packages và build time.

---

**Lưu ý:** Đảm bảo bạn đã cập nhật tên packages từ `posthog-*` sang `agrid-*` trong workflow files nếu cần!

