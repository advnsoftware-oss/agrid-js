# Quick Publish Guide - Tóm tắt nhanh

Hướng dẫn nhanh để publish packages lên npm. Xem [PUBLISH_NPM.md](./PUBLISH_NPM.md) để biết chi tiết.

## Quick Start

### 1. Tạo Changeset

```bash
pnpm changeset
```

Chọn packages và loại thay đổi (major/minor/patch).

### 2. Build

```bash
pnpm build
```

### 3. Commit và Push

```bash
git add .
git commit -m "feat: your changes"
git push origin your-branch
```

### 4. Tạo PR với label `release`

GitHub Actions sẽ tự động publish khi merge.

---

## Publish thủ công

### Publish một package

```bash
# Build
pnpm --filter=agrid-js build

# Publish
pnpm publish --filter=agrid-js --access public
```

### Publish với tag

```bash
pnpm publish --filter=agrid-js --access public --tag beta
```

---

## Kiểm tra

```bash
# Kiểm tra version
cat packages/browser/package.json | grep version

# Kiểm tra quyền npm
npm whoami

# Test build
pnpm --filter=agrid-js build
```

---

## Troubleshooting

| Lỗi | Giải pháp |
|-----|-----------|
| "You do not have permission" | `npm login` hoặc kiểm tra quyền |
| "Version already exists" | Tăng version trong package.json |
| "Build failed" | `pnpm clean && pnpm install && pnpm build` |

---

Xem [PUBLISH_NPM.md](./PUBLISH_NPM.md) để biết chi tiết đầy đủ.

