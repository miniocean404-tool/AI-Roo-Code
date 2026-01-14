# Roo Code 工具系统详解

## 概述

Roo Code 提供了丰富的工具系统，让 AI 能够与文件系统、终端、浏览器等进行交互。工具系统支持 XML 和 Native 两种协议。

---

## 工具架构

### 工具调用流程

```
┌─────────────────────────────────────────────────────────────┐
│                      AI Response                             │
│  包含工具调用 (XML 或 Native 格式)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Message Parser                             │
│  - AssistantMessageParser (XML)                              │
│  - NativeToolCallParser (Native)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Tool Validation                            │
│  - 参数验证                                                   │
│  - 权限检查                                                   │
│  - 模式限制                                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   User Approval                              │
│  - 自动批准检查                                               │
│  - 用户确认                                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Tool Execution                             │
│  - 执行工具逻辑                                               │
│  - 返回结果                                                   │
└─────────────────────────────────────────────────────────────┘
```

### 工具协议

#### XML 协议

```xml
<read_file>
<path>src/index.ts</path>
</read_file>
```

#### Native 协议

```json
{
    "type": "tool_use",
    "id": "toolu_123",
    "name": "read_file",
    "input": {
        "files": [{ "path": "src/index.ts" }]
    }
}
```

---

## 工具列表

### 文件操作工具

#### read_file - 读取文件

**功能**: 读取文件内容

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `path` | string | 是 | 文件路径 |
| `start_line` | number | 否 | 起始行 |
| `end_line` | number | 否 | 结束行 |

**XML 示例**:
```xml
<read_file>
<path>src/index.ts</path>
<start_line>1</start_line>
<end_line>50</end_line>
</read_file>
```

**Native 示例**:
```json
{
    "name": "read_file",
    "input": {
        "files": [
            { "path": "src/index.ts", "start_line": 1, "end_line": 50 }
        ]
    }
}
```

---

#### write_to_file - 写入文件

**功能**: 创建或覆盖文件

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `path` | string | 是 | 文件路径 |
| `content` | string | 是 | 文件内容 |

**XML 示例**:
```xml
<write_to_file>
<path>src/new-file.ts</path>
<content>
export function hello() {
    console.log("Hello, World!")
}
</content>
</write_to_file>
```

---

#### apply_diff - 应用差异

**功能**: 使用 diff 格式修改文件

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `path` | string | 是 | 文件路径 |
| `diff` | string | 是 | diff 内容 |

**XML 示例**:
```xml
<apply_diff>
<path>src/index.ts</path>
<diff>
<<<<<<< SEARCH
const oldCode = "old"
=======
const newCode = "new"
>>>>>>> REPLACE
</diff>
</apply_diff>
```

---

#### search_and_replace - 搜索替换

**功能**: 批量搜索替换

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `path` | string | 是 | 文件路径 |
| `operations` | array | 是 | 替换操作列表 |

**Native 示例**:
```json
{
    "name": "search_and_replace",
    "input": {
        "path": "src/index.ts",
        "operations": [
            { "search": "oldValue", "replace": "newValue" },
            { "search": "foo", "replace": "bar" }
        ]
    }
}
```

---

#### edit_file - 编辑文件

**功能**: 精确字符串替换

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `file_path` | string | 是 | 文件路径 |
| `old_string` | string | 是 | 要替换的字符串 |
| `new_string` | string | 是 | 新字符串 |
| `expected_replacements` | number | 否 | 预期替换次数 |

---

#### list_files - 列出文件

**功能**: 列出目录内容

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `path` | string | 是 | 目录路径 |
| `recursive` | boolean | 否 | 是否递归 |

---

#### search_files - 搜索文件

**功能**: 使用正则搜索文件内容

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `path` | string | 是 | 搜索路径 |
| `regex` | string | 是 | 正则表达式 |
| `file_pattern` | string | 否 | 文件模式 |

---

### 终端工具

#### execute_command - 执行命令

**功能**: 在终端执行命令

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `command` | string | 是 | 要执行的命令 |
| `cwd` | string | 否 | 工作目录 |

**XML 示例**:
```xml
<execute_command>
<command>npm install</command>
<cwd>/project</cwd>
</execute_command>
```

---

### 浏览器工具

#### browser_action - 浏览器操作

**功能**: 控制浏览器进行自动化操作

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `action` | string | 是 | 操作类型 |
| `url` | string | 否 | URL (launch 时) |
| `coordinate` | string | 否 | 坐标 (click 时) |
| `text` | string | 否 | 文本 (type 时) |

**操作类型**:
- `launch` - 启动浏览器
- `click` - 点击
- `type` - 输入文本
- `scroll_down` / `scroll_up` - 滚动
- `screenshot` - 截图
- `close` - 关闭

**XML 示例**:
```xml
<browser_action>
<action>launch</action>
<url>https://example.com</url>
</browser_action>
```

---

### MCP 工具

#### use_mcp_tool - 使用 MCP 工具

**功能**: 调用 MCP 服务器提供的工具

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `server_name` | string | 是 | 服务器名称 |
| `tool_name` | string | 是 | 工具名称 |
| `arguments` | object | 否 | 工具参数 |

**XML 示例**:
```xml
<use_mcp_tool>
<server_name>filesystem</server_name>
<tool_name>read_file</tool_name>
<arguments>{"path": "/tmp/test.txt"}</arguments>
</use_mcp_tool>
```

---

#### access_mcp_resource - 访问 MCP 资源

**功能**: 访问 MCP 服务器提供的资源

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `server_name` | string | 是 | 服务器名称 |
| `uri` | string | 是 | 资源 URI |

---

### 交互工具

#### ask_followup_question - 追问

**功能**: 向用户提问

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `question` | string | 是 | 问题内容 |
| `follow_up` | array | 否 | 建议选项 |

**XML 示例**:
```xml
<ask_followup_question>
<question>你想使用哪个框架?</question>
<follow_up>
<suggest>React</suggest>
<suggest>Vue</suggest>
<suggest>Angular</suggest>
</follow_up>
</ask_followup_question>
```

---

#### attempt_completion - 完成任务

**功能**: 标记任务完成

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `result` | string | 是 | 完成结果说明 |

---

### 模式工具

#### switch_mode - 切换模式

**功能**: 切换到不同的工作模式

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `mode_slug` | string | 是 | 模式标识 |
| `reason` | string | 是 | 切换原因 |

---

### 任务工具

#### new_task - 创建子任务

**功能**: 创建并委派子任务

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `mode` | string | 是 | 子任务模式 |
| `message` | string | 是 | 任务描述 |

---

#### update_todo_list - 更新待办

**功能**: 更新任务待办列表

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `todos` | string | 是 | JSON 格式待办列表 |

---

### 其他工具

#### codebase_search - 代码库搜索

**功能**: 语义搜索代码库

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `query` | string | 是 | 搜索查询 |
| `path` | string | 否 | 限制路径 |

---

#### fetch_instructions - 获取指令

**功能**: 获取任务相关指令

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `task` | string | 是 | 任务描述 |

---

#### run_slash_command - 运行斜杠命令

**功能**: 运行自定义斜杠命令

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `command` | string | 是 | 命令名称 |
| `args` | string | 否 | 命令参数 |

---

#### generate_image - 生成图片

**功能**: 使用 AI 生成图片

**参数**:
| 参数 | 类型 | 必需 | 说明 |
|------|------|------|------|
| `prompt` | string | 是 | 图片描述 |
| `size` | string | 否 | 图片尺寸 |

---

## 工具组

工具按功能分组，不同模式可以访问不同的工具组：

```typescript
// src/shared/tools.ts
export const TOOL_GROUPS: Record<ToolGroup, ToolGroupConfig> = {
    read: {
        tools: ["read_file", "list_files", "search_files", "codebase_search"]
    },
    edit: {
        tools: ["write_to_file", "apply_diff", "search_and_replace", "edit_file"]
    },
    browser: {
        tools: ["browser_action"]
    },
    command: {
        tools: ["execute_command"]
    },
    mcp: {
        tools: ["use_mcp_tool", "access_mcp_resource"]
    },
    modes: {
        tools: ["switch_mode", "new_task"]
    },
    // ...
}
```

### 模式与工具组映射

| 模式 | 工具组 |
|------|--------|
| **Code** | read, edit, browser, command, mcp, modes |
| **Architect** | read, browser, mcp |
| **Ask** | read, browser, mcp |
| **Debug** | read, edit, browser, command, mcp |

---

## 工具实现

### 工具文件结构

```
src/core/tools/
├── BaseTool.ts                 # 基础工具类
├── ReadFileTool.ts             # 读取文件
├── WriteToFileTool.ts          # 写入文件
├── ApplyDiffTool.ts            # 应用差异
├── SearchAndReplaceTool.ts     # 搜索替换
├── EditFileTool.ts             # 编辑文件
├── ListFilesTool.ts            # 列出文件
├── SearchFilesTool.ts          # 搜索文件
├── ExecuteCommandTool.ts       # 执行命令
├── BrowserActionTool.ts        # 浏览器操作
├── UseMcpToolTool.ts           # MCP 工具
├── accessMcpResourceTool.ts    # MCP 资源
├── AskFollowupQuestionTool.ts  # 追问
├── AttemptCompletionTool.ts    # 完成任务
├── SwitchModeTool.ts           # 切换模式
├── NewTaskTool.ts              # 新任务
├── UpdateTodoListTool.ts       # 更新待办
├── CodebaseSearchTool.ts       # 代码库搜索
├── FetchInstructionsTool.ts    # 获取指令
├── RunSlashCommandTool.ts      # 斜杠命令
├── GenerateImageTool.ts        # 生成图片
├── ToolRepetitionDetector.ts   # 重复检测
├── validateToolUse.ts          # 工具验证
│
├── apply-patch/                # 补丁应用
│   ├── apply.ts
│   ├── parser.ts
│   └── seek-sequence.ts
│
└── helpers/                    # 辅助函数
    ├── fileTokenBudget.ts
    ├── imageHelpers.ts
    ├── toolResultFormatting.ts
    └── truncateDefinitions.ts
```

### 工具实现示例

```typescript
// src/core/tools/ReadFileTool.ts
export async function executeReadFile(
    task: Task,
    params: { path: string; start_line?: number; end_line?: number }
): Promise<ToolResponse> {
    const { path, start_line, end_line } = params

    // 验证路径
    const absolutePath = resolveFilePath(task.workspacePath, path)

    // 检查文件是否存在
    if (!await fileExists(absolutePath)) {
        return `Error: File not found: ${path}`
    }

    // 检查 .rooignore
    if (task.rooIgnoreController.isIgnored(absolutePath)) {
        return `Error: File is ignored by .rooignore: ${path}`
    }

    // 读取文件内容
    let content = await fs.readFile(absolutePath, "utf-8")

    // 处理行范围
    if (start_line || end_line) {
        const lines = content.split("\n")
        const start = (start_line || 1) - 1
        const end = end_line || lines.length
        content = lines.slice(start, end).join("\n")
    }

    // 添加行号
    const numberedContent = addLineNumbers(content, start_line || 1)

    return numberedContent
}
```

---

## 自动批准

### 配置

```typescript
interface AutoApprovalSettings {
    enabled: boolean
    actions: {
        readFiles: boolean
        editFiles: boolean
        executeCommands: boolean
        useBrowser: boolean
        useMcp: boolean
    }
    maxRequests: number
    enableNotifications: boolean
}
```

### 检查逻辑

```typescript
// src/core/auto-approval/index.ts
export function checkAutoApproval(
    toolName: ToolName,
    settings: AutoApprovalSettings
): boolean {
    if (!settings.enabled) return false

    switch (toolName) {
        case "read_file":
        case "list_files":
        case "search_files":
            return settings.actions.readFiles

        case "write_to_file":
        case "apply_diff":
        case "edit_file":
            return settings.actions.editFiles

        case "execute_command":
            return settings.actions.executeCommands

        case "browser_action":
            return settings.actions.useBrowser

        case "use_mcp_tool":
            return settings.actions.useMcp

        default:
            return false
    }
}
```

---

## 工具重复检测

```typescript
// src/core/tools/ToolRepetitionDetector.ts
export class ToolRepetitionDetector {
    private history: ToolCall[] = []
    private readonly maxHistory = 10
    private readonly threshold = 3

    addCall(toolName: string, params: Record<string, unknown>): void {
        this.history.push({ toolName, params, timestamp: Date.now() })
        if (this.history.length > this.maxHistory) {
            this.history.shift()
        }
    }

    isRepetitive(toolName: string, params: Record<string, unknown>): boolean {
        const recentCalls = this.history.filter(
            call => call.toolName === toolName &&
                    deepEqual(call.params, params)
        )
        return recentCalls.length >= this.threshold
    }
}
```

---

## 添加新工具指南

### 步骤 1: 创建工具文件

```typescript
// src/core/tools/MyNewTool.ts
import { Task } from "../task/Task"
import { ToolResponse } from "../../shared/tools"

export async function executeMyNewTool(
    task: Task,
    params: { param1: string; param2?: number }
): Promise<ToolResponse> {
    // 实现工具逻辑
    const result = await doSomething(params.param1, params.param2)
    return result
}
```

### 步骤 2: 注册工具

```typescript
// src/shared/tools.ts
export const toolParamNames = [
    // ... 现有参数
    "param1",
    "param2",
] as const

// 添加到工具组
export const TOOL_GROUPS = {
    myGroup: {
        tools: ["my_new_tool"]
    }
}
```

### 步骤 3: 添加工具描述

```typescript
// src/core/prompts/tools/my-new-tool.ts
export function getMyNewToolDescription(): string {
    return `
## my_new_tool

Description: Does something useful.

Parameters:
- param1: (required) The first parameter
- param2: (optional) The second parameter

Usage:
<my_new_tool>
<param1>value</param1>
<param2>123</param2>
</my_new_tool>
`
}
```

### 步骤 4: 集成到任务处理

```typescript
// src/core/assistant-message/presentAssistantMessage.ts
case "my_new_tool":
    return await executeMyNewTool(task, {
        param1: toolUse.params.param1!,
        param2: toolUse.params.param2 ? parseInt(toolUse.params.param2) : undefined
    })
```

### 步骤 5: 添加测试

```typescript
// src/core/tools/__tests__/myNewTool.spec.ts
describe("executeMyNewTool", () => {
    it("should execute successfully", async () => {
        const result = await executeMyNewTool(mockTask, {
            param1: "test"
        })
        expect(result).toBe("expected result")
    })
})
```

---

## 相关文档

- [架构文档](./ARCHITECTURE.md) - 整体架构
- [API 提供者](./API_PROVIDERS.md) - API 提供者详解
- [开发指南](./DEVELOPMENT.md) - 开发环境配置
