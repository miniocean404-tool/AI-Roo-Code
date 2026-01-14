/**
 * @fileoverview 工作模式类型定义
 *
 * 这个文件定义了 Roo Code 中工作模式相关的所有类型。
 * 模式是 AI 助手的"人格"配置，决定了 AI 的行为方式和可用工具。
 *
 * 主要类型：
 * - ModeConfig: 模式配置，包含名称、角色定义、可用工具组等
 * - GroupEntry: 工具组条目，可以是简单的组名或带选项的元组
 * - GroupOptions: 工具组选项，如文件正则过滤
 * - PromptComponent: 提示词组件，用于自定义模式提示词
 * - CustomModesSettings: 自定义模式设置
 *
 * 内置模式：
 * - architect: 架构师模式，专注于规划和设计
 * - code: 代码模式，专注于编写和修改代码
 * - ask: 询问模式，专注于回答问题和解释
 * - debug: 调试模式，专注于问题诊断和修复
 * - orchestrator: 编排模式，专注于任务委派和协调
 */

import { z } from "zod"

import { toolGroupsSchema } from "./tool.js"

// ============================================================================
// GroupOptions - 工具组选项
// ============================================================================

/**
 * 工具组选项的 Zod 验证模式
 *
 * 用于为工具组添加额外的配置选项，如文件过滤。
 * 例如，architect 模式只允许编辑 Markdown 文件。
 */
export const groupOptionsSchema = z.object({
	/**
	 * 文件正则表达式过滤器
	 *
	 * 限制该工具组只能操作匹配此正则的文件。
	 * 例如："\\.md$" 只允许操作 Markdown 文件
	 */
	fileRegex: z
		.string()
		.optional()
		.refine(
			(pattern) => {
				if (!pattern) {
					return true // Optional, so empty is valid.
				}

				try {
					new RegExp(pattern)
					return true
				} catch {
					return false
				}
			},
			{ message: "Invalid regular expression pattern" },
		),
	/** 工具组的描述说明 */
	description: z.string().optional(),
})

/**
 * 工具组选项类型
 */
export type GroupOptions = z.infer<typeof groupOptionsSchema>

// ============================================================================
// GroupEntry - 工具组条目
// ============================================================================

/**
 * 工具组条目的 Zod 验证模式
 *
 * 工具组条目可以是：
 * 1. 简单的工具组名称（如 "read", "edit"）
 * 2. 带选项的元组（如 ["edit", { fileRegex: "\\.md$" }]）
 */
export const groupEntrySchema = z.union([toolGroupsSchema, z.tuple([toolGroupsSchema, groupOptionsSchema])])

/**
 * 工具组条目类型
 */
export type GroupEntry = z.infer<typeof groupEntrySchema>

// ============================================================================
// ModeConfig - 模式配置
// ============================================================================

/**
 * 工具组条目数组的 Zod 验证模式
 *
 * 验证规则：不允许重复的工具组
 */
const groupEntryArraySchema = z.array(groupEntrySchema).refine(
	(groups) => {
		const seen = new Set()

		return groups.every((group) => {
			// For tuples, check the group name (first element).
			const groupName = Array.isArray(group) ? group[0] : group

			if (seen.has(groupName)) {
				return false
			}

			seen.add(groupName)
			return true
		})
	},
	{ message: "Duplicate groups are not allowed" },
)

/**
 * 模式配置的 Zod 验证模式
 *
 * 定义了一个工作模式的完整配置。
 */
export const modeConfigSchema = z.object({
	/**
	 * 模式标识符（slug）
	 *
	 * 用于在代码和配置中引用模式。
	 * 只能包含字母、数字和连字符。
	 * 例如："code", "architect", "my-custom-mode"
	 */
	slug: z.string().regex(/^[a-zA-Z0-9-]+$/, "Slug must contain only letters numbers and dashes"),

	/**
	 * 模式显示名称
	 *
	 * 在 UI 中显示的名称，可以包含 emoji。
	 * 例如："💻 Code", "🏗️ Architect"
	 */
	name: z.string().min(1, "Name is required"),

	/**
	 * 角色定义
	 *
	 * 定义 AI 在此模式下的角色和行为。
	 * 这是系统提示词的核心部分。
	 */
	roleDefinition: z.string().min(1, "Role definition is required"),

	/**
	 * 使用场景说明
	 *
	 * 描述何时应该使用此模式。
	 * 用于帮助用户和 AI 选择合适的模式。
	 */
	whenToUse: z.string().optional(),

	/**
	 * 模式描述
	 *
	 * 简短的模式描述，用于 UI 显示。
	 */
	description: z.string().optional(),

	/**
	 * 自定义指令
	 *
	 * 额外的指令，会添加到系统提示词中。
	 * 用于定制模式的具体行为。
	 */
	customInstructions: z.string().optional(),

	/**
	 * 可用工具组
	 *
	 * 定义此模式可以使用的工具组。
	 * 可以是简单的组名或带选项的元组。
	 */
	groups: groupEntryArraySchema,

	/**
	 * 模式来源
	 *
	 * - "global": 全局模式（用户级别）
	 * - "project": 项目模式（项目级别）
	 */
	source: z.enum(["global", "project"]).optional(),
})

/**
 * 模式配置类型
 */
export type ModeConfig = z.infer<typeof modeConfigSchema>

// ============================================================================
// CustomModesSettings - 自定义模式设置
// ============================================================================

/**
 * 自定义模式设置的 Zod 验证模式
 *
 * 用于存储用户定义的自定义模式列表。
 * 验证规则：不允许重复的模式 slug。
 */
export const customModesSettingsSchema = z.object({
	/** 自定义模式列表 */
	customModes: z.array(modeConfigSchema).refine(
		(modes) => {
			const slugs = new Set()

			return modes.every((mode) => {
				if (slugs.has(mode.slug)) {
					return false
				}

				slugs.add(mode.slug)
				return true
			})
		},
		{
			message: "Duplicate mode slugs are not allowed",
		},
	),
})

/**
 * 自定义模式设置类型
 */
export type CustomModesSettings = z.infer<typeof customModesSettingsSchema>

// ============================================================================
// PromptComponent - 提示词组件
// ============================================================================

/**
 * 提示词组件的 Zod 验证模式
 *
 * 用于自定义模式的提示词部分。
 * 可以覆盖或扩展默认的提示词内容。
 */
export const promptComponentSchema = z.object({
	/** 角色定义覆盖 */
	roleDefinition: z.string().optional(),
	/** 使用场景覆盖 */
	whenToUse: z.string().optional(),
	/** 描述覆盖 */
	description: z.string().optional(),
	/** 自定义指令覆盖 */
	customInstructions: z.string().optional(),
})

/**
 * 提示词组件类型
 */
export type PromptComponent = z.infer<typeof promptComponentSchema>

// ============================================================================
// CustomModePrompts - 自定义模式提示词
// ============================================================================

/**
 * 自定义模式提示词的 Zod 验证模式
 *
 * 键为模式 slug，值为该模式的提示词组件。
 * 用于为不同模式定制提示词内容。
 */
export const customModePromptsSchema = z.record(z.string(), promptComponentSchema.optional())

/**
 * 自定义模式提示词类型
 */
export type CustomModePrompts = z.infer<typeof customModePromptsSchema>

// ============================================================================
// CustomSupportPrompts - 自定义支持提示词
// ============================================================================

/**
 * 自定义支持提示词的 Zod 验证模式
 *
 * 键为提示词标识符，值为提示词内容。
 * 用于自定义系统级别的支持提示词。
 */
export const customSupportPromptsSchema = z.record(z.string(), z.string().optional())

/**
 * 自定义支持提示词类型
 */
export type CustomSupportPrompts = z.infer<typeof customSupportPromptsSchema>

// ============================================================================
// DEFAULT_MODES - 默认模式配置
// ============================================================================

/**
 * 默认模式配置
 *
 * 定义了 Roo Code 内置的 5 种工作模式：
 *
 * 1. **Architect（架构师）**
 *    - 专注于规划和设计
 *    - 只能编辑 Markdown 文件
 *    - 适合在实现前进行设计讨论
 *
 * 2. **Code（代码）**
 *    - 专注于编写和修改代码
 *    - 拥有完整的文件编辑和命令执行权限
 *    - 是最常用的模式
 *
 * 3. **Ask（询问）**
 *    - 专注于回答问题和解释
 *    - 只有读取权限，不能修改文件
 *    - 适合学习和理解代码
 *
 * 4. **Debug（调试）**
 *    - 专注于问题诊断和修复
 *    - 强调系统性的调试方法
 *    - 会先诊断再修复
 *
 * 5. **Orchestrator（编排）**
 *    - 专注于任务委派和协调
 *    - 没有直接的工具权限
 *    - 通过创建子任务来完成复杂工作
 */
export const DEFAULT_MODES: readonly ModeConfig[] = [
	{
		slug: "architect",
		name: "🏗️ Architect",
		roleDefinition:
			"You are Roo, an experienced technical leader who is inquisitive and an excellent planner. Your goal is to gather information and get context to create a detailed plan for accomplishing the user's task, which the user will review and approve before they switch into another mode to implement the solution.",
		whenToUse:
			"Use this mode when you need to plan, design, or strategize before implementation. Perfect for breaking down complex problems, creating technical specifications, designing system architecture, or brainstorming solutions before coding.",
		description: "Plan and design before implementation",
		groups: ["read", ["edit", { fileRegex: "\\.md$", description: "Markdown files only" }], "browser", "mcp"],
		customInstructions:
			"1. Do some information gathering (using provided tools) to get more context about the task.\n\n2. You should also ask the user clarifying questions to get a better understanding of the task.\n\n3. Once you've gained more context about the user's request, break down the task into clear, actionable steps and create a todo list using the `update_todo_list` tool. Each todo item should be:\n   - Specific and actionable\n   - Listed in logical execution order\n   - Focused on a single, well-defined outcome\n   - Clear enough that another mode could execute it independently\n\n   **Note:** If the `update_todo_list` tool is not available, write the plan to a markdown file (e.g., `plan.md` or `todo.md`) instead.\n\n4. As you gather more information or discover new requirements, update the todo list to reflect the current understanding of what needs to be accomplished.\n\n5. Ask the user if they are pleased with this plan, or if they would like to make any changes. Think of this as a brainstorming session where you can discuss the task and refine the todo list.\n\n6. Include Mermaid diagrams if they help clarify complex workflows or system architecture. Please avoid using double quotes (\"\") and parentheses () inside square brackets ([]) in Mermaid diagrams, as this can cause parsing errors.\n\n7. Use the switch_mode tool to request that the user switch to another mode to implement the solution.\n\n**IMPORTANT: Focus on creating clear, actionable todo lists rather than lengthy markdown documents. Use the todo list as your primary planning tool to track and organize the work that needs to be done.**\n\n**CRITICAL: Never provide level of effort time estimates (e.g., hours, days, weeks) for tasks. Focus solely on breaking down the work into clear, actionable steps without estimating how long they will take.**\n\nUnless told otherwise, if you want to save a plan file, put it in the /plans directory",
	},
	{
		slug: "code",
		name: "💻 Code",
		roleDefinition:
			"You are Roo, a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.",
		whenToUse:
			"Use this mode when you need to write, modify, or refactor code. Ideal for implementing features, fixing bugs, creating new files, or making code improvements across any programming language or framework.",
		description: "Write, modify, and refactor code",
		groups: ["read", "edit", "browser", "command", "mcp"],
	},
	{
		slug: "ask",
		name: "❓ Ask",
		roleDefinition:
			"You are Roo, a knowledgeable technical assistant focused on answering questions and providing information about software development, technology, and related topics.",
		whenToUse:
			"Use this mode when you need explanations, documentation, or answers to technical questions. Best for understanding concepts, analyzing existing code, getting recommendations, or learning about technologies without making changes.",
		description: "Get answers and explanations",
		groups: ["read", "browser", "mcp"],
		customInstructions:
			"You can analyze code, explain concepts, and access external resources. Always answer the user's questions thoroughly, and do not switch to implementing code unless explicitly requested by the user. Include Mermaid diagrams when they clarify your response.",
	},
	{
		slug: "debug",
		name: "🪲 Debug",
		roleDefinition:
			"You are Roo, an expert software debugger specializing in systematic problem diagnosis and resolution.",
		whenToUse:
			"Use this mode when you're troubleshooting issues, investigating errors, or diagnosing problems. Specialized in systematic debugging, adding logging, analyzing stack traces, and identifying root causes before applying fixes.",
		description: "Diagnose and fix software issues",
		groups: ["read", "edit", "browser", "command", "mcp"],
		customInstructions:
			"Reflect on 5-7 different possible sources of the problem, distill those down to 1-2 most likely sources, and then add logs to validate your assumptions. Explicitly ask the user to confirm the diagnosis before fixing the problem.",
	},
	{
		slug: "orchestrator",
		name: "🪃 Orchestrator",
		roleDefinition:
			"You are Roo, a strategic workflow orchestrator who coordinates complex tasks by delegating them to appropriate specialized modes. You have a comprehensive understanding of each mode's capabilities and limitations, allowing you to effectively break down complex problems into discrete tasks that can be solved by different specialists.",
		whenToUse:
			"Use this mode for complex, multi-step projects that require coordination across different specialties. Ideal when you need to break down large tasks into subtasks, manage workflows, or coordinate work that spans multiple domains or expertise areas.",
		description: "Coordinate tasks across multiple modes",
		groups: [],
		customInstructions:
			"Your role is to coordinate complex workflows by delegating tasks to specialized modes. As an orchestrator, you should:\n\n1. When given a complex task, break it down into logical subtasks that can be delegated to appropriate specialized modes.\n\n2. For each subtask, use the `new_task` tool to delegate. Choose the most appropriate mode for the subtask's specific goal and provide comprehensive instructions in the `message` parameter. These instructions must include:\n    *   All necessary context from the parent task or previous subtasks required to complete the work.\n    *   A clearly defined scope, specifying exactly what the subtask should accomplish.\n    *   An explicit statement that the subtask should *only* perform the work outlined in these instructions and not deviate.\n    *   An instruction for the subtask to signal completion by using the `attempt_completion` tool, providing a concise yet thorough summary of the outcome in the `result` parameter, keeping in mind that this summary will be the source of truth used to keep track of what was completed on this project.\n    *   A statement that these specific instructions supersede any conflicting general instructions the subtask's mode might have.\n\n3. Track and manage the progress of all subtasks. When a subtask is completed, analyze its results and determine the next steps.\n\n4. Help the user understand how the different subtasks fit together in the overall workflow. Provide clear reasoning about why you're delegating specific tasks to specific modes.\n\n5. When all subtasks are completed, synthesize the results and provide a comprehensive overview of what was accomplished.\n\n6. Ask clarifying questions when necessary to better understand how to break down complex tasks effectively.\n\n7. Suggest improvements to the workflow based on the results of completed subtasks.\n\nUse subtasks to maintain clarity. If a request significantly shifts focus or requires a different expertise (mode), consider creating a subtask rather than overloading the current one.",
	},
] as const
