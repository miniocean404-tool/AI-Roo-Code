/**
 * @fileoverview AI 工具类型定义
 *
 * 这个文件定义了 Roo Code 中 AI 可以使用的所有工具相关类型。
 * 工具是 AI 与用户环境交互的主要方式，包括：
 * - 文件操作（读取、写入、搜索）
 * - 命令执行
 * - 浏览器操作
 * - MCP 服务器交互
 * - 模式切换
 *
 * 工具按功能分组（ToolGroup），不同的工作模式可以访问不同的工具组。
 * 例如：
 * - "ask" 模式只能使用 "read" 组的工具
 * - "code" 模式可以使用 "read", "edit", "command" 等组的工具
 *
 * 工具协议（ToolProtocol）决定了 AI 如何调用工具：
 * - "xml": 使用 XML 格式的工具调用（传统方式）
 * - "native": 使用原生函数调用（OpenAI 风格）
 */

import { z } from "zod"

// ============================================================================
// 工具分组（ToolGroup）
// ============================================================================

/**
 * 工具分组常量数组
 *
 * 工具按功能分为以下几组：
 * - "read": 读取类工具（read_file, list_files, search_files 等）
 * - "edit": 编辑类工具（write_to_file, apply_diff, search_and_replace 等）
 * - "browser": 浏览器类工具（browser_action）
 * - "command": 命令执行类工具（execute_command）
 * - "mcp": MCP 服务器类工具（use_mcp_tool, access_mcp_resource）
 * - "modes": 模式切换类工具（switch_mode, new_task）
 *
 * 不同的工作模式（Mode）可以配置允许使用哪些工具组。
 * 例如 "ask" 模式只允许 "read" 组，而 "code" 模式允许大部分组。
 */
export const toolGroups = ["read", "edit", "browser", "command", "mcp", "modes"] as const

/**
 * 工具分组的 Zod 验证模式
 * 用于运行时验证工具分组值的有效性
 */
export const toolGroupsSchema = z.enum(toolGroups)

/**
 * 工具分组类型
 * 从 toolGroups 常量数组推断出的联合类型
 */
export type ToolGroup = z.infer<typeof toolGroupsSchema>

// ============================================================================
// 工具名称（ToolName）
// ============================================================================

/**
 * 所有可用工具的名称常量数组
 *
 * 文件操作工具：
 * - "read_file": 读取文件内容
 * - "write_to_file": 写入文件（完整覆盖）
 * - "apply_diff": 应用 diff 格式的修改
 * - "search_and_replace": 搜索并替换文件内容
 * - "search_replace": 搜索替换（简化版）
 * - "edit_file": 编辑文件（通用）
 * - "apply_patch": 应用补丁文件
 * - "search_files": 在文件中搜索内容
 * - "list_files": 列出目录中的文件
 * - "codebase_search": 语义搜索代码库
 *
 * 命令执行工具：
 * - "execute_command": 在终端执行命令
 *
 * 浏览器工具：
 * - "browser_action": 浏览器操作（点击、输入、截图等）
 *
 * MCP 工具：
 * - "use_mcp_tool": 调用 MCP 服务器提供的工具
 * - "access_mcp_resource": 访问 MCP 服务器提供的资源
 *
 * 交互工具：
 * - "ask_followup_question": 向用户提问以获取更多信息
 * - "attempt_completion": 尝试完成任务并提交结果
 *
 * 模式工具：
 * - "switch_mode": 切换工作模式
 * - "new_task": 创建新的子任务（用于任务委派）
 *
 * 其他工具：
 * - "fetch_instructions": 获取外部指令
 * - "update_todo_list": 更新待办事项列表
 * - "run_slash_command": 运行斜杠命令
 * - "generate_image": 生成图像
 * - "custom_tool": 用户自定义工具
 */
export const toolNames = [
	"execute_command",
	"read_file",
	"write_to_file",
	"apply_diff",
	"search_and_replace",
	"search_replace",
	"edit_file",
	"apply_patch",
	"search_files",
	"list_files",
	"browser_action",
	"use_mcp_tool",
	"access_mcp_resource",
	"ask_followup_question",
	"attempt_completion",
	"switch_mode",
	"new_task",
	"fetch_instructions",
	"codebase_search",
	"update_todo_list",
	"run_slash_command",
	"generate_image",
	"custom_tool",
] as const

/**
 * 工具名称的 Zod 验证模式
 * 用于运行时验证工具名称的有效性
 */
export const toolNamesSchema = z.enum(toolNames)

/**
 * 工具名称类型
 * 从 toolNames 常量数组推断出的联合类型
 */
export type ToolName = z.infer<typeof toolNamesSchema>

// ============================================================================
// 工具使用统计（ToolUsage）
// ============================================================================

/**
 * 工具使用统计的 Zod 验证模式
 *
 * 记录每个工具的使用情况：
 * - attempts: 尝试调用次数
 * - failures: 失败次数
 *
 * 这些统计数据用于：
 * - 遥测分析
 * - 错误检测（连续失败限制）
 * - 任务完成报告
 */
export const toolUsageSchema = z.record(
	toolNamesSchema,
	z.object({
		/** 工具调用尝试次数 */
		attempts: z.number(),
		/** 工具调用失败次数 */
		failures: z.number(),
	}),
)

/**
 * 工具使用统计类型
 * 键为工具名称，值为该工具的使用统计
 */
export type ToolUsage = z.infer<typeof toolUsageSchema>

// ============================================================================
// 工具协议（ToolProtocol）
// ============================================================================

/**
 * 工具协议常量对象
 *
 * 定义了 AI 调用工具的两种方式：
 *
 * XML 协议（传统方式）：
 * - AI 在响应中使用 XML 标签来调用工具
 * - 例如：<read_file><path>/src/index.ts</path></read_file>
 * - 兼容性好，所有模型都支持
 * - 解析相对简单
 *
 * Native 协议（原生函数调用）：
 * - 使用 OpenAI 风格的函数调用 API
 * - AI 直接返回结构化的工具调用对象
 * - 更精确，减少解析错误
 * - 需要模型支持原生工具调用
 */
export const TOOL_PROTOCOL = {
	/** XML 格式的工具调用协议 */
	XML: "xml",
	/** 原生函数调用协议（OpenAI 风格） */
	NATIVE: "native",
} as const

/**
 * 工具协议类型
 * 从 TOOL_PROTOCOL 常量对象推断出的联合类型："xml" | "native"
 */
export type ToolProtocol = (typeof TOOL_PROTOCOL)[keyof typeof TOOL_PROTOCOL]

// ============================================================================
// 原生工具默认配置
// ============================================================================

/**
 * 原生工具支持的默认配置
 *
 * 用于合并到可能缺少这些字段的缓存模型信息中。
 * 路由提供者（Requesty, Unbound, LiteLLM）假设所有模型都支持原生工具。
 *
 * @property supportsNativeTools - 是否支持原生工具调用
 * @property defaultToolProtocol - 默认使用的工具协议
 */
export const NATIVE_TOOL_DEFAULTS = {
	/** 默认支持原生工具调用 */
	supportsNativeTools: true,
	/** 默认使用原生协议 */
	defaultToolProtocol: TOOL_PROTOCOL.NATIVE,
} as const

// ============================================================================
// 工具协议辅助函数
// ============================================================================

/**
 * 检查协议是否为原生协议（非 XML）
 *
 * @param protocol - 要检查的工具协议
 * @returns 如果是原生协议返回 true，否则返回 false
 *
 * @example
 * ```typescript
 * isNativeProtocol("native") // true
 * isNativeProtocol("xml")    // false
 * ```
 */
export function isNativeProtocol(protocol: ToolProtocol): boolean {
	return protocol === TOOL_PROTOCOL.NATIVE
}

/**
 * 获取有效的工具协议
 *
 * 从设置中获取协议，如果未设置则回退到默认的 XML 协议。
 * 这个函数可以安全地在 webview 可访问的代码中使用，
 * 因为它不依赖 vscode 模块。
 *
 * @param toolProtocol - 可选的工具协议设置
 * @returns 有效的工具协议（默认为 "xml"）
 *
 * @example
 * ```typescript
 * getEffectiveProtocol("native")   // "native"
 * getEffectiveProtocol(undefined)  // "xml"
 * getEffectiveProtocol()           // "xml"
 * ```
 */
export function getEffectiveProtocol(toolProtocol?: ToolProtocol): ToolProtocol {
	return toolProtocol || TOOL_PROTOCOL.XML
}
