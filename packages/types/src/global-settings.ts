/**
 * @fileoverview 全局设置类型定义
 *
 * 这个文件定义了 Roo Code 中全局设置相关的所有类型。
 * 全局设置是用户级别的配置，存储在 VS Code 的 globalState 中。
 *
 * 主要类型：
 * - GlobalSettings: 全局设置（UI 偏好、自动批准、终端配置等）
 * - RooCodeSettings: 完整设置（GlobalSettings + ProviderSettings）
 * - SecretState: 敏感信息（API 密钥等）
 * - GlobalState: 非敏感的全局状态
 *
 * 设置分类：
 * - API 配置：提供者配置文件管理
 * - 自动批准：控制哪些操作需要用户确认
 * - 浏览器工具：浏览器自动化配置
 * - 终端配置：终端输出和 shell 集成
 * - 代码库索引：代码搜索和索引配置
 * - 模式配置：工作模式和自定义模式
 */

import { z } from "zod"

import { type Keys } from "./type-fu.js"
import {
	type ProviderSettings,
	PROVIDER_SETTINGS_KEYS,
	providerSettingsEntrySchema,
	providerSettingsSchema,
} from "./provider-settings.js"
import { historyItemSchema } from "./history.js"
import { codebaseIndexModelsSchema, codebaseIndexConfigSchema } from "./codebase-index.js"
import { experimentsSchema } from "./experiment.js"
import { telemetrySettingsSchema } from "./telemetry.js"
import { modeConfigSchema } from "./mode.js"
import { customModePromptsSchema, customSupportPromptsSchema } from "./mode.js"
import { languagesSchema } from "./vscode.js"

// ============================================================================
// 常量定义
// ============================================================================

/**
 * 默认写入延迟（毫秒）
 *
 * 文件写入后等待诊断工具检测潜在问题的延迟时间。
 * 这个延迟对于 Go 等语言特别重要，因为 goimports 等工具
 * 需要时间来自动清理未使用的导入。
 */
export const DEFAULT_WRITE_DELAY_MS = 1000

/**
 * 默认终端输出字符限制
 *
 * 提供合理的默认值，符合典型终端使用场景，
 * 同时防止超长行导致上下文窗口溢出。
 */
export const DEFAULT_TERMINAL_OUTPUT_CHARACTER_LIMIT = 50_000

/**
 * 最小检查点超时时间（秒）
 */
export const MIN_CHECKPOINT_TIMEOUT_SECONDS = 10

/**
 * 最大检查点超时时间（秒）
 */
export const MAX_CHECKPOINT_TIMEOUT_SECONDS = 60

/**
 * 默认检查点超时时间（秒）
 */
export const DEFAULT_CHECKPOINT_TIMEOUT_SECONDS = 15

// ============================================================================
// GlobalSettings - 全局设置
// ============================================================================

/**
 * 全局设置的 Zod 验证模式
 *
 * 包含所有用户级别的配置选项，分为以下几类：
 * - API 配置管理
 * - 自动批准设置
 * - 浏览器工具配置
 * - 终端配置
 * - 代码库索引配置
 * - 模式配置
 * - UI 偏好
 */
export const globalSettingsSchema = z.object({
	// ========================================================================
	// API 配置管理
	// ========================================================================

	/** 当前激活的 API 配置文件名称 */
	currentApiConfigName: z.string().optional(),
	/** API 配置文件元数据列表 */
	listApiConfigMeta: z.array(providerSettingsEntrySchema).optional(),
	/** 固定的 API 配置（在 UI 中置顶显示） */
	pinnedApiConfigs: z.record(z.string(), z.boolean()).optional(),

	// ========================================================================
	// 通用设置
	// ========================================================================

	/** 最后显示的公告 ID（用于避免重复显示） */
	lastShownAnnouncementId: z.string().optional(),
	/** 自定义指令（添加到系统提示词中） */
	customInstructions: z.string().optional(),
	/** 任务历史记录 */
	taskHistory: z.array(historyItemSchema).optional(),
	/** 已关闭的升级提示 ID 列表 */
	dismissedUpsells: z.array(z.string()).optional(),

	// ========================================================================
	// 图像生成设置（实验性功能）
	// ========================================================================

	/** 图像生成提供者 */
	imageGenerationProvider: z.enum(["openrouter", "roo"]).optional(),
	/** OpenRouter 图像生成 API 密钥 */
	openRouterImageApiKey: z.string().optional(),
	/** OpenRouter 图像生成选中的模型 */
	openRouterImageGenerationSelectedModel: z.string().optional(),

	// ========================================================================
	// 上下文压缩设置
	// ========================================================================

	/** 用于上下文压缩的 API 配置 ID */
	condensingApiConfigId: z.string().optional(),
	/** 自定义上下文压缩提示词 */
	customCondensingPrompt: z.string().optional(),

	// ========================================================================
	// 自动批准设置
	// ========================================================================

	/** 是否启用自动批准 */
	autoApprovalEnabled: z.boolean().optional(),
	/** 始终允许只读操作（工作区内） */
	alwaysAllowReadOnly: z.boolean().optional(),
	/** 始终允许只读操作（工作区外） */
	alwaysAllowReadOnlyOutsideWorkspace: z.boolean().optional(),
	/** 始终允许写入操作（工作区内） */
	alwaysAllowWrite: z.boolean().optional(),
	/** 始终允许写入操作（工作区外） */
	alwaysAllowWriteOutsideWorkspace: z.boolean().optional(),
	/** 始终允许写入受保护文件 */
	alwaysAllowWriteProtected: z.boolean().optional(),
	/** 写入延迟（毫秒），等待诊断工具检测问题 */
	writeDelayMs: z.number().min(0).optional(),
	/** 始终允许浏览器操作 */
	alwaysAllowBrowser: z.boolean().optional(),
	/** 请求延迟（秒），用于速率限制 */
	requestDelaySeconds: z.number().optional(),
	/** 始终允许 MCP 工具调用 */
	alwaysAllowMcp: z.boolean().optional(),
	/** 始终允许模式切换 */
	alwaysAllowModeSwitch: z.boolean().optional(),
	/** 始终允许创建子任务 */
	alwaysAllowSubtasks: z.boolean().optional(),
	/** 始终允许执行命令 */
	alwaysAllowExecute: z.boolean().optional(),
	/** 始终允许后续问题 */
	alwaysAllowFollowupQuestions: z.boolean().optional(),
	/** 后续问题自动批准超时（毫秒） */
	followupAutoApproveTimeoutMs: z.number().optional(),
	/** 允许执行的命令列表（支持通配符） */
	allowedCommands: z.array(z.string()).optional(),
	/** 禁止执行的命令列表 */
	deniedCommands: z.array(z.string()).optional(),
	/** 命令执行超时（秒） */
	commandExecutionTimeout: z.number().optional(),
	/** 命令超时白名单（这些命令不受超时限制） */
	commandTimeoutAllowlist: z.array(z.string()).optional(),
	/** 是否阻止在有未完成待办事项时完成任务 */
	preventCompletionWithOpenTodos: z.boolean().optional(),
	/** 允许的最大请求数 */
	allowedMaxRequests: z.number().nullish(),
	/** 允许的最大成本（美元） */
	allowedMaxCost: z.number().nullish(),
	/** 是否自动压缩上下文 */
	autoCondenseContext: z.boolean().optional(),
	/** 自动压缩上下文的阈值百分比 */
	autoCondenseContextPercent: z.number().optional(),
	/** 最大并发文件读取数 */
	maxConcurrentFileReads: z.number().optional(),

	// ========================================================================
	// 环境详情设置
	// ========================================================================

	/**
	 * 是否在环境详情中包含当前时间
	 * @default true
	 */
	includeCurrentTime: z.boolean().optional(),
	/**
	 * 是否在环境详情中包含当前成本
	 * @default true
	 */
	includeCurrentCost: z.boolean().optional(),
	/**
	 * 环境详情中包含的最大 git status 文件数
	 * 设为 0 禁用 git status。当 > 0 时始终包含头部信息（分支、提交）。
	 * @default 0
	 */
	maxGitStatusFiles: z.number().optional(),

	/**
	 * 是否在工具输出中包含诊断消息（错误、警告）
	 * @default true
	 */
	includeDiagnosticMessages: z.boolean().optional(),
	/**
	 * 工具输出中包含的最大诊断消息数
	 * @default 50
	 */
	maxDiagnosticMessages: z.number().optional(),

	// ========================================================================
	// 浏览器工具配置
	// ========================================================================

	/** 是否启用浏览器工具 */
	browserToolEnabled: z.boolean().optional(),
	/** 浏览器视口大小（如 "1280x720"） */
	browserViewportSize: z.string().optional(),
	/** 截图质量（0-100） */
	screenshotQuality: z.number().optional(),
	/** 是否启用远程浏览器 */
	remoteBrowserEnabled: z.boolean().optional(),
	/** 远程浏览器主机地址 */
	remoteBrowserHost: z.string().optional(),
	/** 缓存的 Chrome 主机 URL */
	cachedChromeHostUrl: z.string().optional(),

	// ========================================================================
	// 检查点配置
	// ========================================================================

	/** 是否启用检查点（用于任务恢复） */
	enableCheckpoints: z.boolean().optional(),
	/** 检查点超时时间（秒） */
	checkpointTimeout: z
		.number()
		.int()
		.min(MIN_CHECKPOINT_TIMEOUT_SECONDS)
		.max(MAX_CHECKPOINT_TIMEOUT_SECONDS)
		.optional(),

	// ========================================================================
	// 音频设置
	// ========================================================================

	/** 是否启用文字转语音 */
	ttsEnabled: z.boolean().optional(),
	/** 文字转语音速度 */
	ttsSpeed: z.number().optional(),
	/** 是否启用声音提示 */
	soundEnabled: z.boolean().optional(),
	/** 声音音量（0-1） */
	soundVolume: z.number().optional(),

	// ========================================================================
	// 文件和工作区设置
	// ========================================================================

	/** 上下文中包含的最大打开标签页数 */
	maxOpenTabsContext: z.number().optional(),
	/** 工作区中包含的最大文件数 */
	maxWorkspaceFiles: z.number().optional(),
	/** 是否显示被 .rooignore 忽略的文件 */
	showRooIgnoredFiles: z.boolean().optional(),
	/** 是否启用子文件夹规则 */
	enableSubfolderRules: z.boolean().optional(),
	/** 读取文件的最大行数（-1 表示无限制） */
	maxReadFileLine: z.number().optional(),
	/** 单个图像文件的最大大小（字节） */
	maxImageFileSize: z.number().optional(),
	/** 所有图像的最大总大小（字节） */
	maxTotalImageSize: z.number().optional(),

	// ========================================================================
	// 终端配置
	// ========================================================================

	/** 终端输出行数限制 */
	terminalOutputLineLimit: z.number().optional(),
	/** 终端输出字符限制 */
	terminalOutputCharacterLimit: z.number().optional(),
	/** 终端 shell 集成超时（毫秒） */
	terminalShellIntegrationTimeout: z.number().optional(),
	/** 是否禁用终端 shell 集成 */
	terminalShellIntegrationDisabled: z.boolean().optional(),
	/** 终端命令延迟（毫秒） */
	terminalCommandDelay: z.number().optional(),
	/** PowerShell 计数器（用于命令追踪） */
	terminalPowershellCounter: z.boolean().optional(),
	/** Zsh 清除行尾标记 */
	terminalZshClearEolMark: z.boolean().optional(),
	/** Oh My Zsh 支持 */
	terminalZshOhMy: z.boolean().optional(),
	/** Powerlevel10k 支持 */
	terminalZshP10k: z.boolean().optional(),
	/** ZDOTDIR 支持 */
	terminalZdotdir: z.boolean().optional(),
	/** 是否压缩进度条输出 */
	terminalCompressProgressBar: z.boolean().optional(),

	// ========================================================================
	// 诊断和调试
	// ========================================================================

	/** 是否启用诊断功能 */
	diagnosticsEnabled: z.boolean().optional(),

	// ========================================================================
	// Diff 和模糊匹配
	// ========================================================================

	/** 请求速率限制（秒） */
	rateLimitSeconds: z.number().optional(),
	/** 是否启用 diff 功能 */
	diffEnabled: z.boolean().optional(),
	/** 模糊匹配阈值（0-1，1 表示精确匹配） */
	fuzzyMatchThreshold: z.number().optional(),
	/** 实验性功能开关 */
	experiments: experimentsSchema.optional(),

	// ========================================================================
	// 代码库索引配置
	// ========================================================================

	/** 代码库索引使用的模型配置 */
	codebaseIndexModels: codebaseIndexModelsSchema.optional(),
	/** 代码库索引配置 */
	codebaseIndexConfig: codebaseIndexConfigSchema.optional(),

	// ========================================================================
	// 本地化
	// ========================================================================

	/** 界面语言 */
	language: languagesSchema.optional(),

	// ========================================================================
	// 遥测
	// ========================================================================

	/** 遥测设置 */
	telemetrySetting: telemetrySettingsSchema.optional(),

	// ========================================================================
	// MCP 配置
	// ========================================================================

	/** 是否启用 MCP */
	mcpEnabled: z.boolean().optional(),
	/** 是否允许创建 MCP 服务器 */
	enableMcpServerCreation: z.boolean().optional(),

	// ========================================================================
	// 模式配置
	// ========================================================================

	/** 当前工作模式 */
	mode: z.string().optional(),
	/** 模式与 API 配置的映射 */
	modeApiConfigs: z.record(z.string(), z.string()).optional(),
	/** 自定义模式列表 */
	customModes: z.array(modeConfigSchema).optional(),
	/** 自定义模式提示词 */
	customModePrompts: customModePromptsSchema.optional(),
	/** 自定义支持提示词 */
	customSupportPrompts: customSupportPromptsSchema.optional(),
	/** 增强功能使用的 API 配置 ID */
	enhancementApiConfigId: z.string().optional(),
	/** 增强功能是否包含任务历史 */
	includeTaskHistoryInEnhance: z.boolean().optional(),
	/** 历史预览是否折叠 */
	historyPreviewCollapsed: z.boolean().optional(),
	/** 推理块是否折叠 */
	reasoningBlockCollapsed: z.boolean().optional(),
	/**
	 * 聊天输入框的回车键行为
	 * - "send": 回车发送消息，Shift+回车换行（默认）
	 * - "newline": 回车换行，Shift+回车或 Ctrl+回车发送消息
	 * @default "send"
	 */
	enterBehavior: z.enum(["send", "newline"]).optional(),
	/** 配置文件阈值（用于自动切换） */
	profileThresholds: z.record(z.string(), z.number()).optional(),
	/** 是否已打开过模式选择器 */
	hasOpenedModeSelector: z.boolean().optional(),
	/** 上次模式导出路径 */
	lastModeExportPath: z.string().optional(),
	/** 上次模式导入路径 */
	lastModeImportPath: z.string().optional(),
})

/**
 * 全局设置类型
 */
export type GlobalSettings = z.infer<typeof globalSettingsSchema>

/**
 * 全局设置键列表
 */
export const GLOBAL_SETTINGS_KEYS = globalSettingsSchema.keyof().options

// ============================================================================
// RooCodeSettings - 完整设置
// ============================================================================

/**
 * RooCode 完整设置的 Zod 验证模式
 *
 * 合并了 ProviderSettings 和 GlobalSettings，
 * 包含所有可配置的选项。
 */
export const rooCodeSettingsSchema = providerSettingsSchema.merge(globalSettingsSchema)

/**
 * RooCode 完整设置类型
 *
 * 包含：
 * - 提供者设置（API 密钥、模型配置等）
 * - 全局设置（UI 偏好、自动批准等）
 */
export type RooCodeSettings = GlobalSettings & ProviderSettings

// ============================================================================
// SecretState - 敏感信息存储
// ============================================================================

/**
 * 敏感信息键列表
 *
 * 这些键对应的值会存储在 VS Code 的 SecretStorage 中，
 * 而不是普通的 globalState 中，以确保安全性。
 */
export const SECRET_STATE_KEYS = [
	"apiKey",
	"openRouterApiKey",
	"awsAccessKey",
	"awsApiKey",
	"awsSecretKey",
	"awsSessionToken",
	"openAiApiKey",
	"ollamaApiKey",
	"geminiApiKey",
	"openAiNativeApiKey",
	"cerebrasApiKey",
	"deepSeekApiKey",
	"doubaoApiKey",
	"moonshotApiKey",
	"mistralApiKey",
	"minimaxApiKey",
	"unboundApiKey",
	"requestyApiKey",
	"xaiApiKey",
	"groqApiKey",
	"chutesApiKey",
	"litellmApiKey",
	"deepInfraApiKey",
	"codeIndexOpenAiKey",
	"codeIndexQdrantApiKey",
	"codebaseIndexOpenAiCompatibleApiKey",
	"codebaseIndexGeminiApiKey",
	"codebaseIndexMistralApiKey",
	"codebaseIndexVercelAiGatewayApiKey",
	"codebaseIndexOpenRouterApiKey",
	"huggingFaceApiKey",
	"sambaNovaApiKey",
	"zaiApiKey",
	"fireworksApiKey",
	"featherlessApiKey",
	"ioIntelligenceApiKey",
	"vercelAiGatewayApiKey",
	"basetenApiKey",
] as const

/**
 * 全局敏感信息键列表
 *
 * 这些是 GlobalSettings 中的敏感信息（不是 ProviderSettings 中的）
 */
export const GLOBAL_SECRET_KEYS = [
	"openRouterImageApiKey", // 用于图像生成
] as const

/** 提供者敏感信息键类型 */
type ProviderSecretKey = (typeof SECRET_STATE_KEYS)[number]

/** 全局敏感信息键类型 */
type GlobalSecretKey = (typeof GLOBAL_SECRET_KEYS)[number]

/**
 * 敏感信息状态类型
 *
 * 包含所有可以存储的敏感信息。
 * 这些信息存储在 VS Code 的 SecretStorage 中。
 */
export type SecretState = Pick<ProviderSettings, Extract<ProviderSecretKey, keyof ProviderSettings>> & {
	[K in GlobalSecretKey]?: string
}

/**
 * 检查键是否为敏感信息键
 *
 * @param key - 要检查的键名
 * @returns 如果是敏感信息键返回 true
 */
export const isSecretStateKey = (key: string): key is Keys<SecretState> =>
	SECRET_STATE_KEYS.includes(key as ProviderSecretKey) || GLOBAL_SECRET_KEYS.includes(key as GlobalSecretKey)

// ============================================================================
// GlobalState - 非敏感全局状态
// ============================================================================

/**
 * 全局状态类型
 *
 * 从 RooCodeSettings 中排除敏感信息后的类型。
 * 这些信息存储在 VS Code 的 globalState 中。
 */
export type GlobalState = Omit<RooCodeSettings, Keys<SecretState>>

/**
 * 全局状态键列表
 *
 * 包含所有非敏感的设置键。
 */
export const GLOBAL_STATE_KEYS = [...GLOBAL_SETTINGS_KEYS, ...PROVIDER_SETTINGS_KEYS].filter(
	(key: Keys<RooCodeSettings>) => !isSecretStateKey(key),
) as Keys<GlobalState>[]

/**
 * 检查键是否为全局状态键
 *
 * @param key - 要检查的键名
 * @returns 如果是全局状态键返回 true
 */
export const isGlobalStateKey = (key: string): key is Keys<GlobalState> =>
	GLOBAL_STATE_KEYS.includes(key as Keys<GlobalState>)

// ============================================================================
// EVALS_SETTINGS - 评估默认设置
// ============================================================================

/**
 * 评估运行时的默认设置
 *
 * 这些设置用于自动化评估测试，除非被覆盖。
 * 主要特点：
 * - 启用自动批准以避免人工干预
 * - 禁用浏览器工具和检查点以简化测试
 * - 使用 OpenRouter 作为默认提供者
 */
export const EVALS_SETTINGS: RooCodeSettings = {
	apiProvider: "openrouter",

	lastShownAnnouncementId: "jul-09-2025-3-23-0",

	pinnedApiConfigs: {},

	// 自动批准设置 - 评估时全部启用
	autoApprovalEnabled: true,
	alwaysAllowReadOnly: true,
	alwaysAllowReadOnlyOutsideWorkspace: false,
	alwaysAllowWrite: true,
	alwaysAllowWriteOutsideWorkspace: false,
	alwaysAllowWriteProtected: false,
	writeDelayMs: 1000,
	alwaysAllowBrowser: true,
	requestDelaySeconds: 10,
	alwaysAllowMcp: true,
	alwaysAllowModeSwitch: true,
	alwaysAllowSubtasks: true,
	alwaysAllowExecute: true,
	alwaysAllowFollowupQuestions: true,
	followupAutoApproveTimeoutMs: 0,
	allowedCommands: ["*"],
	commandExecutionTimeout: 20,
	commandTimeoutAllowlist: [],
	preventCompletionWithOpenTodos: false,

	// 浏览器工具 - 评估时禁用
	browserToolEnabled: false,
	browserViewportSize: "900x600",
	screenshotQuality: 75,
	remoteBrowserEnabled: false,

	// 音频 - 评估时禁用
	ttsEnabled: false,
	ttsSpeed: 1,
	soundEnabled: false,
	soundVolume: 0.5,

	// 终端配置
	terminalOutputLineLimit: 500,
	terminalOutputCharacterLimit: DEFAULT_TERMINAL_OUTPUT_CHARACTER_LIMIT,
	terminalShellIntegrationTimeout: 30000,
	terminalCommandDelay: 0,
	terminalPowershellCounter: false,
	terminalZshOhMy: true,
	terminalZshClearEolMark: true,
	terminalZshP10k: false,
	terminalZdotdir: true,
	terminalCompressProgressBar: true,
	terminalShellIntegrationDisabled: true,

	// 诊断
	diagnosticsEnabled: true,

	// Diff 设置
	diffEnabled: true,
	fuzzyMatchThreshold: 1,

	// 检查点 - 评估时禁用
	enableCheckpoints: false,

	// 其他设置
	rateLimitSeconds: 0,
	maxOpenTabsContext: 20,
	maxWorkspaceFiles: 200,
	maxGitStatusFiles: 20,
	showRooIgnoredFiles: true,
	maxReadFileLine: -1, // -1 启用完整文件读取

	includeDiagnosticMessages: true,
	maxDiagnosticMessages: 50,

	language: "en",
	telemetrySetting: "enabled",

	// MCP - 评估时禁用
	mcpEnabled: false,

	// 默认使用 code 模式
	mode: "code", // "architect",

	customModes: [],
}

/**
 * 评估超时时间（毫秒）
 *
 * 单个评估任务的最大执行时间：5 分钟
 */
export const EVALS_TIMEOUT = 5 * 60 * 1_000
