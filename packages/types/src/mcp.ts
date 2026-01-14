/**
 * @fileoverview MCP (Model Context Protocol) 类型定义
 *
 * 这个文件定义了 Roo Code 中 MCP 服务器相关的所有类型。
 * MCP 是一种协议，允许 AI 助手与外部工具和资源进行交互。
 *
 * 主要类型：
 * - McpServer: MCP 服务器配置和状态
 * - McpTool: MCP 服务器提供的工具
 * - McpResource: MCP 服务器提供的资源
 * - McpExecutionStatus: 工具执行状态
 * - McpToolCallResponse: 工具调用响应
 *
 * MCP 服务器可以提供：
 * - 工具（Tools）：可执行的功能，如数据库查询、API 调用等
 * - 资源（Resources）：可读取的数据，如文件、配置等
 * - 资源模板（Resource Templates）：动态生成资源的模板
 */

import { z } from "zod"

// ============================================================================
// McpServerUse - MCP 服务器使用记录
// ============================================================================

/**
 * MCP 服务器使用记录
 *
 * 记录 AI 使用 MCP 服务器的情况，用于：
 * - 权限检查
 * - 使用统计
 * - 审计日志
 */
export interface McpServerUse {
	/** 使用类型：tool（工具）或 resource（资源） */
	type: string
	/** 服务器名称 */
	serverName: string
	/** 工具名称（如果是工具调用） */
	toolName?: string
	/** 资源 URI（如果是资源访问） */
	uri?: string
}

// ============================================================================
// McpExecutionStatus - MCP 执行状态
// ============================================================================

/**
 * MCP 执行状态的 Zod 验证模式
 *
 * 使用 discriminatedUnion 实现类型安全的状态追踪。
 * 执行状态流程：started -> output* -> completed/error
 */
export const mcpExecutionStatusSchema = z.discriminatedUnion("status", [
	/** 执行开始状态 */
	z.object({
		/** 执行唯一标识符 */
		executionId: z.string(),
		/** 状态：已开始 */
		status: z.literal("started"),
		/** 服务器名称 */
		serverName: z.string(),
		/** 工具名称 */
		toolName: z.string(),
	}),
	/** 执行输出状态（可能有多个） */
	z.object({
		/** 执行唯一标识符 */
		executionId: z.string(),
		/** 状态：输出 */
		status: z.literal("output"),
		/** 输出内容 */
		response: z.string(),
	}),
	/** 执行完成状态 */
	z.object({
		/** 执行唯一标识符 */
		executionId: z.string(),
		/** 状态：已完成 */
		status: z.literal("completed"),
		/** 最终响应（可选） */
		response: z.string().optional(),
	}),
	/** 执行错误状态 */
	z.object({
		/** 执行唯一标识符 */
		executionId: z.string(),
		/** 状态：错误 */
		status: z.literal("error"),
		/** 错误信息 */
		error: z.string().optional(),
	}),
])

/**
 * MCP 执行状态类型
 */
export type McpExecutionStatus = z.infer<typeof mcpExecutionStatusSchema>

// ============================================================================
// McpServer - MCP 服务器
// ============================================================================

/**
 * MCP 服务器类型
 *
 * 表示一个 MCP 服务器的完整配置和状态。
 * 服务器可以来自全局配置或项目配置。
 */
export type McpServer = {
	/** 服务器名称（唯一标识符） */
	name: string
	/** 服务器配置（JSON 字符串） */
	config: string
	/** 连接状态 */
	status: "connected" | "connecting" | "disconnected"
	/** 错误信息（如果有） */
	error?: string
	/** 错误历史记录 */
	errorHistory?: McpErrorEntry[]
	/** 服务器提供的工具列表 */
	tools?: McpTool[]
	/** 服务器提供的资源列表 */
	resources?: McpResource[]
	/** 服务器提供的资源模板列表 */
	resourceTemplates?: McpResourceTemplate[]
	/** 是否禁用 */
	disabled?: boolean
	/** 超时时间（毫秒） */
	timeout?: number
	/** 配置来源：global（全局）或 project（项目） */
	source?: "global" | "project"
	/** 项目路径（如果是项目级配置） */
	projectPath?: string
	/** 服务器使用说明 */
	instructions?: string
}

// ============================================================================
// McpTool - MCP 工具
// ============================================================================

/**
 * MCP 工具类型
 *
 * 表示 MCP 服务器提供的一个可执行工具。
 */
export type McpTool = {
	/** 工具名称 */
	name: string
	/** 工具描述 */
	description?: string
	/** 输入参数的 JSON Schema */
	inputSchema?: object
	/** 是否始终允许执行（无需用户确认） */
	alwaysAllow?: boolean
	/** 是否在提示词中启用 */
	enabledForPrompt?: boolean
}

// ============================================================================
// McpResource - MCP 资源
// ============================================================================

/**
 * MCP 资源类型
 *
 * 表示 MCP 服务器提供的一个可读取资源。
 */
export type McpResource = {
	/** 资源 URI */
	uri: string
	/** 资源名称 */
	name: string
	/** MIME 类型 */
	mimeType?: string
	/** 资源描述 */
	description?: string
}

// ============================================================================
// McpResourceTemplate - MCP 资源模板
// ============================================================================

/**
 * MCP 资源模板类型
 *
 * 表示 MCP 服务器提供的资源模板，用于动态生成资源。
 * URI 模板支持变量替换，如 "file://{path}"。
 */
export type McpResourceTemplate = {
	/** URI 模板（支持变量） */
	uriTemplate: string
	/** 模板名称 */
	name: string
	/** 模板描述 */
	description?: string
	/** 生成资源的 MIME 类型 */
	mimeType?: string
}

// ============================================================================
// McpResourceResponse - MCP 资源响应
// ============================================================================

/**
 * MCP 资源响应类型
 *
 * 访问 MCP 资源时返回的响应格式。
 */
export type McpResourceResponse = {
	/** 元数据 */
	_meta?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
	/** 资源内容列表 */
	contents: Array<{
		/** 资源 URI */
		uri: string
		/** MIME 类型 */
		mimeType?: string
		/** 文本内容 */
		text?: string
		/** Base64 编码的二进制内容 */
		blob?: string
	}>
}

// ============================================================================
// McpToolCallResponse - MCP 工具调用响应
// ============================================================================

/**
 * MCP 工具调用响应类型
 *
 * 调用 MCP 工具时返回的响应格式。
 * 支持多种内容类型：文本、图像、音频、资源。
 */
export type McpToolCallResponse = {
	/** 元数据 */
	_meta?: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
	/** 响应内容列表 */
	content: Array<
		| {
				/** 文本内容 */
				type: "text"
				text: string
		  }
		| {
				/** 图像内容 */
				type: "image"
				/** Base64 编码的图像数据 */
				data: string
				/** 图像 MIME 类型 */
				mimeType: string
		  }
		| {
				/** 音频内容 */
				type: "audio"
				/** Base64 编码的音频数据 */
				data: string
				/** 音频 MIME 类型 */
				mimeType: string
		  }
		| {
				/** 资源内容 */
				type: "resource"
				resource: {
					uri: string
					mimeType?: string
					text?: string
					blob?: string
				}
		  }
	>
	/** 是否为错误响应 */
	isError?: boolean
}

// ============================================================================
// McpErrorEntry - MCP 错误记录
// ============================================================================

/**
 * MCP 错误记录类型
 *
 * 记录 MCP 服务器的错误历史。
 */
export type McpErrorEntry = {
	/** 错误消息 */
	message: string
	/** 错误时间戳（Unix 毫秒） */
	timestamp: number
	/** 错误级别 */
	level: "error" | "warn" | "info"
}
