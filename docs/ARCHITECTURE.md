# Roo Code 架构文档

## 目录

- [整体架构](#整体架构)
- [目录结构详解](#目录结构详解)
- [核心模块关系](#核心模块关系)
- [数据流](#数据流)
- [扩展点](#扩展点)

---

## 整体架构

Roo Code 采用 **Monorepo + 分层架构** 设计，主要分为以下几层：

```
┌─────────────────────────────────────────────────────────────┐
│                      VS Code Extension                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    Webview UI (React)                   ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       ││
│  │  │  Chat   │ │Settings │ │ History │ │Marketplace│      ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                    WebviewMessage Protocol                   │
│                              │                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                   Extension Host                         ││
│  │  ┌───────────────┐  ┌───────────────┐  ┌─────────────┐  ││
│  │  │ ClineProvider │  │     Task      │  │  Services   │  ││
│  │  │   (Webview)   │  │   (AI Loop)   │  │  (MCP/Index)│  ││
│  │  └───────────────┘  └───────────────┘  └─────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    API Layer                             ││
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       ││
│  │  │Anthropic│ │ OpenAI  │ │ Gemini  │ │ Ollama  │ ...   ││
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     Shared Packages                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  types  │ │  core   │ │  cloud  │ │telemetry│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
└─────────────────────────────────────────────────────────────┘
```

---

## 目录结构详解

### 根目录

```
Roo-Code/
├── src/                    # VS Code 扩展主代码
├── webview-ui/             # React 前端
├── packages/               # 共享包
├── apps/                   # 独立应用
├── scripts/                # 构建脚本
├── locales/                # 多语言 README
├── releases/               # 发布截图
├── .github/                # GitHub 配置
├── .vscode/                # VS Code 工作区配置
├── .roo/                   # Roo 配置文件
└── bin/                    # 构建输出
```

### src/ - 扩展核心

```
src/
├── extension.ts            # 扩展入口
├── package.json            # 扩展清单
├── esbuild.mjs             # 构建配置
│
├── activate/               # 激活逻辑
│   ├── index.ts
│   ├── registerCommands.ts
│   ├── registerCodeActions.ts
│   ├── registerTerminalActions.ts
│   ├── CodeActionProvider.ts
│   ├── handleTask.ts
│   └── handleUri.ts
│
├── core/                   # 核心业务逻辑
│   ├── task/               # 任务管理
│   │   ├── Task.ts         # 主任务类
│   │   ├── build-tools.ts  # 工具构建
│   │   └── validateToolResultIds.ts
│   │
│   ├── webview/            # Webview 管理
│   │   ├── ClineProvider.ts
│   │   ├── webviewMessageHandler.ts
│   │   ├── getNonce.ts
│   │   └── getUri.ts
│   │
│   ├── tools/              # AI 工具实现
│   │   ├── BaseTool.ts
│   │   ├── ReadFileTool.ts
│   │   ├── WriteToFileTool.ts
│   │   ├── ExecuteCommandTool.ts
│   │   ├── ApplyDiffTool.ts
│   │   ├── BrowserActionTool.ts
│   │   └── ... (20+ 工具)
│   │
│   ├── prompts/            # 提示词系统
│   │   ├── system.ts       # 系统提示词生成
│   │   ├── tools/          # 工具描述
│   │   └── sections/       # 提示词片段
│   │
│   ├── assistant-message/  # 消息解析
│   │   ├── AssistantMessageParser.ts
│   │   ├── NativeToolCallParser.ts
│   │   └── presentAssistantMessage.ts
│   │
│   ├── context-management/ # 上下文管理
│   ├── context-tracking/   # 上下文追踪
│   ├── checkpoints/        # 检查点
│   ├── config/             # 配置管理
│   ├── diff/               # 差异策略
│   ├── ignore/             # 忽略规则
│   ├── protect/            # 保护规则
│   ├── mentions/           # @提及处理
│   ├── condense/           # 上下文压缩
│   ├── auto-approval/      # 自动批准
│   ├── message-queue/      # 消息队列
│   ├── message-manager/    # 消息管理
│   ├── environment/        # 环境信息
│   └── task-persistence/   # 任务持久化
│
├── api/                    # API 提供者
│   ├── index.ts            # 提供者工厂
│   ├── providers/          # 各提供者实现
│   │   ├── anthropic.ts
│   │   ├── openai.ts
│   │   ├── gemini.ts
│   │   ├── bedrock.ts
│   │   └── ... (30+ 提供者)
│   └── transform/          # 格式转换
│       ├── stream.ts
│       ├── openai-format.ts
│       ├── gemini-format.ts
│       └── caching/
│
├── services/               # 服务层
│   ├── mcp/                # MCP 服务
│   │   ├── McpHub.ts
│   │   └── McpServerManager.ts
│   ├── code-index/         # 代码索引
│   ├── browser/            # 浏览器服务
│   ├── checkpoints/        # 检查点服务
│   ├── command/            # 命令服务
│   ├── search/             # 搜索服务
│   ├── ripgrep/            # Ripgrep 集成
│   ├── glob/               # Glob 匹配
│   ├── tree-sitter/        # 代码解析
│   ├── skills/             # 技能管理
│   ├── marketplace/        # 市场管理
│   ├── roo-config/         # Roo 配置
│   └── mdm/                # MDM 服务
│
├── integrations/           # 集成模块
│   ├── editor/             # 编辑器集成
│   │   ├── DiffViewProvider.ts
│   │   ├── DecorationController.ts
│   │   └── EditorUtils.ts
│   ├── terminal/           # 终端集成
│   │   ├── Terminal.ts
│   │   ├── TerminalRegistry.ts
│   │   └── ShellIntegration.ts
│   ├── diagnostics/        # 诊断集成
│   ├── workspace/          # 工作区追踪
│   ├── theme/              # 主题获取
│   ├── claude-code/        # Claude Code OAuth
│   └── misc/               # 杂项
│
├── shared/                 # 共享代码
│   ├── api.ts
│   ├── modes.ts
│   ├── tools.ts
│   ├── package.ts
│   ├── WebviewMessage.ts
│   └── ...
│
├── utils/                  # 工具函数
│   ├── fs.ts
│   ├── git.ts
│   ├── path.ts
│   ├── config.ts
│   ├── tiktoken.ts
│   └── logging/
│
├── i18n/                   # 国际化
│   ├── index.ts
│   └── locales/
│       ├── en/
│       ├── zh-CN/
│       └── ... (18 种语言)
│
└── extension/              # 扩展 API
    └── api.ts
```

### webview-ui/ - 前端 UI

```
webview-ui/
├── index.html              # 主 HTML
├── browser-panel.html      # 浏览器面板
├── package.json
├── vite.config.ts
├── tailwind.config.ts
│
└── src/
    ├── App.tsx             # 根组件
    ├── main.tsx            # 入口
    │
    ├── components/         # UI 组件
    │   ├── chat/           # 聊天组件
    │   ├── settings/       # 设置组件
    │   ├── history/        # 历史组件
    │   ├── common/         # 通用组件
    │   └── ui/             # 基础 UI
    │
    ├── context/            # React Context
    ├── hooks/              # 自定义 Hooks
    ├── utils/              # 工具函数
    └── i18n/               # 前端国际化
```

### packages/ - 共享包

```
packages/
├── types/                  # 类型定义
│   ├── src/
│   │   ├── index.ts
│   │   ├── providers.ts
│   │   ├── tools.ts
│   │   ├── modes.ts
│   │   └── ...
│   └── package.json
│
├── core/                   # 核心逻辑
│   ├── src/
│   │   ├── index.ts
│   │   ├── cli.ts
│   │   ├── browser.ts
│   │   └── custom-tools/
│   └── package.json
│
├── cloud/                  # 云服务
│   ├── src/
│   │   ├── index.ts
│   │   ├── CloudService.ts
│   │   ├── AuthService.ts
│   │   └── BridgeOrchestrator.ts
│   └── package.json
│
├── telemetry/              # 遥测
│   ├── src/
│   │   ├── index.ts
│   │   ├── TelemetryService.ts
│   │   └── PostHogClient.ts
│   └── package.json
│
├── ipc/                    # 进程间通信
├── build/                  # 构建工具
├── vscode-shim/            # VS Code 模拟
├── config-typescript/      # TS 配置
├── config-eslint/          # ESLint 配置
└── evals/                  # 评估系统
```

### apps/ - 独立应用

```
apps/
├── cli/                    # 命令行版本
│   ├── src/
│   │   ├── index.ts
│   │   ├── commands/
│   │   └── ui/             # Ink TUI
│   └── package.json
│
├── vscode-e2e/             # E2E 测试
├── vscode-nightly/         # 夜间版本
├── web-evals/              # 评估 Web (Next.js)
└── web-roo-code/           # 官网 (Next.js)
```

---

## 核心模块关系

### 模块依赖图

```
                    ┌─────────────┐
                    │  extension  │
                    │    .ts      │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  activate/  │ │   core/     │ │  services/  │
    │  commands   │ │   task      │ │    mcp      │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           │               ▼               │
           │        ┌─────────────┐        │
           │        │   core/     │        │
           └───────►│  webview    │◄───────┘
                    │ ClineProvider│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    api/     │
                    │  providers  │
                    └─────────────┘
```

### 类关系图

```
┌─────────────────────────────────────────────────────────────┐
│                      ClineProvider                           │
│  - 管理 Webview 生命周期                                      │
│  - 处理前端消息                                               │
│  - 管理任务栈 (clineStack: Task[])                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ creates
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                          Task                                │
│  - 管理单个 AI 对话任务                                       │
│  - 处理工具调用                                               │
│  - 上下文管理                                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ uses
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       ApiHandler                             │
│  - 抽象 AI API 调用                                          │
│  - 流式响应处理                                               │
│  - Token 计数                                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ implements
                              ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│Anthropic│ │ OpenAI  │ │ Gemini  │ │ Bedrock │ ...
│ Handler │ │ Handler │ │ Handler │ │ Handler │
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 数据流

### 用户交互流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───►│ Webview  │───►│ Provider │───►│   Task   │
│  Input   │    │   UI     │    │          │    │          │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                                                      ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │◄───│ Webview  │◄───│ Provider │◄───│   API    │
│  Output  │    │   UI     │    │          │    │ Handler  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
```

### 消息协议

```typescript
// Webview -> Extension
interface WebviewMessage {
    type: "newTask" | "askResponse" | "clearTask" | ...
    // 消息特定字段
}

// Extension -> Webview
interface ExtensionMessage {
    type: "state" | "action" | "partialMessage" | ...
    // 消息特定字段
}
```

### AI 对话循环

```
┌─────────────────────────────────────────────────────────────┐
│                      Task.startTask()                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. 构建系统提示词 (SYSTEM_PROMPT)                           │
│  2. 添加用户消息到历史                                        │
│  3. 调用 API (createMessage)                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. 解析 AI 响应 (AssistantMessageParser)                    │
│  5. 识别工具调用                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
            ┌─────────────┐     ┌─────────────┐
            │  文本响应   │     │  工具调用   │
            └─────────────┘     └──────┬──────┘
                                       │
                                       ▼
                              ┌─────────────┐
                              │ 执行工具    │
                              │ (需要批准?) │
                              └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │ 返回结果    │
                              │ 继续循环    │
                              └─────────────┘
```

---

## 扩展点

### 添加新的 AI 提供者

1. 在 `src/api/providers/` 创建新的 Handler 类
2. 实现 `ApiHandler` 接口
3. 在 `src/api/index.ts` 的 `buildApiHandler` 中注册
4. 在 `packages/types/` 添加类型定义

```typescript
// 示例: 新提供者
export class NewProviderHandler implements ApiHandler {
    createMessage(systemPrompt: string, messages: MessageParam[]): ApiStream {
        // 实现
    }

    getModel(): { id: string; info: ModelInfo } {
        // 实现
    }

    countTokens(content: ContentBlockParam[]): Promise<number> {
        // 实现
    }
}
```

### 添加新的工具

1. 在 `src/core/tools/` 创建新的工具文件
2. 实现工具逻辑
3. 在 `src/shared/tools.ts` 注册工具
4. 在 `src/core/prompts/tools/` 添加工具描述

```typescript
// 示例: 新工具
export async function executeNewTool(
    task: Task,
    params: ToolParams
): Promise<ToolResponse> {
    // 实现工具逻辑
}
```

### 添加新的模式

1. 在 `packages/types/` 定义模式配置
2. 或通过 `.roo/.roomodes` 文件配置自定义模式

```json
{
    "customModes": [
        {
            "slug": "my-mode",
            "name": "My Custom Mode",
            "roleDefinition": "You are...",
            "groups": ["read", "edit", "browser"]
        }
    ]
}
```

---

## 相关文档

- [项目分析](./PROJECT_ANALYSIS.md) - 项目完整解析
- [API 提供者](./API_PROVIDERS.md) - API 提供者详解
- [工具系统](./TOOLS.md) - 工具系统详解
- [开发指南](./DEVELOPMENT.md) - 开发环境配置
