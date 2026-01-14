/**
 * @fileoverview IPC（进程间通信）类型定义
 *
 * 这个文件定义了 Roo Code 中 IPC 通信相关的所有类型。
 * IPC 用于 CLI 客户端与 VS Code 扩展（服务器）之间的双向通信。
 *
 * 通信架构：
 * - 服务器（Server）：VS Code 扩展，运行在 VS Code 进程中
 * - 客户端（Client）：CLI 工具，运行在独立的 Node.js 进程中
 *
 * 消息类型：
 * - Connect/Disconnect：连接管理
 * - Ack：服务器确认消息
 * - TaskCommand：客户端发送的任务命令
 * - TaskEvent：服务器发送的任务事件
 *
 * 使用场景：
 * - CLI 工具通过 IPC 与 VS Code 扩展通信
 * - 支持远程任务创建、取消、恢复等操作
 * - 实时接收任务执行事件
 */

import { z } from "zod"

import { type TaskEvent, taskEventSchema } from "./events.js"
import { rooCodeSettingsSchema } from "./global-settings.js"

// ============================================================================
// IpcMessageType - IPC 消息类型枚举
// ============================================================================

/**
 * IPC 消息类型枚举
 *
 * 定义了 IPC 通信中所有可能的消息类型。
 * 每种消息类型有特定的发送方向和数据格式。
 */
export enum IpcMessageType {
	/**
	 * 连接消息
	 * 当客户端连接到服务器时触发
	 */
	Connect = "Connect",

	/**
	 * 断开连接消息
	 * 当客户端断开与服务器的连接时触发
	 */
	Disconnect = "Disconnect",

	/**
	 * 确认消息
	 * 服务器发送给客户端，确认连接并提供服务器信息
	 */
	Ack = "Ack",

	/**
	 * 任务命令消息
	 * 客户端发送给服务器，请求执行任务操作
	 */
	TaskCommand = "TaskCommand",

	/**
	 * 任务事件消息
	 * 服务器发送给客户端，通知任务状态变化
	 */
	TaskEvent = "TaskEvent",
}

// ============================================================================
// IpcOrigin - IPC 消息来源枚举
// ============================================================================

/**
 * IPC 消息来源枚举
 *
 * 标识消息的发送方，用于消息路由和验证。
 */
export enum IpcOrigin {
	/** 消息来自客户端（CLI） */
	Client = "client",
	/** 消息来自服务器（VS Code 扩展） */
	Server = "server",
}

// ============================================================================
// Ack - 确认消息数据
// ============================================================================

/**
 * 确认消息数据的 Zod 验证模式
 *
 * 服务器在接受客户端连接后发送此消息，
 * 包含服务器进程的标识信息。
 */
export const ackSchema = z.object({
	/** 分配给客户端的唯一标识符 */
	clientId: z.string(),
	/** 服务器进程 ID */
	pid: z.number(),
	/** 服务器父进程 ID */
	ppid: z.number(),
})

/**
 * 确认消息数据类型
 */
export type Ack = z.infer<typeof ackSchema>

// ============================================================================
// TaskCommandName - 任务命令名称枚举
// ============================================================================

/**
 * 任务命令名称枚举
 *
 * 定义了客户端可以发送给服务器的所有任务操作命令。
 */
export enum TaskCommandName {
	/**
	 * 开始新任务
	 * 创建并启动一个新的 AI 对话任务
	 */
	StartNewTask = "StartNewTask",

	/**
	 * 取消任务
	 * 中止正在执行的任务
	 */
	CancelTask = "CancelTask",

	/**
	 * 关闭任务
	 * 结束任务并清理资源
	 */
	CloseTask = "CloseTask",

	/**
	 * 恢复任务
	 * 恢复之前暂停或中断的任务
	 */
	ResumeTask = "ResumeTask",

	/**
	 * 发送消息
	 * 向当前任务发送用户消息
	 */
	SendMessage = "SendMessage",
}

// ============================================================================
// TaskCommand - 任务命令
// ============================================================================

/**
 * 任务命令的 Zod 验证模式
 *
 * 使用 discriminatedUnion 实现类型安全的命令分发。
 * 每个命令有特定的数据格式。
 */
export const taskCommandSchema = z.discriminatedUnion("commandName", [
	/**
	 * 开始新任务命令
	 * 包含完整的任务配置和初始消息
	 */
	z.object({
		commandName: z.literal(TaskCommandName.StartNewTask),
		data: z.object({
			/** 任务配置（API 设置、模式等） */
			configuration: rooCodeSettingsSchema,
			/** 初始消息文本 */
			text: z.string(),
			/** 可选的图像数据 URI 数组 */
			images: z.array(z.string()).optional(),
			/** 是否在新标签页中打开 */
			newTab: z.boolean().optional(),
		}),
	}),

	/**
	 * 取消任务命令
	 * data 为任务 ID
	 */
	z.object({
		commandName: z.literal(TaskCommandName.CancelTask),
		data: z.string(),
	}),

	/**
	 * 关闭任务命令
	 * data 为任务 ID
	 */
	z.object({
		commandName: z.literal(TaskCommandName.CloseTask),
		data: z.string(),
	}),

	/**
	 * 恢复任务命令
	 * data 为任务 ID
	 */
	z.object({
		commandName: z.literal(TaskCommandName.ResumeTask),
		data: z.string(),
	}),

	/**
	 * 发送消息命令
	 * 向当前活动任务发送用户输入
	 */
	z.object({
		commandName: z.literal(TaskCommandName.SendMessage),
		data: z.object({
			/** 消息文本（可选） */
			text: z.string().optional(),
			/** 图像数据 URI 数组（可选） */
			images: z.array(z.string()).optional(),
		}),
	}),
])

/**
 * 任务命令类型
 */
export type TaskCommand = z.infer<typeof taskCommandSchema>

// ============================================================================
// IpcMessage - IPC 消息
// ============================================================================

/**
 * IPC 消息的 Zod 验证模式
 *
 * 定义了 IPC 通信中所有消息的完整格式。
 * 使用 discriminatedUnion 根据消息类型区分不同的数据结构。
 */
export const ipcMessageSchema = z.discriminatedUnion("type", [
	/**
	 * 确认消息（服务器 -> 客户端）
	 * 服务器确认客户端连接
	 */
	z.object({
		type: z.literal(IpcMessageType.Ack),
		origin: z.literal(IpcOrigin.Server),
		data: ackSchema,
	}),

	/**
	 * 任务命令消息（客户端 -> 服务器）
	 * 客户端请求执行任务操作
	 */
	z.object({
		type: z.literal(IpcMessageType.TaskCommand),
		origin: z.literal(IpcOrigin.Client),
		/** 发送命令的客户端 ID */
		clientId: z.string(),
		data: taskCommandSchema,
	}),

	/**
	 * 任务事件消息（服务器 -> 客户端）
	 * 服务器通知任务状态变化
	 */
	z.object({
		type: z.literal(IpcMessageType.TaskEvent),
		origin: z.literal(IpcOrigin.Server),
		/** 可选的目标客户端 ID（用于定向发送） */
		relayClientId: z.string().optional(),
		data: taskEventSchema,
	}),
])

/**
 * IPC 消息类型
 */
export type IpcMessage = z.infer<typeof ipcMessageSchema>

// ============================================================================
// IpcClientEvents - 客户端事件类型
// ============================================================================

/**
 * IPC 客户端事件类型映射
 *
 * 定义了客户端可以接收的所有事件及其参数类型。
 * 用于客户端的事件监听器类型检查。
 */
export type IpcClientEvents = {
	/** 连接事件（无参数） */
	[IpcMessageType.Connect]: []
	/** 断开连接事件（无参数） */
	[IpcMessageType.Disconnect]: []
	/** 确认事件：[确认数据] */
	[IpcMessageType.Ack]: [data: Ack]
	/** 任务命令事件：[命令数据] */
	[IpcMessageType.TaskCommand]: [data: TaskCommand]
	/** 任务事件：[事件数据] */
	[IpcMessageType.TaskEvent]: [data: TaskEvent]
}

// ============================================================================
// IpcServerEvents - 服务器事件类型
// ============================================================================

/**
 * IPC 服务器事件类型映射
 *
 * 定义了服务器可以接收的所有事件及其参数类型。
 * 用于服务器的事件监听器类型检查。
 */
export type IpcServerEvents = {
	/** 连接事件：[客户端 ID] */
	[IpcMessageType.Connect]: [clientId: string]
	/** 断开连接事件：[客户端 ID] */
	[IpcMessageType.Disconnect]: [clientId: string]
	/** 任务命令事件：[客户端 ID, 命令数据] */
	[IpcMessageType.TaskCommand]: [clientId: string, data: TaskCommand]
	/** 任务事件：[目标客户端 ID（可选）, 事件数据] */
	[IpcMessageType.TaskEvent]: [relayClientId: string | undefined, data: TaskEvent]
}
