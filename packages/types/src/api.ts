/**
 * @fileoverview RooCode API 接口定义
 *
 * 这个文件定义了 RooCode 扩展对外暴露的 API 接口。
 * 外部程序（如 CLI、测试框架、其他扩展）可以通过这些接口与 RooCode 交互。
 *
 * 主要接口：
 * - RooCodeAPI: 主要的 API 接口，提供任务管理、配置管理、配置文件管理等功能
 * - RooCodeIpcServer: IPC 服务器接口，用于进程间通信
 *
 * 使用示例：
 * ```typescript
 * // 获取 RooCode API
 * const rooCode = vscode.extensions.getExtension('RooVeterinaryInc.roo-cline')?.exports as RooCodeAPI;
 *
 * // 启动新任务
 * const taskId = await rooCode.startNewTask({ text: "帮我写一个函数" });
 *
 * // 监听任务事件
 * rooCode.on('taskCompleted', (taskId, tokenUsage, toolUsage) => {
 *   console.log(`任务 ${taskId} 已完成`);
 * });
 * ```
 */

import type { EventEmitter } from "events"
import type { Socket } from "net"

import type { RooCodeEvents } from "./events.js"
import type { RooCodeSettings } from "./global-settings.js"
import type { ProviderSettingsEntry, ProviderSettings } from "./provider-settings.js"
import type { IpcMessage, IpcServerEvents } from "./ipc.js"

/**
 * RooCode API 事件类型
 * 继承自 RooCodeEvents，包含所有可监听的事件
 */
export type RooCodeAPIEvents = RooCodeEvents

/**
 * RooCode API 主接口
 *
 * 这是 RooCode 扩展对外暴露的主要接口，继承自 EventEmitter。
 * 通过这个接口，外部程序可以：
 * - 创建、恢复、取消任务
 * - 发送消息给 AI
 * - 管理配置和配置文件
 * - 监听各种事件
 *
 * @extends EventEmitter<RooCodeAPIEvents>
 */
export interface RooCodeAPI extends EventEmitter<RooCodeAPIEvents> {
	// ========================================================================
	// 任务管理方法
	// ========================================================================

	/**
	 * 启动一个新任务
	 *
	 * 创建一个新的 AI 对话任务，可以包含初始消息和图像。
	 *
	 * @param options - 任务选项
	 * @param options.configuration - 可选的任务配置，覆盖默认设置
	 * @param options.text - 可选的初始任务消息
	 * @param options.images - 可选的图像数据 URI 数组（如 "data:image/webp;base64,..."）
	 * @param options.newTab - 是否在新标签页中打开任务
	 * @returns 新任务的 ID
	 *
	 * @example
	 * ```typescript
	 * const taskId = await api.startNewTask({
	 *   text: "帮我重构这个函数",
	 *   images: ["data:image/png;base64,..."]
	 * });
	 * ```
	 */
	startNewTask({
		configuration,
		text,
		images,
		newTab,
	}: {
		configuration?: RooCodeSettings
		text?: string
		images?: string[]
		newTab?: boolean
	}): Promise<string>

	/**
	 * 恢复指定 ID 的任务
	 *
	 * 从任务历史中恢复一个之前的任务，继续之前的对话。
	 *
	 * @param taskId - 要恢复的任务 ID
	 * @throws 如果任务不在历史记录中则抛出错误
	 *
	 * @example
	 * ```typescript
	 * await api.resumeTask("task-123");
	 * ```
	 */
	resumeTask(taskId: string): Promise<void>

	/**
	 * 检查任务是否在历史记录中
	 *
	 * @param taskId - 要检查的任务 ID
	 * @returns 如果任务在历史记录中返回 true，否则返回 false
	 */
	isTaskInHistory(taskId: string): Promise<boolean>

	/**
	 * 获取当前任务栈
	 *
	 * 返回当前活动的任务 ID 列表。
	 * 当使用任务委派（new_task 工具）时，可能有多个嵌套任务。
	 *
	 * @returns 任务 ID 数组，最后一个是当前活动任务
	 */
	getCurrentTaskStack(): string[]

	/**
	 * 清除当前任务
	 *
	 * 结束当前任务并清理资源。
	 *
	 * @param lastMessage - 可选的最后消息，会保存到任务历史
	 */
	clearCurrentTask(lastMessage?: string): Promise<void>

	/**
	 * 取消当前任务
	 *
	 * 中止当前正在执行的任务。
	 */
	cancelCurrentTask(): Promise<void>

	// ========================================================================
	// 消息发送方法
	// ========================================================================

	/**
	 * 向当前任务发送消息
	 *
	 * 发送用户消息给 AI，可以包含文本和图像。
	 *
	 * @param message - 可选的消息文本
	 * @param images - 可选的图像数据 URI 数组
	 *
	 * @example
	 * ```typescript
	 * await api.sendMessage("请继续", ["data:image/png;base64,..."]);
	 * ```
	 */
	sendMessage(message?: string, images?: string[]): Promise<void>

	/**
	 * 模拟点击主按钮
	 *
	 * 相当于用户点击聊天界面中的主按钮（通常是"批准"或"继续"）。
	 */
	pressPrimaryButton(): Promise<void>

	/**
	 * 模拟点击次要按钮
	 *
	 * 相当于用户点击聊天界面中的次要按钮（通常是"拒绝"或"取消"）。
	 */
	pressSecondaryButton(): Promise<void>

	// ========================================================================
	// 状态查询方法
	// ========================================================================

	/**
	 * 检查 API 是否准备就绪
	 *
	 * @returns 如果 API 已准备好使用返回 true
	 */
	isReady(): boolean

	// ========================================================================
	// 配置管理方法
	// ========================================================================

	/**
	 * 获取当前配置
	 *
	 * @returns 当前的 RooCode 设置
	 */
	getConfiguration(): RooCodeSettings

	/**
	 * 设置当前任务的配置
	 *
	 * @param values - 包含要设置的键值对的对象
	 *
	 * @example
	 * ```typescript
	 * await api.setConfiguration({
	 *   autoApprove: true,
	 *   maxTokens: 4096
	 * });
	 * ```
	 */
	setConfiguration(values: RooCodeSettings): Promise<void>

	// ========================================================================
	// 配置文件（Profile）管理方法
	// ========================================================================

	/**
	 * 获取所有配置文件名称列表
	 *
	 * 配置文件用于保存不同的 API 提供者设置，方便快速切换。
	 *
	 * @returns 配置文件名称数组
	 */
	getProfiles(): string[]

	/**
	 * 获取指定名称的配置文件条目
	 *
	 * @param name - 配置文件名称
	 * @returns 配置文件条目，如果不存在则返回 undefined
	 */
	getProfileEntry(name: string): ProviderSettingsEntry | undefined

	/**
	 * 创建新的 API 配置文件
	 *
	 * @param name - 配置文件名称
	 * @param profile - 配置文件内容，默认为空对象
	 * @param activate - 创建后是否激活，默认为 true
	 * @returns 创建的配置文件 ID
	 * @throws 如果配置文件已存在则抛出错误
	 *
	 * @example
	 * ```typescript
	 * const profileId = await api.createProfile("openai-gpt4", {
	 *   apiProvider: "openai-native",
	 *   openAiNativeApiKey: "sk-..."
	 * });
	 * ```
	 */
	createProfile(name: string, profile?: ProviderSettings, activate?: boolean): Promise<string>

	/**
	 * 更新现有的 API 配置文件
	 *
	 * @param name - 配置文件名称
	 * @param profile - 新的配置文件内容
	 * @param activate - 更新后是否激活，默认为 true
	 * @returns 更新的配置文件 ID
	 * @throws 如果配置文件不存在则抛出错误
	 */
	updateProfile(name: string, profile: ProviderSettings, activate?: boolean): Promise<string | undefined>

	/**
	 * 创建或更新 API 配置文件
	 *
	 * 如果配置文件存在则更新，不存在则创建。
	 *
	 * @param name - 配置文件名称
	 * @param profile - 配置文件内容，默认为空对象
	 * @param activate - 操作后是否激活，默认为 true
	 * @returns 配置文件 ID
	 */
	upsertProfile(name: string, profile: ProviderSettings, activate?: boolean): Promise<string | undefined>

	/**
	 * 删除配置文件
	 *
	 * @param name - 要删除的配置文件名称
	 * @throws 如果配置文件不存在则抛出错误
	 */
	deleteProfile(name: string): Promise<void>

	/**
	 * 获取当前激活的配置文件名称
	 *
	 * @returns 配置文件名称，如果没有激活的配置文件则返回 undefined
	 */
	getActiveProfile(): string | undefined

	/**
	 * 设置激活的配置文件
	 *
	 * @param name - 要激活的配置文件名称
	 * @returns 激活的配置文件 ID
	 * @throws 如果配置文件不存在则抛出错误
	 */
	setActiveProfile(name: string): Promise<string | undefined>
}

// ============================================================================
// IPC 服务器接口
// ============================================================================

/**
 * RooCode IPC 服务器接口
 *
 * 用于进程间通信的服务器接口。
 * CLI 和其他外部进程可以通过 IPC 与 RooCode 扩展通信。
 *
 * @extends EventEmitter<IpcServerEvents>
 */
export interface RooCodeIpcServer extends EventEmitter<IpcServerEvents> {
	/**
	 * 开始监听 IPC 连接
	 */
	listen(): void

	/**
	 * 向所有连接的客户端广播消息
	 *
	 * @param message - 要广播的 IPC 消息
	 */
	broadcast(message: IpcMessage): void

	/**
	 * 向特定客户端发送消息
	 *
	 * @param client - 客户端标识符或 Socket 对象
	 * @param message - 要发送的 IPC 消息
	 */
	send(client: string | Socket, message: IpcMessage): void

	/**
	 * 获取 IPC 服务器的 socket 路径
	 */
	get socketPath(): string

	/**
	 * 检查服务器是否正在监听
	 */
	get isListening(): boolean
}
