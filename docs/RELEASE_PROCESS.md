# Hướng dẫn Release Packages lên NPM

Tài liệu này hướng dẫn chi tiết quy trình release packages Agrid JS lên npmjs.com sử dụng GitHub Actions.

## Tổng quan quy trình

```
1. Tạo Changeset → 2. Tạo PR với label "release" → 3. Merge PR →
4. Auto version bump → 5. Auto publish lên npm
```

## Bước 1: Đảm bảo đã merge PR workflow updates

Trước khi release, đảm bảo PR `chore/update-workflows-for-agrid` đã được merge vào `main`.

## Bước 2: Tạo Changeset (nếu chưa có)

### 2.1. Kiểm tra changeset hiện tại

```bash
# Xem changeset đã có
ls -la .changeset/*.md

# Xem nội dung changeset
cat .changeset/fork-to-agrid-js.md
```

### 2.2. Tạo changeset mới (nếu cần)

```bash
# Chạy interactive CLI
pnpm changeset

# Hoặc tạo file thủ công trong .changeset/
```

**Format của changeset file:**
```markdown
---
"package-name": major|minor|patch
"another-package": minor
---

Mô tả thay đổi ở đây
```

## Bước 3: Tạo branch mới cho release PR

```bash
# Đảm bảo đang ở main và đã pull latest
git checkout main
git pull origin main

# Tạo branch mới
git checkout -b release/fork-to-agrid-js

# Kiểm tra changeset có trong branch chưa
git status
ls -la .changeset/*.md
```

## Bước 4: Commit changeset (nếu chưa commit)

```bash
# Nếu changeset chưa được commit
git add .changeset/
git commit -m "feat: fork posthog-js to agrid-js"
```

## Bước 5: Push branch và tạo Pull Request

```bash
# Push branch lên GitHub
git push -u origin release/fork-to-agrid-js
```

### 5.1. Tạo PR qua GitHub Web UI

1. Truy cập: https://github.com/advnsoftware-oss/agrid-js/pull/new/release/fork-to-agrid-js
2. Hoặc vào repository → Click "New Pull Request" → Chọn branch `release/fork-to-agrid-js`

### 5.2. Điền thông tin PR

**Title:**
```
feat: fork posthog-js to agrid-js
```

**Description:**
```markdown
## Summary
Fork from posthog-js to agrid-js. This is a major version bump as it's a complete rebranding and package rename.

## Changes
- Rename all packages from posthog-* to agrid-*
- Update all imports and exports
- Update documentation and configuration files

## Packages affected
- agrid-js (major)
- agrid-js-lite (major)
- agrid-node (major)
- agrid-react-native (major)
- @agrid/core (major)
- @agrid/react (major)
- @agrid/ai (major)
- @agrid/nextjs-config (major)
- @agrid/nuxt (major)

## Checklist
- [x] Changeset created
- [ ] Tests passing
- [ ] Documentation updated
```

## Bước 6: Thêm label "release"

### 6.1. Qua GitHub Web UI

1. Vào PR page
2. Ở sidebar bên phải, tìm section "Labels"
3. Click "Labels" → Tìm và chọn label **"release"**
4. Label sẽ xuất hiện trên PR

### 6.2. Qua GitHub CLI (nếu có)

```bash
gh pr edit <PR_NUMBER> --add-label release
```

## Bước 7: Xử lý Major Version Check (nếu bị block)

Nếu workflow `check-posthog-major-version.yml` block PR vì major version bump:

### Cách 1: Merge với admin override (Khuyến nghị)

1. Nếu có quyền admin, merge PR trực tiếp
2. Workflow sẽ fail nhưng PR vẫn merge được

### Cách 2: Tạm thời disable check

1. Vào Settings → Actions → General
2. Hoặc comment out check trong workflow file
3. Commit và push lại

### Cách 3: Update changeset (nếu không cần major bump)

```bash
# Xóa "agrid-js": major khỏi changeset
# Chỉ giữ lại các packages khác
```

## Bước 8: Merge PR

1. Đảm bảo PR đã có label **"release"**
2. Review code (nếu cần)
3. Click "Merge pull request"
4. Confirm merge

## Bước 9: Auto Version Bump (Tự động)

Sau khi PR được merge, workflow `label-version-bump.yml` sẽ tự động:

1. **Trigger:** Khi PR với label "release" được merge vào `main`
2. **Chạy:** `pnpm changeset version`
   - Đọc changeset files trong `.changeset/`
   - Update versions trong `package.json` của các packages
   - Update `CHANGELOG.md` files
   - Xóa changeset files đã được apply
3. **Commit:** Tự động commit với message "chore: update versions and lockfile"
4. **Push:** Tự động push vào `main`

**Xem logs:**
- Vào Actions tab trên GitHub
- Tìm workflow run "Autobump"
- Xem logs để kiểm tra versions đã được update

## Bước 10: Auto Publish (Tự động)

Sau khi version bump commit được push vào `main`, workflow `release.yml` sẽ tự động:

1. **Trigger:** Khi có push vào `main` branch
2. **Check:** Mỗi package trong matrix sẽ được check:
   - So sánh version trong `package.json` với version đã publish trên npm
   - Nếu version mới hơn → Tiến hành publish
3. **Build:** Build package
4. **Publish:** Publish lên npm với tag `latest`
5. **Tag:** Tạo git tag `package-name@version`
6. **Release:** Tạo GitHub release với changelog

**Xem logs:**
- Vào Actions tab trên GitHub
- Tìm workflow run "Release"
- Xem logs cho từng package

## Bước 11: Verify Release

### 11.1. Kiểm tra trên npm

```bash
# Kiểm tra package đã publish
npm view agrid-js version
npm view @agrid/core version
npm view agrid-node version
# ... các packages khác
```

### 11.2. Kiểm tra GitHub Releases

1. Vào: https://github.com/advnsoftware-oss/agrid-js/releases
2. Xem các releases đã được tạo
3. Kiểm tra changelog và tags

### 11.3. Kiểm tra Git Tags

```bash
# Fetch tags
git fetch --tags

# Xem tags
git tag | grep agrid-js
git tag | grep "@agrid"
```

## Troubleshooting

### Workflow không chạy sau khi merge PR

**Nguyên nhân:**
- PR không có label "release"
- Workflow bị disable
- Token không có quyền

**Giải pháp:**
1. Kiểm tra PR đã có label "release" chưa
2. Vào Settings → Actions → General → Kiểm tra workflows enabled
3. Kiểm tra GITHUB_TOKEN có quyền write

### Version bump không chạy

**Nguyên nhân:**
- Changeset file format sai
- pnpm changeset version fail

**Giải pháp:**
1. Kiểm tra format changeset file
2. Chạy thủ công: `pnpm changeset version`
3. Xem logs trong workflow run

### Package không publish

**Nguyên nhân:**
- Version không thay đổi
- NPM_TOKEN không đúng
- Build fail

**Giải pháp:**
1. Kiểm tra version trong package.json đã update chưa
2. Kiểm tra NPM_TOKEN secret trong GitHub Settings
3. Xem build logs để tìm lỗi

### Major version check block PR

**Giải pháp:**
- Merge với admin override
- Hoặc tạm thời disable check
- Hoặc update changeset để không có major bump cho agrid-js

## Quy trình đầy đủ (Tóm tắt)

```bash
# 1. Tạo branch
git checkout main
git pull origin main
git checkout -b release/fork-to-agrid-js

# 2. Đảm bảo changeset đã có
ls -la .changeset/*.md

# 3. Commit và push
git add .changeset/
git commit -m "feat: fork posthog-js to agrid-js"
git push -u origin release/fork-to-agrid-js

# 4. Tạo PR trên GitHub
# - Title: feat: fork posthog-js to agrid-js
# - Thêm label "release"
# - Merge PR

# 5. Chờ auto version bump (tự động)
# 6. Chờ auto publish (tự động)
# 7. Verify trên npm và GitHub
```

## Lưu ý quan trọng

1. **Luôn thêm label "release"** vào PR trước khi merge
2. **Changeset phải có format đúng** (YAML frontmatter)
3. **Đảm bảo NPM_TOKEN secret** đã được setup trong GitHub
4. **Kiểm tra versions** sau khi auto bump
5. **Verify publish** trên npm trước khi thông báo

## Tài liệu tham khảo

- [Changesets Documentation](https://github.com/changesets/changesets)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [NPM Publishing Guide](./PUBLISH_NPM.md)

