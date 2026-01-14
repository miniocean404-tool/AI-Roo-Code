/**
 * @fileoverview RooCode 事件类型定义
 *
 * 这个文件定义了 Roo Code 中所有事件相关的类型。
 * 事件系统是扩展内部通信和外部 API 的核心机制。
 *
 * 事件分类：
 * 1. 任务提供者生命周期事件（TaskCreated）
 * 2. 任务生命周期事件（Started, Completed, Aborted 等）
 * 3. 子任务生命周期事件（Paused, Spawned, Delegated 等）
 * 4. 任务执行事件（Message, ModeSwitched 等）
 * 5. 任务分析事件（TokenUsageUpdated, ToolFailed）
 * 6. 配置变更事件（ModeChanged, ProviderProfileChanged）
 * 7. 评估事件（EvalPass, EvalFail）
 *
 * 使用场景：
 * - 外部程序通过 RooCodeAPI 监听事件
 * - CLI 工具通过 IPC 接收事件
 * - 遥测系统收集事件数据
 * - UI 响应状态变化
 */

import { z } from "zod"

import { clineMessageSchema, tokenUsageSchema } from "./message.js"
import { toolNamesSchema, toolUsageSchema } from "./tool.js"

// ============================================================================
// RooCodeEventName - 事件名称枚举
// ============================================================================

/**
 * RooCode 事件名称枚举
 *
 * 定义了系统中所有可能触发的事件。
 * 这些事件可以被外部程序监听，用于：
 * - 跟踪任务进度
 * - 收集使用统计
 * - 触发自动化流程
 * - 更新 UI 状态
 */
export enum RooCodeEventName {
	// ========================================================================
	// 任务提供者生命周期事件
	// ========================================================================

	/**
	 * 任务创建事件
	 * 当新任务被创建时触发（在任务开始执行之前）
	 */
	TaskCreated = "taskCreated",

	// ========================================================================
	// 任务生命周期事件
	// ========================================================================

	/**
	 * 任务开始事件
	 * 当任务开始执行时触发
	 */
	TaskStarted = "taskStarted",

	/**
	 * 任务完成事件
	 * 当任务成功完成时触发，包含 token 使用和工具使用统计
	 */
	TaskCompleted = "taskCompleted",

	/**
	 * 任务中止事件
	 * 当任务被用户取消或因错误中止时触发
	 */
	TaskAborted = "taskAborted",

	/**
	 * 任务获得焦点事件
	 * 当任务成为当前活动任务时触发
	 */
	TaskFocused = "taskFocused",

	/**
	 * 任务失去焦点事件
	 * 当任务不再是当前活动任务时触发
	 */
	TaskUnfocused = "taskUnfocused",

	/**
	 * 任务活跃事件
	 * 当任务正在执行 AI 请求时触发
	 */
	TaskActive = "taskActive",

	/**
	 * 任务交互事件
	 * 当任务需要用户交互（批准/拒绝）时触发
	 */
	TaskInteractive = "taskInteractive",

	/**
	 * 任务可恢复事件
	 * 当任务可以被恢复继续执行时触发
	 */
	TaskResumable = "taskResumable",

	/**
	 * 任务空闲事件
	 * 当任务完成或等待新输入时触发
	 */
	TaskIdle = "taskIdle",

	// ========================================================================
	// 子任务生命周期事件
	// ========================================================================

	/**
	 * 任务暂停事件
	 * 当父任务因子任务执行而暂停时触发
	 */
	TaskPaused = "taskPaused",

	/**
	 * 任务恢复事件
	 * 当暂停的任务恢复执行时触发
	 */
	TaskUnpaused = "taskUnpaused",

	/**
	 * 任务派生事件
	 * 当新的子任务被创建时触发
	 */
	TaskSpawned = "taskSpawned",

	/**
	 * 任务委派事件
	 * 当任务被委派给子任务时触发
	 */
	TaskDelegated = "taskDelegated",

	/**
	 * 任务委派完成事件
	 * 当委派的子任务完成时触发
	 */
	TaskDelegationCompleted = "taskDelegationCompleted",

	/**
	 * 任务委派恢复事件
	 * 当从委派的子任务返回父任务时触发
	 */
	TaskDelegationResumed = "taskDelegationResumed",

	// ========================================================================
	// 任务执行事件
	// ========================================================================

	/**
	 * 消息事件
	 * 当新消息被创建或更新时触发
	 */
	Message = "message",

	/**
	 * 任务模式切换事件
	 * 当任务切换工作模式时触发
	 */
	TaskModeSwitched = "taskModeSwitched",

	/**
	 * 任务询问响应事件
	 * 当用户响应 AI 的询问时触发
	 */
	TaskAskResponded = "taskAskResponded",

	/**
	 * 任务用户消息事件
	 * 当用户发送新消息时触发
	 */
	TaskUserMessage = "taskUserMessage",

	// ========================================================================
	// 任务分析事件
	// ========================================================================

	/**
	 * Token 使用更新事件
	 * 当任务的 token 使用统计更新时触发
	 */
	TaskTokenUsageUpdated = "taskTokenUsageUpdated",

	/**
	 * 工具失败事件
	 * 当工具调用失败时触发
	 */
	TaskToolFailed = "taskToolFailed",

	// ========================================================================
	// 配置变更事件
	// ========================================================================

	/**
	 * 模式变更事件
	 * 当工作模式被切换时触发
	 */
	ModeChanged = "modeChanged",

	/**
	 * 提供者配置文件变更事件
	 * 当 API 提供者配置文件被切换时触发
	 */
	ProviderProfileChanged = "providerProfileChanged",

	// ========================================================================
	// 评估事件
	// ========================================================================

	/**
	 * 评估通过事件
	 * 当评估测试通过时触发
	 */
	EvalPass = "evalPass",

	/**
	 * 评估失败事件
	 * 当评估测试失败时触发
	 */
	EvalFail = "evalFail",
}

// ============================================================================
// RooCodeEvents - 事件参数类型
// ============================================================================

/**
 * RooCode 事件参数的 Zod 验证模式
 *
 * 定义了每个事件的参数类型，用于：
 * - 运行时验证事件数据
 * - TypeScript 类型推断
 * - API 文档生成
 */
export const rooCodeEventsSchema = z.object({
	// 任务提供者生命周期
	/** 任务创建事件参数：[taskId] */
	[RooCodeEventName.TaskCreated]: z.tuple([z.string()]),

	// 任务生命周期
	/** 任务开始事件参数：[taskId] */
	[RooCodeEventName.TaskStarted]: z.tuple([z.string()]),
	/** 任务完成事件参数：[taskId, tokenUsage, toolUsage, { isSubtask }] */
	[RooCodeEventName.TaskCompleted]: z.tuple([
		z.string(),
		tokenUsageSchema,
		toolUsageSchema,
		z.object({
			/** 是否为子任务 */
			isSubtask: z.boolean(),
		}),
	]),
	/** 任务中止事件参数：[taskId] */
	[RooCodeEventName.TaskAborted]: z.tuple([z.string()]),
	/** 任务获得焦点事件参数：[taskId] */
	[RooCodeEventName.TaskFocused]: z.tuple([z.string()]),
	/** 任务失去焦点事件参数：[taskId] */
	[RooCodeEventName.TaskUnfocused]: z.tuple([z.string()]),
	/** 任务活跃事件参数：[taskId] */
	[RooCodeEventName.TaskActive]: z.tuple([z.string()]),
	/** 任务交互事件参数：[taskId] */
	[RooCodeEventName.TaskInteractive]: z.tuple([z.string()]),
	/** 任务可恢复事件参数：[taskId] */
	[RooCodeEventName.TaskResumable]: z.tuple([z.string()]),
	/** 任务空闲事件参数：[taskId] */
	[RooCodeEventName.TaskIdle]: z.tuple([z.string()]),

	// 子任务生命周期
	/** 任务暂停事件参数：[taskId] */
	[RooCodeEventName.TaskPaused]: z.tuple([z.string()]),
	/** 任务恢复事件参数：[taskId] */
	[RooCodeEventName.TaskUnpaused]: z.tuple([z.string()]),
	/** 任务派生事件参数：[parentTaskId, childTaskId] */
	[RooCodeEventName.TaskSpawned]: z.tuple([z.string(), z.string()]),
	/** 任务委派事件参数：[parentTaskId, childTaskId] */
	[RooCodeEventName.TaskDelegated]: z.tuple([
		z.string(), // parentTaskId - 父任务 ID
		z.string(), // childTaskId - 子任务 ID
	]),
	/** 任务委派完成事件参数：[parentTaskId, childTaskId, completionResultSummary] */
	[RooCodeEventName.TaskDelegationCompleted]: z.tuple([
		z.string(), // parentTaskId - 父任务 ID
		z.string(), // childTaskId - 子任务 ID
		z.string(), // completionResultSummary - 完成结果摘要
	]),
	/** 任务委派恢复事件参数：[parentTaskId, childTaskId] */
	[RooCodeEventName.TaskDelegationResumed]: z.tuple([
		z.string(), // parentTaskId - 父任务 ID
		z.string(), // childTaskId - 子任务 ID
	]),

	// 任务执行
	/** 消息事件参数：[{ taskId, action, message }] */
	[RooCodeEventName.Message]: z.tuple([
		z.object({
			/** 任务 ID */
			taskId: z.string(),
			/** 消息动作：created（创建）或 updated（更新） */
			action: z.union([z.literal("created"), z.literal("updated")]),
			/** 消息内容 */
			message: clineMessageSchema,
		}),
	]),
	/** 任务模式切换事件参数：[taskId, mode] */
	[RooCodeEventName.TaskModeSwitched]: z.tuple([z.string(), z.string()]),
	/** 任务询问响应事件参数：[taskId] */
	[RooCodeEventName.TaskAskResponded]: z.tuple([z.string()]),
	/** 任务用户消息事件参数：[taskId] */
	[RooCodeEventName.TaskUserMessage]: z.tuple([z.string()]),

	// 任务分析
	/** 工具失败事件参数：[taskId, toolName, errorMessage] */
	[RooCodeEventName.TaskToolFailed]: z.tuple([z.string(), toolNamesSchema, z.string()]),
	/** Token 使用更新事件参数：[taskId, tokenUsage, toolUsage] */
	[RooCodeEventName.TaskTokenUsageUpdated]: z.tuple([z.string(), tokenUsageSchema, toolUsageSchema]),

	// 配置变更
	/** 模式变更事件参数：[mode] */
	[RooCodeEventName.ModeChanged]: z.tuple([z.string()]),
	/** 提供者配置文件变更事件参数：[{ name, provider }] */
	[RooCodeEventName.ProviderProfileChanged]: z.tuple([z.object({ name: z.string(), provider: z.string() })]),
})

/**
 * RooCode 事件类型
 *
 * 从 rooCodeEventsSchema 推断出的类型，
 * 键为事件名称，值为该事件的参数元组类型。
 */
export type RooCodeEvents = z.infer<typeof rooCodeEventsSchema>

// ============================================================================
// TaskEvent - 任务事件（用于 IPC 和序列化）
// ============================================================================

/**
 * 任务事件的 Zod 验证模式
 *
 * 使用 discriminatedUnion 实现类型安全的事件分发。
 * 每个事件包含：
 * - eventName: 事件名称（用于区分不同事件）
 * - payload: 事件参数
 * - taskId: 可选的任务 ID（数字类型，用于评估系统）
 *
 * 这个模式主要用于：
 * - IPC 消息序列化/反序列化
 * - 事件日志记录
 * - 评估系统的事件追踪
 */
export const taskEventSchema = z.discriminatedUnion("eventName", [
	// ========================================================================
	// 任务提供者生命周期事件
	// ========================================================================

	/** 任务创建事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskCreated),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskCreated],
		taskId: z.number().optional(),
	}),

	// ========================================================================
	// 任务生命周期事件
	// ========================================================================

	/** 任务开始事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskStarted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskStarted],
		taskId: z.number().optional(),
	}),
	/** 任务完成事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskCompleted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskCompleted],
		taskId: z.number().optional(),
	}),
	/** 任务中止事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskAborted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskAborted],
		taskId: z.number().optional(),
	}),
	/** 任务获得焦点事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskFocused),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskFocused],
		taskId: z.number().optional(),
	}),
	/** 任务失去焦点事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskUnfocused),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskUnfocused],
		taskId: z.number().optional(),
	}),
	/** 任务活跃事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskActive),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskActive],
		taskId: z.number().optional(),
	}),
	/** 任务交互事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskInteractive),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskInteractive],
		taskId: z.number().optional(),
	}),
	/** 任务可恢复事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskResumable),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskResumable],
		taskId: z.number().optional(),
	}),
	/** 任务空闲事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskIdle),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskIdle],
		taskId: z.number().optional(),
	}),

	// ========================================================================
	// 子任务生命周期事件
	// ========================================================================

	/** 任务暂停事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskPaused),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskPaused],
		taskId: z.number().optional(),
	}),
	/** 任务恢复事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskUnpaused),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskUnpaused],
		taskId: z.number().optional(),
	}),
	/** 任务派生事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskSpawned),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskSpawned],
		taskId: z.number().optional(),
	}),
	/** 任务委派事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskDelegated),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskDelegated],
		taskId: z.number().optional(),
	}),
	/** 任务委派完成事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskDelegationCompleted),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskDelegationCompleted],
		taskId: z.number().optional(),
	}),
	/** 任务委派恢复事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskDelegationResumed),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskDelegationResumed],
		taskId: z.number().optional(),
	}),

	// ========================================================================
	// 任务执行事件
	// ========================================================================

	/** 消息事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.Message),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.Message],
		taskId: z.number().optional(),
	}),
	/** 任务模式切换事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskModeSwitched),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskModeSwitched],
		taskId: z.number().optional(),
	}),
	/** 任务询问响应事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskAskResponded),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskAskResponded],
		taskId: z.number().optional(),
	}),

	// ========================================================================
	// 任务分析事件
	// ========================================================================

	/** 工具失败事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskToolFailed),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskToolFailed],
		taskId: z.number().optional(),
	}),
	/** Token 使用更新事件 */
	z.object({
		eventName: z.literal(RooCodeEventName.TaskTokenUsageUpdated),
		payload: rooCodeEventsSchema.shape[RooCodeEventName.TaskTokenUsageUpdated],
		taskId: z.number().optional(),
	}),

	// ========================================================================
	// 评估事件
	// ========================================================================

	/** 评估通过事件（taskId 必填，用于评估系统追踪） */
	z.object({
		eventName: z.literal(RooCodeEventName.EvalPass),
		payload: z.undefined(),
		taskId: z.number(),
	}),
	/** 评估失败事件（taskId 必填，用于评估系统追踪） */
	z.object({
		eventName: z.literal(RooCodeEventName.EvalFail),
		payload: z.undefined(),
		taskId: z.number(),
	}),
])

/**
 * 任务事件类型
 *
 * 从 taskEventSchema 推断出的联合类型。
 * 每个事件都有明确的 eventName 和对应的 payload 类型。
 */
export type TaskEvent = z.infer<typeof taskEventSchema>
