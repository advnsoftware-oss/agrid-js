# Hướng dẫn Publish agrid-react-native lên NPM

## Chuẩn bị trước khi publish

### 1. Kiểm tra và cập nhật package.json

Trước tiên, cần fix dependency `@posthog/core` vì hiện đang dùng `workspace:*` (chỉ hoạt động trong monorepo).

**Tùy chọn A: Publish @posthog/core riêng**
Nếu bạn muốn tách hoàn toàn khỏi PostHog monorepo, cần publish `@posthog/core` trước.

**Tùy chọn B: Bundle @posthog/core vào agrid-react-native**
Đơn giản hơn - copy code của `@posthog/core` vào agrid-react-native.

**Tùy chọn C: Sử dụng @posthog/core từ npm**
Nếu @posthog/core đã có trên npm, chỉ cần thay đổi version:

```json
{
  "dependencies": {
    "@posthog/core": "^1.0.0"  // Thay workspace:* bằng version cụ thể
  }
}
```

### 2. Đăng nhập NPM

```bash
npm login
```

Nhập:
- Username
- Password
- Email
- OTP (nếu bật 2FA)

### 3. Kiểm tra tên package

Kiểm tra xem tên `agrid-react-native` đã được sử dụng chưa:

```bash
npm view agrid-react-native
```

Nếu đã tồn tại, bạn cần:
- Đổi tên package trong `package.json`
- Hoặc sử dụng scoped package: `@your-org/agrid-react-native`

### 4. Cập nhật thông tin package

Cập nhật các trường sau trong `package.json`:

```json
{
  "name": "agrid-react-native",
  "version": "1.0.0",  // Bắt đầu từ 1.0.0 cho lần publish đầu
  "description": "Agrid analytics library for React Native",
  "author": "Your Name <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/your-repo.git"
  },
  "keywords": [
    "react-native",
    "analytics",
    "agrid",
    "tracking"
  ],
  "homepage": "https://github.com/your-username/your-repo#readme",
  "bugs": {
    "url": "https://github.com/your-username/your-repo/issues"
  }
}
```

## Các bước publish

### Bước 1: Clean và Build

```bash
cd /Users/hieu/Downloads/Projects/react-native/posthog-js/packages/agrid-react-native

# Clean build cũ
pnpm clean
# hoặc
npm run clean

# Build lại
pnpm build
# hoặc
npm run build
```

### Bước 2: Test package locally (Khuyến nghị)

Trước khi publish, test package bằng cách tạo tarball:

```bash
npm pack
```

Lệnh này tạo file `agrid-react-native-1.0.0.tgz`. Bạn có thể test trong project khác:

```bash
cd /path/to/test-project
npm install /path/to/agrid-react-native-1.0.0.tgz
```

### Bước 3: Publish lên NPM

#### Publish bản public (miễn phí)

```bash
npm publish --access public
```

#### Publish bản private (cần tài khoản trả phí)

```bash
npm publish
```

### Bước 4: Xác nhận publish thành công

```bash
npm view agrid-react-native
```

## Publish các phiên bản tiếp theo

### 1. Cập nhật version

Sử dụng npm version để tự động cập nhật version:

```bash
# Patch version (1.0.0 -> 1.0.1) - cho bug fixes
npm version patch

# Minor version (1.0.0 -> 1.1.0) - cho features mới
npm version minor

# Major version (1.0.0 -> 2.0.0) - cho breaking changes
npm version major
```

### 2. Build và publish

```bash
npm run build
npm publish
```

### 3. Push git tags

```bash
git push --follow-tags
```

## Publish với CI/CD (Khuyến nghị cho production)

### Tạo GitHub Actions workflow

Tạo file `.github/workflows/publish.yml`:

```yaml
name: Publish to NPM

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Publish to NPM
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Tạo NPM token

1. Vào https://www.npmjs.com/settings/your-username/tokens
2. Tạo token mới (Automation type)
3. Copy token
4. Vào GitHub repo → Settings → Secrets → New repository secret
5. Tên: `NPM_TOKEN`, Value: token vừa copy

### Publish bằng tag

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions sẽ tự động build và publish.

## Checklist trước khi publish

- [ ] Đã test package locally
- [ ] Đã cập nhật README.md
- [ ] Đã cập nhật CHANGELOG.md
- [ ] Version number hợp lý
- [ ] Dependencies đã đúng (không có workspace:*)
- [ ] Đã build thành công
- [ ] Đã login npm
- [ ] Repository URL đã đúng
- [ ] License đã rõ ràng

## Xử lý lỗi thường gặp

### Lỗi: "You do not have permission to publish"

Kiểm tra:
- Đã login npm chưa: `npm whoami`
- Tên package đã tồn tại chưa
- Có quyền publish package này không

### Lỗi: "workspace:* dependency"

Thay thế tất cả `workspace:*` bằng version cụ thể hoặc bundle dependency vào package.

### Lỗi: "Package name too similar to existing package"

Đổi tên package hoặc sử dụng scoped package: `@agrid/agrid-react-native`

## Unpublish (Nếu cần)

**Lưu ý:** Chỉ có thể unpublish trong 72 giờ đầu và nếu không ai sử dụng.

```bash
npm unpublish @agrid/agrid-react-native@1.0.0
```

## Tài liệu tham khảo

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [NPM CLI Documentation](https://docs.npmjs.com/cli/v9/commands/npm-publish)
