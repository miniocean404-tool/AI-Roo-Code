# Roo Code 开发指南

## 环境要求

- **Node.js**: 20.19.2 (使用 `.nvmrc` 或 `.tool-versions`)
- **pnpm**: 10.8.1
- **VS Code**: 1.84.0+
- **Git**: 最新版本

---

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/RooCodeInc/Roo-Code.git
cd Roo-Code
```

### 2. 安装依赖

```bash
# 使用正确的 Node 版本
nvm use  # 或 asdf install

# 安装依赖
pnpm install
```

### 3. 开发模式

#### 方式一: F5 调试 (推荐)

1. 在 VS Code 中打开项目
2. 按 `F5` 启动调试
3. 新窗口将打开，扩展已加载

**特点**:
- Webview 更改即时生效
- 扩展代码热重载
- 完整调试支持

#### 方式二: VSIX 安装

```bash
# 构建并安装
pnpm install:vsix

# 或手动步骤
pnpm vsix
code --install-extension bin/roo-cline-*.vsix
```

---

## 项目脚本

### 根目录脚本

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 打包扩展
pnpm bundle

# 生成 VSIX
pnpm vsix

# 运行测试
pnpm test

# 代码检查
pnpm lint

# 类型检查
pnpm check-types

# 格式化代码
pnpm format

# 清理构建产物
pnpm clean

# 版本管理
pnpm changeset:version
```

### 子包脚本

```bash
# 在特定包中运行
pnpm --filter @roo-code/types build
pnpm --filter @roo-code/cli dev
```

---

## 目录结构

```
Roo-Code/
├── src/                    # VS Code 扩展
│   ├── extension.ts        # 入口文件
│   ├── package.json        # 扩展清单
│   └── ...
│
├── webview-ui/             # React 前端
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── packages/               # 共享包
│   ├── types/              # 类型定义
│   ├── core/               # 核心逻辑
│   ├── cloud/              # 云服务
│   └── ...
│
├── apps/                   # 独立应用
│   ├── cli/                # CLI 版本
│   └── ...
│
└── .vscode/                # VS Code 配置
    ├── launch.json         # 调试配置
    ├── tasks.json          # 任务配置
    └── settings.json       # 工作区设置
```

---

## 调试配置

### launch.json

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Run Extension",
            "type": "extensionHost",
            "request": "launch",
            "args": [
                "--extensionDevelopmentPath=${workspaceFolder}/src"
            ],
            "outFiles": [
                "${workspaceFolder}/src/dist/**/*.js"
            ],
            "preLaunchTask": "npm: watch:bundle"
        }
    ]
}
```

### 调试技巧

1. **断点调试**: 在 `src/` 目录的 TypeScript 文件中设置断点
2. **Webview 调试**: 在扩展开发窗口中按 `Ctrl+Shift+I` 打开开发者工具
3. **输出日志**: 查看 "Roo Code" 输出通道

---

## 代码规范

### ESLint 配置

项目使用共享的 ESLint 配置:

```javascript
// eslint.config.mjs
import config from "@roo-code/config-eslint"
export default config
```

### Prettier 配置

```json
// .prettierrc.json
{
    "semi": false,
    "tabWidth": 4,
    "useTabs": true,
    "printWidth": 120
}
```

### 提交规范

使用 Husky + lint-staged:

```json
// package.json
{
    "lint-staged": {
        "*.{js,jsx,ts,tsx,json,css,md}": [
            "prettier --write"
        ]
    }
}
```

---

## 测试

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter @roo-code/types test

# 监听模式
pnpm --filter src test -- --watch

# 覆盖率报告
pnpm --filter src test -- --coverage
```

### 测试文件结构

```
src/
├── __tests__/              # 集成测试
│   ├── extension.spec.ts
│   └── ...
│
├── core/
│   └── tools/
│       └── __tests__/      # 单元测试
│           ├── ReadFileTool.spec.ts
│           └── ...
```

### 测试示例

```typescript
// src/core/tools/__tests__/ReadFileTool.spec.ts
import { describe, it, expect, vi } from "vitest"
import { executeReadFile } from "../ReadFileTool"

describe("executeReadFile", () => {
    it("should read file content", async () => {
        const mockTask = createMockTask()
        const result = await executeReadFile(mockTask, {
            path: "test.txt"
        })
        expect(result).toContain("file content")
    })

    it("should handle file not found", async () => {
        const mockTask = createMockTask()
        const result = await executeReadFile(mockTask, {
            path: "nonexistent.txt"
        })
        expect(result).toContain("Error")
    })
})
```

---

## 构建系统

### Turbo 配置

```json
// turbo.json
{
    "tasks": {
        "build": {
            "outputs": ["dist/**"],
            "dependsOn": ["^build"]
        },
        "test": {
            "dependsOn": ["@roo-code/types#build"]
        }
    }
}
```

### ESBuild 配置

```javascript
// src/esbuild.mjs
const extensionConfig = {
    bundle: true,
    format: "cjs",
    platform: "node",
    entryPoints: ["extension.ts"],
    outfile: "dist/extension.js",
    external: ["vscode", "esbuild", "global-agent"]
}
```

### Vite 配置 (Webview)

```typescript
// webview-ui/vite.config.ts
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: "../src/webview-ui",
        rollupOptions: {
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]"
            }
        }
    }
})
```

---

## 版本管理

### Changesets

```bash
# 创建变更集
pnpm changeset

# 更新版本
pnpm changeset:version

# 发布
pnpm changeset publish
```

### 变更集示例

```markdown
<!-- .changeset/happy-dogs-dance.md -->
---
"roo-cline": minor
---

Add new feature for code indexing
```

---

## 国际化

### 添加翻译

1. 在 `src/i18n/locales/` 添加翻译文件
2. 使用 `t()` 函数获取翻译

```typescript
import { t } from "../i18n"

const message = t("common.save")
```

### 翻译文件结构

```
src/i18n/locales/
├── en/
│   ├── common.json
│   ├── settings.json
│   └── ...
├── zh-CN/
│   ├── common.json
│   └── ...
└── ...
```

---

## 常见问题

### 依赖安装失败

```bash
# 清理并重新安装
pnpm clean
rm -rf node_modules
pnpm install
```

### 构建错误

```bash
# 重新构建类型包
pnpm --filter @roo-code/types build

# 然后构建其他包
pnpm build
```

### Webview 不更新

1. 在扩展开发窗口中按 `Ctrl+Shift+P`
2. 运行 "Developer: Reload Webviews"

### 调试不工作

1. 确保 `preLaunchTask` 已完成
2. 检查 `outFiles` 路径是否正确
3. 尝试重新构建: `pnpm bundle`

---

## 贡献指南

### Issue First

所有贡献必须先创建 GitHub Issue:

1. 检查现有 Issue
2. 创建新 Issue (Bug Report 或 Enhancement Request)
3. 等待分配
4. 提交 PR 并关联 Issue

### PR 流程

1. Fork 仓库
2. 创建功能分支: `git checkout -b feature/my-feature`
3. 提交更改: `git commit -m "feat: add my feature"`
4. 推送分支: `git push origin feature/my-feature`
5. 创建 Pull Request

### 提交消息格式

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**类型**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

---

## 资源链接

- **文档**: https://docs.roocode.com
- **Discord**: https://discord.gg/roocode
- **GitHub**: https://github.com/RooCodeInc/Roo-Code
- **VS Code 扩展 API**: https://code.visualstudio.com/api

---

## 相关文档

- [项目分析](./PROJECT_ANALYSIS.md) - 项目完整解析
- [架构文档](./ARCHITECTURE.md) - 整体架构
- [API 提供者](./API_PROVIDERS.md) - API 提供者详解
- [工具系统](./TOOLS.md) - 工具系统详解
