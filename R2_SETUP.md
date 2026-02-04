# Cloudflare R2 图片存储配置指南

本指南将帮助你配置 Cloudflare R2 用于论坛图片存储。

## 1. 创建 R2 Bucket

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 选择你的账号，进入 **R2 Object Storage**
3. 点击 **Create bucket**
4. 输入 bucket 名称: `dongdong-assets`
5. 选择区域（推荐选择离你用户最近的区域）
6. 点击 **Create bucket**

## 2. 配置公开访问（可选）

如果你希望图片可以公开访问，有两种方式：

### 方式 A: 使用 R2.dev 子域名（简单）

1. 在 R2 bucket 设置中，点击 **Settings**
2. 找到 **Public access** 部分
3. 点击 **Allow Access**
4. 复制生成的 R2.dev URL（例如：`https://pub-xxx.r2.dev`）
5. 更新 `wrangler.toml` 中的 `R2_PUBLIC_URL`

### 方式 B: 使用自定义域名（需要买自己的域名）

1. 在 R2 bucket 设置中，点击 **Settings** → **Custom Domains**
2. 点击 **Connect Domain**
3. 输入你的域名（例如：`assets.dongdong.dev`）
4. 按照提示完成 DNS 配置
5. 更新 `wrangler.toml` 中的 `R2_PUBLIC_URL`

## 3. 更新环境配置

编辑 `wrangler.toml`:

```toml
# R2 存储桶配置
[[r2_buckets]]
binding = "ASSETS"
bucket_name = "dongdong-assets"
preview_bucket_name = "dongdong-assets"

# 环境变量
# 注意：本地开发时不设置 R2_PUBLIC_URL，让代码自动使用本地图片服务
# 生产环境必须设置 R2_PUBLIC_URL

[env.production]
vars = { R2_PUBLIC_URL = "https://pub-e05511feedde4cf6ae01d294d19a978b.r2.dev" }
```

## 4. 运行数据库迁移

由于添加了新的 `images` 字段到 `forum_posts` 和 `forum_comments` 表：

```bash
# 生成迁移文件
npx drizzle-kit generate

# 应用迁移到本地数据库
npx wrangler d1 migrations apply dongdong-db --local

# 应用迁移到生产数据库
npx wrangler d1 migrations apply dongdong-db
```

## 5. 本地测试

```bash
# 启动本地开发服务器
npm run dev

# 在另一个终端启动 Workers
cd workers
npx wrangler dev
```

## 6. 部署到生产环境

```bash
# 部署 Workers（包含 R2 配置）
cd workers
npx wrangler deploy

# 部署 Next.js 前端
npm run build
# 根据你的托管平台部署
```

## 7. 配置 CORS（如果需要）

如果遇到跨域问题，在 R2 bucket 设置中配置 CORS：

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "DELETE"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 8. 成本预估

Cloudflare R2 定价（2024年）：
- 存储: $0.015/GB/月
- 操作: Class A（写）$4.50/百万次，Class B（读）$0.36/百万次
- 免费额度: 10 GB 存储 + 100万次 Class A 操作

对于小型论坛，月成本通常在 $1-5 之间。

## 常见问题

### Q: 图片上传失败？
A: 检查：
1. R2 bucket 是否正确创建
2. `wrangler.toml` 中的 binding 是否正确
3. Workers 是否有权限访问 R2

### Q: 图片无法显示？
A: 检查：
1. R2 公开访问是否已启用
2. `R2_PUBLIC_URL` 是否配置正确
3. 浏览器控制台是否有 CORS 错误

### Q: 如何删除旧图片？
A: 当用户删除帖子时，图片会自动从 R2 删除。你也可以使用 R2 生命周期策略自动清理旧文件。

## 安全建议

1. **设置上传限制**: 已在代码中限制单个文件 5MB
2. **文件类型验证**: 仅允许 JPEG、PNG、WebP、GIF
3. **速率限制**: 考虑在 Workers 中添加速率限制
4. **内容审核**: 对于公开论坛，建议集成图片审核服务

## 备份策略

建议定期备份 R2 数据：

```bash
# 使用 rclone 备份
rclone sync cloudflare-r2:dongdong-images /backup/location
```

## 需要帮助？

查看 [Cloudflare R2 文档](https://developers.cloudflare.com/r2/)
