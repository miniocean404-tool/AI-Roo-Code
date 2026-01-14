/**
 * @fileoverview 任务类型定义
 *
 * 这个文件定义了 Roo Code 中任务管理相关的所有类型。
 * 任务是 AI 对话的核心单元，每个任务代表一次完整的 AI 交互会话。
 *
 * 主要接口：
 * - TaskProviderLike: 任务提供者接口，管理任务的创建、恢复、取消等
 * - TaskLike: 单个任务的接口，包含任务状态、消息、token 使用等
 * - TaskStatus: 任务状态枚举
 * - TaskEvents: 任务级别的事件类型
 * - TaskProviderEvents: 任务提供者级别的事件类型
 *
 * 任务层级结构：
 * - 根任务（Root Task）：用户直接创建的任务
 * - 子任务（Child Task）：通过 new_task 工具委派创建的任务
 * - 任务栈（Task Stack）：嵌套任务形成的栈结构
 */

import { z } from "zod"

import { RooCodeEventName } from "./events.js"
import type { RooCodeSettings } from "./global-settings.js"
import type { ClineMessage, QueuedMessage, TokenUsage } from "./message.js"
import type { ToolUsage, ToolName } from "./tool.js"
import type { StaticAppProperties, GitProperties, TelemetryProperties } from "./telemetry.js"
import type { TodoItem } from "./todo.js"

// ============================================================================
// TaskProviderLike - 任务提供者接口
// ============================================================================

/**
 * 任务提供者接口
 *
 * 这是管理所有任务的核心接口，由 ClineProvider 实现。
 * 提供任务的创建、恢复、取消等功能，以及模式和配置文件的管理。
 *
 * 主要职责：
 * - 任务生命周期管理（创建、恢复、取消、清除）
 * - 模式管理（获取、设置当前模式）
 * - 提供者配置文件管理
 * - 遥测数据收集
 * - 事件发射
 */
export interface TaskProviderLike {
	// ========================================================================
	// 任务管理方法
	// ========================================================================

	/**
	 * 获取当前活动任务
	 * @returns 当前任务，如果没有活动任务则返回 undefined
	 */
	getCurrentTask(): TaskLike | undefined

	/**
	 * 获取最近的任务 ID 列表
	 * @returns 任务 ID 数组
	 */
	getRecentTasks(): string[]

	/**
	 * 创建新任务
	 *
	 * @param text - 可选的初始消息文本
	 * @param images - 可选的图像数据 URI 数组
	 * @param parentTask - 可选的父任务（用于任务委派）
	 * @param options - 可选的任务创建选项
	 * @param configuration - 可选的任务配置
	 * @returns 创建的任务实例
	 */
	createTask(
		text?: string,
		images?: string[],
		parentTask?: TaskLike,
		options?: CreateTaskOptions,
		configuration?: RooCodeSettings,
	): Promise<TaskLike>

	/**
	 * 取消当前任务
	 * 中止正在执行的 AI 请求
	 */
	cancelTask(): Promise<void>

	/**
	 * 清除当前任务
	 * 结束任务并清理资源
	 */
	clearTask(): Promise<void>

	/**
	 * 恢复指定 ID 的任务
	 * @param taskId - 要恢复的任务 ID
	 */
	resumeTask(taskId: string): void

	// ========================================================================
	// 模式管理方法
	// ========================================================================

	/**
	 * 获取所有可用模式
	 * @returns 模式列表，包含 slug 和名称
	 */
	getModes(): Promise<{ slug: string; name: string }[]>

	/**
	 * 获取当前模式
	 * @returns 当前模式的 slug
	 */
	getMode(): Promise<string>

	/**
	 * 设置当前模式
	 * @param mode - 要设置的模式 slug
	 */
	setMode(mode: string): Promise<void>

	// ========================================================================
	// 提供者配置文件管理方法
	// ========================================================================

	/**
	 * 获取所有提供者配置文件
	 * @returns 配置文件列表，包含名称和可选的提供者类型
	 */
	getProviderProfiles(): Promise<{ name: string; provider?: string }[]>

	/**
	 * 获取当前激活的配置文件
	 * @returns 当前配置文件名称
	 */
	getProviderProfile(): Promise<string>

	/**
	 * 设置激活的配置文件
	 * @param providerProfile - 要激活的配置文件名称
	 */
	setProviderProfile(providerProfile: string): Promise<void>

	// ========================================================================
	// 遥测相关属性和方法
	// ========================================================================

	/** 静态应用属性（版本、平台等） */
	readonly appProperties: StaticAppProperties

	/** Git 仓库属性（如果在 Git 仓库中） */
	readonly gitProperties: GitProperties | undefined

	/**
	 * 获取遥测属性
	 * @returns 完整的遥测属性对象
	 */
	getTelemetryProperties(): Promise<TelemetryProperties>

	/** 当前工作目录 */
	readonly cwd: string

	// ========================================================================
	// 事件发射器方法
	// ========================================================================

	/**
	 * 注册事件监听器
	 * @param event - 事件名称
	 * @param listener - 事件处理函数
	 */
	on<K extends keyof TaskProviderEvents>(
		event: K,
		listener: (...args: TaskProviderEvents[K]) => void | Promise<void>,
	): this

	/**
	 * 移除事件监听器
	 * @param event - 事件名称
	 * @param listener - 要移除的事件处理函数
	 */
	off<K extends keyof TaskProviderEvents>(
		event: K,
		listener: (...args: TaskProviderEvents[K]) => void | Promise<void>,
	): this

	// @TODO: Find a better way to do this.
	/**
	 * 将状态发送到 Webview
	 * 用于同步扩展状态到前端 UI
	 */
	postStateToWebview(): Promise<void>
}

// ============================================================================
// TaskProviderEvents - 任务提供者事件类型
// ============================================================================

/**
 * 任务提供者事件类型映射
 *
 * 定义了 TaskProviderLike 可以发射的所有事件及其参数类型。
 * 这些事件在任务提供者级别触发，用于跟踪所有任务的状态变化。
 */
export type TaskProviderEvents = {
	// 任务生命周期事件
	/** 任务创建事件：[task] */
	[RooCodeEventName.TaskCreated]: [task: TaskLike]
	/** 任务开始事件：[taskId] */
	[RooCodeEventName.TaskStarted]: [taskId: string]
	/** 任务完成事件：[taskId, tokenUsage, toolUsage] */
	[RooCodeEventName.TaskCompleted]: [taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage]
	/** 任务中止事件：[taskId] */
	[RooCodeEventName.TaskAborted]: [taskId: string]
	/** 任务获得焦点事件：[taskId] */
	[RooCodeEventName.TaskFocused]: [taskId: string]
	/** 任务失去焦点事件：[taskId] */
	[RooCodeEventName.TaskUnfocused]: [taskId: string]
	/** 任务活跃事件：[taskId] */
	[RooCodeEventName.TaskActive]: [taskId: string]
	/** 任务交互事件：[taskId] */
	[RooCodeEventName.TaskInteractive]: [taskId: string]
	/** 任务可恢复事件：[taskId] */
	[RooCodeEventName.TaskResumable]: [taskId: string]
	/** 任务空闲事件：[taskId] */
	[RooCodeEventName.TaskIdle]: [taskId: string]

	// 子任务生命周期事件
	/** 任务暂停事件：[taskId] */
	[RooCodeEventName.TaskPaused]: [taskId: string]
	/** 任务恢复事件：[taskId] */
	[RooCodeEventName.TaskUnpaused]: [taskId: string]
	/** 任务派生事件：[taskId] */
	[RooCodeEventName.TaskSpawned]: [taskId: string]
	/** 任务委派事件：[parentTaskId, childTaskId] */
	[RooCodeEventName.TaskDelegated]: [parentTaskId: string, childTaskId: string]
	/** 任务委派完成事件：[parentTaskId, childTaskId, summary] */
	[RooCodeEventName.TaskDelegationCompleted]: [parentTaskId: string, childTaskId: string, summary: string]
	/** 任务委派恢复事件：[parentTaskId, childTaskId] */
	[RooCodeEventName.TaskDelegationResumed]: [parentTaskId: string, childTaskId: string]

	// 任务执行事件
	/** 任务用户消息事件：[taskId] */
	[RooCodeEventName.TaskUserMessage]: [taskId: string]

	// 任务分析事件
	/** Token 使用更新事件：[taskId, tokenUsage, toolUsage] */
	[RooCodeEventName.TaskTokenUsageUpdated]: [taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage]

	// 配置变更事件
	/** 模式变更事件：[mode] */
	[RooCodeEventName.ModeChanged]: [mode: string]
	/** 提供者配置文件变更事件：[config] */
	[RooCodeEventName.ProviderProfileChanged]: [config: { name: string; provider?: string }]
}

// ============================================================================
// CreateTaskOptions - 任务创建选项
// ============================================================================

/**
 * 任务创建选项
 *
 * 用于在创建任务时传递额外的配置选项。
 * 这些选项可以覆盖默认的任务行为。
 */
export interface CreateTaskOptions {
	/** 是否启用 diff 功能（用于文件编辑） */
	enableDiff?: boolean
	/** 是否启用检查点功能（用于任务恢复） */
	enableCheckpoints?: boolean
	/** 模糊匹配阈值（用于 diff 应用） */
	fuzzyMatchThreshold?: number
	/** 连续错误限制（达到后会询问用户） */
	consecutiveMistakeLimit?: number
	/** 实验性功能开关 */
	experiments?: Record<string, boolean>
	/** 初始待办事项列表 */
	initialTodos?: TodoItem[]
	/**
	 * 任务历史项的初始状态
	 * - "active": 活跃状态（用于子任务）
	 * - "delegated": 已委派状态
	 * - "completed": 已完成状态
	 */
	initialStatus?: "active" | "delegated" | "completed"
}

// ============================================================================
// TaskStatus - 任务状态枚举
// ============================================================================

/**
 * 任务状态枚举
 *
 * 表示任务在其生命周期中的不同状态。
 * 状态转换：None -> Running -> Interactive/Resumable/Idle
 */
export enum TaskStatus {
	/** 运行中：任务正在执行 AI 请求 */
	Running = "running",
	/** 交互中：任务等待用户批准或输入 */
	Interactive = "interactive",
	/** 可恢复：任务可以被恢复继续执行 */
	Resumable = "resumable",
	/** 空闲：任务已完成或等待新输入 */
	Idle = "idle",
	/** 无状态：没有活动任务 */
	None = "none",
}

// ============================================================================
// TaskMetadata - 任务元数据
// ============================================================================

/**
 * 任务元数据的 Zod 验证模式
 *
 * 存储任务的基本信息，用于任务历史和恢复。
 */
export const taskMetadataSchema = z.object({
	/** 任务的初始消息文本 */
	task: z.string().optional(),
	/** 任务的初始图像数据 URI 数组 */
	images: z.array(z.string()).optional(),
})

/**
 * 任务元数据类型
 */
export type TaskMetadata = z.infer<typeof taskMetadataSchema>

// ============================================================================
// TaskLike - 任务接口
// ============================================================================

/**
 * 任务接口
 *
 * 表示单个 AI 对话任务的接口。
 * 每个任务包含：
 * - 唯一标识符和层级关系
 * - 当前状态和消息
 * - Token 使用统计
 * - 事件发射能力
 * - 用户交互方法
 */
export interface TaskLike {
	// ========================================================================
	// 任务标识和层级
	// ========================================================================

	/** 任务唯一标识符 */
	readonly taskId: string
	/** 根任务 ID（如果是子任务） */
	readonly rootTaskId?: string
	/** 父任务 ID（如果是子任务） */
	readonly parentTaskId?: string
	/** 子任务 ID（如果有委派的子任务） */
	readonly childTaskId?: string

	// ========================================================================
	// 任务状态和数据
	// ========================================================================

	/** 任务元数据（初始消息和图像） */
	readonly metadata: TaskMetadata
	/** 当前任务状态 */
	readonly taskStatus: TaskStatus
	/** 当前的询问消息（如果有） */
	readonly taskAsk: ClineMessage | undefined
	/** 排队等待处理的用户消息 */
	readonly queuedMessages: QueuedMessage[]
	/** Token 使用统计 */
	readonly tokenUsage: TokenUsage | undefined

	// ========================================================================
	// 事件发射器方法
	// ========================================================================

	/**
	 * 注册事件监听器
	 * @param event - 事件名称
	 * @param listener - 事件处理函数
	 */
	on<K extends keyof TaskEvents>(event: K, listener: (...args: TaskEvents[K]) => void | Promise<void>): this

	/**
	 * 移除事件监听器
	 * @param event - 事件名称
	 * @param listener - 要移除的事件处理函数
	 */
	off<K extends keyof TaskEvents>(event: K, listener: (...args: TaskEvents[K]) => void | Promise<void>): this

	// ========================================================================
	// 用户交互方法
	// ========================================================================

	/**
	 * 批准当前询问
	 * @param options - 可选的响应文本和图像
	 */
	approveAsk(options?: { text?: string; images?: string[] }): void

	/**
	 * 拒绝当前询问
	 * @param options - 可选的响应文本和图像
	 */
	denyAsk(options?: { text?: string; images?: string[] }): void

	/**
	 * 提交用户消息
	 * @param text - 消息文本
	 * @param images - 可选的图像数据 URI 数组
	 * @param mode - 可选的模式切换
	 * @param providerProfile - 可选的配置文件切换
	 */
	submitUserMessage(text: string, images?: string[], mode?: string, providerProfile?: string): Promise<void>

	/**
	 * 中止任务
	 * 取消正在执行的 AI 请求
	 */
	abortTask(): void
}

// ============================================================================
// TaskEvents - 任务事件类型
// ============================================================================

/**
 * 任务事件类型映射
 *
 * 定义了单个任务可以发射的所有事件及其参数类型。
 * 这些事件在任务级别触发，用于跟踪单个任务的状态变化。
 */
export type TaskEvents = {
	// 任务生命周期事件
	/** 任务开始事件 */
	[RooCodeEventName.TaskStarted]: []
	/** 任务完成事件：[taskId, tokenUsage, toolUsage] */
	[RooCodeEventName.TaskCompleted]: [taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage]
	/** 任务中止事件 */
	[RooCodeEventName.TaskAborted]: []
	/** 任务获得焦点事件 */
	[RooCodeEventName.TaskFocused]: []
	/** 任务失去焦点事件 */
	[RooCodeEventName.TaskUnfocused]: []
	/** 任务活跃事件：[taskId] */
	[RooCodeEventName.TaskActive]: [taskId: string]
	/** 任务交互事件：[taskId] */
	[RooCodeEventName.TaskInteractive]: [taskId: string]
	/** 任务可恢复事件：[taskId] */
	[RooCodeEventName.TaskResumable]: [taskId: string]
	/** 任务空闲事件：[taskId] */
	[RooCodeEventName.TaskIdle]: [taskId: string]

	// 子任务生命周期事件
	/** 任务暂停事件：[taskId] */
	[RooCodeEventName.TaskPaused]: [taskId: string]
	/** 任务恢复事件：[taskId] */
	[RooCodeEventName.TaskUnpaused]: [taskId: string]
	/** 任务派生事件：[taskId] */
	[RooCodeEventName.TaskSpawned]: [taskId: string]

	// 任务执行事件
	/** 消息事件：[{ action, message }] */
	[RooCodeEventName.Message]: [{ action: "created" | "updated"; message: ClineMessage }]
	/** 任务模式切换事件：[taskId, mode] */
	[RooCodeEventName.TaskModeSwitched]: [taskId: string, mode: string]
	/** 任务询问响应事件 */
	[RooCodeEventName.TaskAskResponded]: []
	/** 任务用户消息事件：[taskId] */
	[RooCodeEventName.TaskUserMessage]: [taskId: string]

	// 任务分析事件
	/** 工具失败事件：[taskId, tool, error] */
	[RooCodeEventName.TaskToolFailed]: [taskId: string, tool: ToolName, error: string]
	/** Token 使用更新事件：[taskId, tokenUsage, toolUsage] */
	[RooCodeEventName.TaskTokenUsageUpdated]: [taskId: string, tokenUsage: TokenUsage, toolUsage: ToolUsage]
}
