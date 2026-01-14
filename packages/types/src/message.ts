/**
 * @fileoverview 消息类型定义
 *
 * 这个文件定义了 Roo Code 中所有消息相关的类型。
 * 消息是扩展（Extension Host）和前端（Webview UI）之间通信的核心。
 *
 * 消息分为两大类：
 * 1. Ask（询问）：AI 需要用户响应才能继续的消息
 *    - 例如：请求执行命令、请求写入文件、提问等
 * 2. Say（陈述）：AI 单向发送的信息性消息
 *    - 例如：文本响应、错误信息、API 请求状态等
 *
 * 消息状态分类：
 * - Idle（空闲）：任务已完成或暂停，等待新输入
 * - Interactive（交互）：需要用户批准或响应
 * - Resumable（可恢复）：任务可以被恢复继续
 * - NonBlocking（非阻塞）：仅用于更新 UI，不阻塞任务
 */

import { z } from "zod"

// ============================================================================
// ClineAsk - 询问类型
// ============================================================================

/**
 * 所有可能的询问类型数组
 *
 * 这些类型代表 AI 需要用户交互或批准才能继续的不同场景。
 *
 * 询问类型说明：
 * - `followup`: AI 提出澄清问题以获取更多信息来完成任务
 * - `command`: 请求执行终端/shell 命令的权限
 * - `command_output`: 请求读取之前执行的命令的输出
 * - `completion_result`: 任务已完成，等待用户反馈或新任务
 * - `tool`: 请求使用工具进行文件操作（读取、写入、搜索等）的权限
 * - `api_req_failed`: API 请求失败，询问用户是否重试
 * - `resume_task`: 需要确认以恢复之前暂停的任务
 * - `resume_completed_task`: 需要确认以恢复已标记为完成的任务
 * - `mistake_limit_reached`: 遇到太多错误，需要用户指导如何继续
 * - `browser_action_launch`: 请求打开或与浏览器交互的权限
 * - `use_mcp_server`: 请求使用 MCP 服务器功能的权限
 * - `auto_approval_max_req_reached`: 自动批准限制已达到，需要手动批准
 *
 * @constant
 * @readonly
 */
export const clineAsks = [
	"followup",
	"command",
	"command_output",
	"completion_result",
	"tool",
	"api_req_failed",
	"resume_task",
	"resume_completed_task",
	"mistake_limit_reached",
	"browser_action_launch",
	"use_mcp_server",
	"auto_approval_max_req_reached",
] as const

/**
 * ClineAsk 的 Zod 验证模式
 */
export const clineAskSchema = z.enum(clineAsks)

/**
 * ClineAsk 类型
 * 表示 AI 可以向用户发出的所有询问类型
 */
export type ClineAsk = z.infer<typeof clineAskSchema>

// ============================================================================
// IdleAsk - 空闲状态询问
// ============================================================================

/**
 * 使任务进入"空闲"状态的询问类型
 *
 * 这些询问表示任务已经完成或遇到了需要用户干预的情况，
 * 任务不会自动继续，需要用户采取行动。
 */
export const idleAsks = [
	"completion_result",        // 任务完成
	"api_req_failed",           // API 请求失败
	"resume_completed_task",    // 恢复已完成的任务
	"mistake_limit_reached",    // 达到错误限制
	"auto_approval_max_req_reached", // 达到自动批准限制
] as const satisfies readonly ClineAsk[]

/**
 * IdleAsk 类型
 */
export type IdleAsk = (typeof idleAsks)[number]

/**
 * 检查询问是否为空闲状态询问
 *
 * @param ask - 要检查的询问类型
 * @returns 如果是空闲状态询问返回 true
 */
export function isIdleAsk(ask: ClineAsk): ask is IdleAsk {
	return (idleAsks as readonly ClineAsk[]).includes(ask)
}

// ============================================================================
// ResumableAsk - 可恢复状态询问
// ============================================================================

/**
 * 使任务进入"可恢复"状态的询问类型
 *
 * 这些询问表示任务可以被恢复继续执行。
 */
export const resumableAsks = ["resume_task"] as const satisfies readonly ClineAsk[]

/**
 * ResumableAsk 类型
 */
export type ResumableAsk = (typeof resumableAsks)[number]

/**
 * 检查询问是否为可恢复状态询问
 *
 * @param ask - 要检查的询问类型
 * @returns 如果是可恢复状态询问返回 true
 */
export function isResumableAsk(ask: ClineAsk): ask is ResumableAsk {
	return (resumableAsks as readonly ClineAsk[]).includes(ask)
}

// ============================================================================
// InteractiveAsk - 交互状态询问
// ============================================================================

/**
 * 使任务进入"需要用户交互"状态的询问类型
 *
 * 这些询问需要用户批准或提供输入才能继续。
 * 用户可以批准、拒绝或提供额外信息。
 */
export const interactiveAsks = [
	"followup",           // 后续问题
	"command",            // 命令执行请求
	"tool",               // 工具使用请求
	"browser_action_launch", // 浏览器操作请求
	"use_mcp_server",     // MCP 服务器使用请求
] as const satisfies readonly ClineAsk[]

/**
 * InteractiveAsk 类型
 */
export type InteractiveAsk = (typeof interactiveAsks)[number]

/**
 * 检查询问是否为交互状态询问
 *
 * @param ask - 要检查的询问类型
 * @returns 如果是交互状态询问返回 true
 */
export function isInteractiveAsk(ask: ClineAsk): ask is InteractiveAsk {
	return (interactiveAsks as readonly ClineAsk[]).includes(ask)
}

// ============================================================================
// NonBlockingAsk - 非阻塞询问
// ============================================================================

/**
 * 非阻塞询问类型
 *
 * 这些询问不与实际的批准关联，仅用于更新聊天消息。
 * 它们不会阻塞任务的执行。
 */
export const nonBlockingAsks = ["command_output"] as const satisfies readonly ClineAsk[]

/**
 * NonBlockingAsk 类型
 */
export type NonBlockingAsk = (typeof nonBlockingAsks)[number]

/**
 * 检查询问是否为非阻塞询问
 *
 * @param ask - 要检查的询问类型
 * @returns 如果是非阻塞询问返回 true
 */
export function isNonBlockingAsk(ask: ClineAsk): ask is NonBlockingAsk {
	return (nonBlockingAsks as readonly ClineAsk[]).includes(ask)
}

// ============================================================================
// ClineSay - 陈述类型
// ============================================================================

/**
 * 所有可能的陈述类型数组
 *
 * 这些类型代表 AI 可以发送的不同类型的信息性消息。
 *
 * 陈述类型说明：
 *
 * 错误和状态：
 * - `error`: 一般错误消息
 * - `api_req_started`: API 请求已发起
 * - `api_req_finished`: API 请求已成功完成
 * - `api_req_retried`: API 请求正在重试
 * - `api_req_retry_delayed`: API 请求重试已延迟
 * - `api_req_rate_limit_wait`: 配置的速率限制等待（非错误）
 * - `api_req_deleted`: API 请求已删除/取消
 *
 * 内容类型：
 * - `text`: 一般文本消息或助手响应
 * - `image`: 图像内容
 * - `reasoning`: 助手的推理或思考过程（通常对用户隐藏）
 * - `completion_result`: 任务完成的最终结果
 *
 * 用户反馈：
 * - `user_feedback`: 包含用户反馈的消息
 * - `user_feedback_diff`: 用户提供的 diff 格式反馈，显示请求的更改
 * - `user_edit_todos`: 用户编辑了待办事项列表
 *
 * 命令和终端：
 * - `command_output`: 执行命令的输出
 * - `shell_integration_warning`: 关于 shell 集成问题或限制的警告
 *
 * 浏览器：
 * - `browser_action`: 在浏览器中执行的操作
 * - `browser_action_result`: 浏览器操作的结果
 * - `browser_session_status`: 浏览器会话状态更新
 *
 * MCP：
 * - `mcp_server_request_started`: MCP 服务器请求已发起
 * - `mcp_server_response`: 从 MCP 服务器收到的响应
 *
 * 任务管理：
 * - `subtask_result`: 已完成子任务的结果
 * - `checkpoint_saved`: 检查点已保存
 *
 * 错误详情：
 * - `rooignore_error`: 与 .rooignore 文件处理相关的错误
 * - `diff_error`: 应用 diff/patch 时发生的错误
 *
 * 上下文管理：
 * - `condense_context`: 上下文压缩/摘要已开始
 * - `condense_context_error`: 上下文压缩期间发生的错误
 * - `sliding_window_truncation`: 滑动窗口截断事件
 *
 * 搜索：
 * - `codebase_search_result`: 代码库搜索的结果
 *
 * @constant
 * @readonly
 */
export const clineSays = [
	"error",
	"api_req_started",
	"api_req_finished",
	"api_req_retried",
	"api_req_retry_delayed",
	"api_req_rate_limit_wait",
	"api_req_deleted",
	"text",
	"image",
	"reasoning",
	"completion_result",
	"user_feedback",
	"user_feedback_diff",
	"command_output",
	"shell_integration_warning",
	"browser_action",
	"browser_action_result",
	"browser_session_status",
	"mcp_server_request_started",
	"mcp_server_response",
	"subtask_result",
	"checkpoint_saved",
	"rooignore_error",
	"diff_error",
	"condense_context",
	"condense_context_error",
	"sliding_window_truncation",
	"codebase_search_result",
	"user_edit_todos",
] as const

/**
 * ClineSay 的 Zod 验证模式
 */
export const clineSaySchema = z.enum(clineSays)

/**
 * ClineSay 类型
 * 表示 AI 可以发送的所有陈述类型
 */
export type ClineSay = z.infer<typeof clineSaySchema>

// ============================================================================
// ToolProgressStatus - 工具进度状态
// ============================================================================

/**
 * 工具进度状态的 Zod 验证模式
 *
 * 用于在工具执行期间显示进度信息。
 *
 * @property icon - 可选的图标（如 spinner、checkmark 等）
 * @property text - 可选的进度文本描述
 */
export const toolProgressStatusSchema = z.object({
	/** 进度图标 */
	icon: z.string().optional(),
	/** 进度文本 */
	text: z.string().optional(),
})

/**
 * ToolProgressStatus 类型
 */
export type ToolProgressStatus = z.infer<typeof toolProgressStatusSchema>

// ============================================================================
// ContextCondense - 上下文压缩数据
// ============================================================================

/**
 * 上下文压缩数据的 Zod 验证模式
 *
 * 与成功的上下文压缩事件关联的数据。
 * 当压缩操作成功完成时，附加到 `say: "condense_context"` 的消息上。
 *
 * 上下文压缩是一种通过 AI 总结来减少对话历史 token 数量的技术，
 * 用于在保持关键信息的同时减少 API 成本和避免上下文窗口溢出。
 *
 * @property cost - 压缩操作产生的 API 成本
 * @property prevContextTokens - 压缩前的 token 数量
 * @property newContextTokens - 压缩后的 token 数量
 * @property summary - 替换原始上下文的压缩摘要
 * @property condenseId - 此压缩操作的可选唯一标识符
 */
export const contextCondenseSchema = z.object({
	/** 压缩操作的 API 成本 */
	cost: z.number(),
	/** 压缩前的 token 数量 */
	prevContextTokens: z.number(),
	/** 压缩后的 token 数量 */
	newContextTokens: z.number(),
	/** 压缩后的摘要内容 */
	summary: z.string(),
	/** 压缩操作的唯一标识符 */
	condenseId: z.string().optional(),
})

/**
 * ContextCondense 类型
 */
export type ContextCondense = z.infer<typeof contextCondenseSchema>

// ============================================================================
// ContextTruncation - 上下文截断数据
// ============================================================================

/**
 * 上下文截断数据的 Zod 验证模式
 *
 * 与滑动窗口截断事件关联的数据。
 * 当消息从对话历史中移除以保持在 token 限制内时，
 * 附加到 `say: "sliding_window_truncation"` 的消息上。
 *
 * 与压缩不同，截断只是简单地移除旧消息而不进行总结。
 * 这是一种更快但保留上下文较少的方法。
 *
 * @property truncationId - 此截断操作的唯一标识符
 * @property messagesRemoved - 被移除的对话消息数量
 * @property prevContextTokens - 截断前的 token 数量
 * @property newContextTokens - 截断后的 token 数量
 */
export const contextTruncationSchema = z.object({
	/** 截断操作的唯一标识符 */
	truncationId: z.string(),
	/** 被移除的消息数量 */
	messagesRemoved: z.number(),
	/** 截断前的 token 数量 */
	prevContextTokens: z.number(),
	/** 截断后的 token 数量 */
	newContextTokens: z.number(),
})

/**
 * ContextTruncation 类型
 */
export type ContextTruncation = z.infer<typeof contextTruncationSchema>

// ============================================================================
// ClineMessage - 主消息类型
// ============================================================================

/**
 * ClineMessage 的 Zod 验证模式
 *
 * 这是扩展和 webview 之间通信使用的主要消息类型。
 * 消息可以是 "ask"（需要用户响应）或 "say"（信息性）。
 *
 * 上下文管理字段：
 * - `contextCondense`: 当 `say: "condense_context"` 且压缩成功时存在
 * - `contextTruncation`: 当 `say: "sliding_window_truncation"` 且截断发生时存在
 *
 * 注意：这些字段是互斥的 - 一条消息最多只有其中一个。
 *
 * @property ts - 消息时间戳（毫秒）
 * @property type - 消息类型："ask" 或 "say"
 * @property ask - 如果 type 为 "ask"，则为询问类型
 * @property say - 如果 type 为 "say"，则为陈述类型
 * @property text - 消息文本内容
 * @property images - 图像数据 URI 数组
 * @property partial - 是否为部分消息（流式传输中）
 * @property reasoning - AI 的推理内容
 * @property conversationHistoryIndex - 在对话历史中的索引
 * @property checkpoint - 检查点数据
 * @property progressStatus - 工具进度状态
 * @property contextCondense - 上下文压缩数据
 * @property contextTruncation - 上下文截断数据
 * @property isProtected - 是否为受保护的消息
 * @property apiProtocol - API 协议类型
 * @property isAnswered - 询问是否已被回答
 */
export const clineMessageSchema = z.object({
	/** 消息时间戳（Unix 毫秒） */
	ts: z.number(),
	/** 消息类型：ask（询问）或 say（陈述） */
	type: z.union([z.literal("ask"), z.literal("say")]),
	/** 询问类型（当 type 为 "ask" 时） */
	ask: clineAskSchema.optional(),
	/** 陈述类型（当 type 为 "say" 时） */
	say: clineSaySchema.optional(),
	/** 消息文本内容 */
	text: z.string().optional(),
	/** 图像数据 URI 数组 */
	images: z.array(z.string()).optional(),
	/** 是否为部分消息（流式传输中） */
	partial: z.boolean().optional(),
	/** AI 的推理/思考内容 */
	reasoning: z.string().optional(),
	/** 在对话历史中的索引位置 */
	conversationHistoryIndex: z.number().optional(),
	/** 检查点数据（用于任务恢复） */
	checkpoint: z.record(z.string(), z.unknown()).optional(),
	/** 工具执行进度状态 */
	progressStatus: toolProgressStatusSchema.optional(),
	/**
	 * 成功上下文压缩的数据
	 * 当 `say: "condense_context"` 且 `partial: false` 时存在
	 */
	contextCondense: contextCondenseSchema.optional(),
	/**
	 * 滑动窗口截断的数据
	 * 当 `say: "sliding_window_truncation"` 时存在
	 */
	contextTruncation: contextTruncationSchema.optional(),
	/** 是否为受保护的消息（不会被截断） */
	isProtected: z.boolean().optional(),
	/** API 协议类型：openai 或 anthropic */
	apiProtocol: z.union([z.literal("openai"), z.literal("anthropic")]).optional(),
	/** 询问是否已被回答 */
	isAnswered: z.boolean().optional(),
})

/**
 * ClineMessage 类型
 * 扩展和 webview 之间通信的主要消息类型
 */
export type ClineMessage = z.infer<typeof clineMessageSchema>

// ============================================================================
// TokenUsage - Token 使用统计
// ============================================================================

/**
 * Token 使用统计的 Zod 验证模式
 *
 * 记录任务执行期间的 token 使用情况，用于：
 * - 成本计算
 * - 上下文窗口管理
 * - 使用分析
 *
 * @property totalTokensIn - 总输入 token 数
 * @property totalTokensOut - 总输出 token 数
 * @property totalCacheWrites - 总缓存写入 token 数
 * @property totalCacheReads - 总缓存读取 token 数
 * @property totalCost - 总成本（美元）
 * @property contextTokens - 当前上下文 token 数
 */
export const tokenUsageSchema = z.object({
	/** 总输入 token 数 */
	totalTokensIn: z.number(),
	/** 总输出 token 数 */
	totalTokensOut: z.number(),
	/** 总缓存写入 token 数（可选） */
	totalCacheWrites: z.number().optional(),
	/** 总缓存读取 token 数（可选） */
	totalCacheReads: z.number().optional(),
	/** 总成本（美元） */
	totalCost: z.number(),
	/** 当前上下文 token 数 */
	contextTokens: z.number(),
})

/**
 * TokenUsage 类型
 */
export type TokenUsage = z.infer<typeof tokenUsageSchema>

// ============================================================================
// QueuedMessage - 排队消息
// ============================================================================

/**
 * 排队消息的 Zod 验证模式
 *
 * 当用户在 AI 处理期间发送消息时，消息会被排队等待处理。
 * 这允许用户在 AI 忙碌时继续输入，消息会按顺序处理。
 *
 * @property timestamp - 消息创建时间戳
 * @property id - 消息唯一标识符
 * @property text - 消息文本内容
 * @property images - 可选的图像数据 URI 数组
 */
export const queuedMessageSchema = z.object({
	/** 消息创建时间戳 */
	timestamp: z.number(),
	/** 消息唯一标识符 */
	id: z.string(),
	/** 消息文本内容 */
	text: z.string(),
	/** 图像数据 URI 数组（可选） */
	images: z.array(z.string()).optional(),
})

/**
 * QueuedMessage 类型
 */
export type QueuedMessage = z.infer<typeof queuedMessageSchema>
