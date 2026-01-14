/**
 * @fileoverview AI 模型信息类型定义
 *
 * 这个文件定义了 Roo Code 中 AI 模型相关的所有类型。
 * 包括模型能力、定价、推理配置等信息。
 *
 * 主要类型：
 * - ReasoningEffort: 推理努力程度（用于支持推理的模型）
 * - VerbosityLevel: 输出详细程度
 * - ServiceTier: 服务层级（OpenAI 特有）
 * - ModelParameter: 模型支持的参数
 * - ModelInfo: 模型完整信息（能力、定价、限制等）
 *
 * 这些类型用于：
 * - 模型选择和配置
 * - 成本计算
 * - 能力检测
 * - UI 显示
 */

import { z } from "zod"
import { DynamicProvider, LocalProvider } from "./provider-settings.js"

// ============================================================================
// ReasoningEffort - 推理努力程度
// ============================================================================

/**
 * 推理努力程度常量数组
 *
 * 用于支持推理功能的模型（如 Claude 3.5、o1 等）。
 * 推理努力程度影响模型在回答前的"思考"深度。
 *
 * - "low": 低推理，快速响应，适合简单问题
 * - "medium": 中等推理，平衡速度和质量
 * - "high": 高推理，深度思考，适合复杂问题
 */
export const reasoningEfforts = ["low", "medium", "high"] as const

/**
 * 推理努力程度的 Zod 验证模式
 */
export const reasoningEffortsSchema = z.enum(reasoningEfforts)

/**
 * 推理努力程度类型
 * "low" | "medium" | "high"
 */
export type ReasoningEffort = z.infer<typeof reasoningEffortsSchema>

// ============================================================================
// ReasoningEffortWithMinimal - 包含最小推理的努力程度
// ============================================================================

/**
 * 包含 "minimal" 选项的推理努力程度
 *
 * "minimal" 表示最小化推理，几乎不进行额外思考。
 * 适用于需要快速响应且问题简单的场景。
 */
export const reasoningEffortWithMinimalSchema = z.union([reasoningEffortsSchema, z.literal("minimal")])

/**
 * 包含最小推理的努力程度类型
 * "low" | "medium" | "high" | "minimal"
 */
export type ReasoningEffortWithMinimal = z.infer<typeof reasoningEffortWithMinimalSchema>

// ============================================================================
// ReasoningEffortExtended - 扩展推理努力程度
// ============================================================================

/**
 * 扩展推理努力程度常量数组
 *
 * 包含完整的推理级别选项：
 * - "none": 无推理，直接响应
 * - "minimal": 最小推理
 * - "low": 低推理
 * - "medium": 中等推理
 * - "high": 高推理
 * - "xhigh": 超高推理，最深度思考
 *
 * 注意："disable" 是 UI 控制值，不会作为实际的推理努力程度发送给模型
 */
export const reasoningEffortsExtended = ["none", "minimal", "low", "medium", "high", "xhigh"] as const

/**
 * 扩展推理努力程度的 Zod 验证模式
 */
export const reasoningEffortExtendedSchema = z.enum(reasoningEffortsExtended)

/**
 * 扩展推理努力程度类型
 */
export type ReasoningEffortExtended = z.infer<typeof reasoningEffortExtendedSchema>

// ============================================================================
// ReasoningEffortSetting - 用户设置中的推理努力程度
// ============================================================================

/**
 * 用户设置中的推理努力程度选项
 *
 * 包含 "disable" 选项，允许用户完全禁用推理功能。
 * 这是 UI 层面的设置值，"disable" 不会发送给模型。
 */
export const reasoningEffortSettingValues = ["disable", "none", "minimal", "low", "medium", "high", "xhigh"] as const

/**
 * 用户设置推理努力程度的 Zod 验证模式
 */
export const reasoningEffortSettingSchema = z.enum(reasoningEffortSettingValues)

// ============================================================================
// VerbosityLevel - 输出详细程度
// ============================================================================

/**
 * 输出详细程度常量数组
 *
 * 控制模型输出的详细程度：
 * - "low": 简洁输出，只包含关键信息
 * - "medium": 适中输出，平衡详细和简洁
 * - "high": 详细输出，包含完整解释和上下文
 */
export const verbosityLevels = ["low", "medium", "high"] as const

/**
 * 输出详细程度的 Zod 验证模式
 */
export const verbosityLevelsSchema = z.enum(verbosityLevels)

/**
 * 输出详细程度类型
 */
export type VerbosityLevel = z.infer<typeof verbosityLevelsSchema>

// ============================================================================
// ServiceTier - 服务层级（OpenAI 特有）
// ============================================================================

/**
 * OpenAI 服务层级常量数组
 *
 * OpenAI Responses API 支持不同的服务层级：
 * - "default": 默认层级，标准定价和性能
 * - "flex": 弹性层级，可能有更低的成本但响应时间不确定
 * - "priority": 优先层级，更快的响应但成本更高
 */
export const serviceTiers = ["default", "flex", "priority"] as const

/**
 * 服务层级的 Zod 验证模式
 */
export const serviceTierSchema = z.enum(serviceTiers)

/**
 * 服务层级类型
 */
export type ServiceTier = z.infer<typeof serviceTierSchema>

// ============================================================================
// ModelParameter - 模型参数
// ============================================================================

/**
 * 模型支持的参数常量数组
 *
 * 定义了模型可以接受的配置参数：
 * - "max_tokens": 最大输出 token 数
 * - "temperature": 温度参数，控制输出的随机性
 * - "reasoning": 推理配置
 * - "include_reasoning": 是否在输出中包含推理过程
 */
export const modelParameters = ["max_tokens", "temperature", "reasoning", "include_reasoning"] as const

/**
 * 模型参数的 Zod 验证模式
 */
export const modelParametersSchema = z.enum(modelParameters)

/**
 * 模型参数类型
 */
export type ModelParameter = z.infer<typeof modelParametersSchema>

/**
 * 检查字符串是否为有效的模型参数
 *
 * @param value - 要检查的字符串
 * @returns 如果是有效的模型参数返回 true
 */
export const isModelParameter = (value: string): value is ModelParameter =>
	modelParameters.includes(value as ModelParameter)

// ============================================================================
// ModelInfo - 模型信息
// ============================================================================

/**
 * 模型信息的 Zod 验证模式
 *
 * 这是最重要的模型类型，包含了模型的所有元数据：
 * - 能力限制（token 限制、上下文窗口等）
 * - 功能支持（图像、缓存、推理等）
 * - 定价信息（输入/输出/缓存价格）
 * - 工具配置（原生工具支持、排除/包含的工具）
 * - 服务层级（OpenAI 特有的多层级定价）
 */
export const modelInfoSchema = z.object({
	// ========================================================================
	// Token 限制
	// ========================================================================

	/** 最大输出 token 数（模型单次响应的最大长度） */
	maxTokens: z.number().nullish(),
	/** 最大思考 token 数（用于推理模型的内部思考） */
	maxThinkingTokens: z.number().nullish(),
	/** 上下文窗口大小（模型能处理的最大输入 token 数） */
	contextWindow: z.number(),

	// ========================================================================
	// 基础能力支持
	// ========================================================================

	/** 是否支持图像输入（多模态能力） */
	supportsImages: z.boolean().optional(),
	/** 是否支持提示词缓存（减少重复计算成本） */
	supportsPromptCache: z.boolean(),
	/**
	 * 提示词缓存保留策略
	 * - "in_memory": 内存缓存（默认）
	 * - "24h": 24小时持久化缓存（扩展缓存）
	 */
	promptCacheRetention: z.enum(["in_memory", "24h"]).optional(),
	/** 是否支持输出详细程度参数 */
	supportsVerbosity: z.boolean().optional(),
	/** 是否支持温度参数（控制输出随机性） */
	supportsTemperature: z.boolean().optional(),
	/** 默认温度值 */
	defaultTemperature: z.number().optional(),

	// ========================================================================
	// 推理能力配置
	// ========================================================================

	/** 是否支持推理预算（限制推理 token 数） */
	supportsReasoningBudget: z.boolean().optional(),
	/** 是否必须设置推理预算 */
	requiredReasoningBudget: z.boolean().optional(),
	/** 是否支持简单的开/关二元推理 */
	supportsReasoningBinary: z.boolean().optional(),
	/**
	 * 是否支持推理努力程度
	 * - boolean: 简单的支持/不支持
	 * - array: 支持的具体级别列表
	 */
	supportsReasoningEffort: z
		.union([z.boolean(), z.array(z.enum(["disable", "none", "minimal", "low", "medium", "high", "xhigh"]))])
		.optional(),
	/** 是否必须设置推理努力程度 */
	requiredReasoningEffort: z.boolean().optional(),
	/** 是否保留推理过程在输出中 */
	preserveReasoning: z.boolean().optional(),
	/** 默认推理努力程度 */
	reasoningEffort: reasoningEffortExtendedSchema.optional(),

	// ========================================================================
	// 参数支持
	// ========================================================================

	/** 模型支持的参数列表 */
	supportedParameters: z.array(modelParametersSchema).optional(),

	// ========================================================================
	// 定价信息（单位：美元/百万 token）
	// ========================================================================

	/** 输入价格 */
	inputPrice: z.number().optional(),
	/** 输出价格 */
	outputPrice: z.number().optional(),
	/** 缓存写入价格 */
	cacheWritesPrice: z.number().optional(),
	/** 缓存读取价格 */
	cacheReadsPrice: z.number().optional(),

	// ========================================================================
	// 缓存配置
	// ========================================================================

	/** 每个缓存点的最小 token 数 */
	minTokensPerCachePoint: z.number().optional(),
	/** 最大缓存点数量 */
	maxCachePoints: z.number().optional(),
	/** 可缓存的字段列表 */
	cachableFields: z.array(z.string()).optional(),

	// ========================================================================
	// 模型元数据
	// ========================================================================

	/** 模型描述 */
	description: z.string().optional(),
	/** 是否已弃用（不应再使用） */
	deprecated: z.boolean().optional(),
	/** 是否为隐身模型（隐藏供应商身份） */
	isStealthModel: z.boolean().optional(),
	/** 是否免费 */
	isFree: z.boolean().optional(),

	// ========================================================================
	// 工具调用配置
	// ========================================================================

	/** 是否支持原生工具调用（OpenAI 风格的函数调用） */
	supportsNativeTools: z.boolean().optional(),
	/**
	 * 默认工具协议
	 * - "xml": XML 格式的工具调用
	 * - "native": 原生函数调用
	 */
	defaultToolProtocol: z.enum(["xml", "native"]).optional(),
	/**
	 * 排除的工具列表（仅适用于原生协议）
	 * 这些工具将从可用工具集中移除
	 */
	excludedTools: z.array(z.string()).optional(),
	/**
	 * 包含的工具列表（仅适用于原生协议）
	 * 这些工具将被添加（如果它们属于当前模式允许的工具组）
	 * 不能强制添加模式不允许的工具组中的工具
	 */
	includedTools: z.array(z.string()).optional(),

	// ========================================================================
	// 服务层级（OpenAI 特有）
	// ========================================================================

	/**
	 * 服务层级及其定价信息
	 *
	 * 每个层级可以有不同的定价和上下文窗口大小。
	 * 顶层的 inputPrice/outputPrice 等字段代表默认/标准层级。
	 */
	tiers: z
		.array(
			z.object({
				/** 服务层级名称（flex, priority 等） */
				name: serviceTierSchema.optional(),
				/** 该层级的上下文窗口大小 */
				contextWindow: z.number(),
				/** 该层级的输入价格 */
				inputPrice: z.number().optional(),
				/** 该层级的输出价格 */
				outputPrice: z.number().optional(),
				/** 该层级的缓存写入价格 */
				cacheWritesPrice: z.number().optional(),
				/** 该层级的缓存读取价格 */
				cacheReadsPrice: z.number().optional(),
			}),
		)
		.optional(),
})

/**
 * 模型信息类型
 *
 * 包含模型的完整元数据，用于：
 * - 模型选择界面显示
 * - 能力检测和功能开关
 * - 成本计算和预算控制
 * - API 请求参数构建
 */
export type ModelInfo = z.infer<typeof modelInfoSchema>

/**
 * 模型记录类型
 *
 * 键为模型 ID（如 "claude-3-5-sonnet-20241022"），值为模型信息。
 * 用于存储某个提供者的所有可用模型。
 */
export type ModelRecord = Record<string, ModelInfo>

/**
 * 路由模型类型
 *
 * 用于动态提供者和本地提供者的模型记录。
 * 键为提供者类型，值为该提供者的模型记录。
 */
export type RouterModels = Record<DynamicProvider | LocalProvider, ModelRecord>
