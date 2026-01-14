/**
 * @fileoverview AI 提供者模型定义入口
 *
 * 这个文件是所有 AI 提供者模型定义的统一入口。
 * 它导出了 30+ 个不同 AI 服务提供者的模型配置。
 *
 * 每个提供者文件包含：
 * - 模型列表（ModelRecord）：该提供者支持的所有模型及其配置
 * - 默认模型 ID：该提供者的默认推荐模型
 * - 模型类型定义：TypeScript 类型用于类型安全
 *
 * 提供者分类：
 *
 * 1. 直接 API 提供者（有预定义模型列表）：
 *    - anthropic: Anthropic Claude 系列
 *    - openai-native: OpenAI GPT 系列
 *    - gemini: Google Gemini 系列
 *    - bedrock: AWS Bedrock（托管多个模型）
 *    - vertex: Google Vertex AI
 *    - mistral: Mistral AI
 *    - deepseek: DeepSeek
 *    - groq: Groq（高速推理）
 *    - xai: xAI (Grok)
 *    - cerebras: Cerebras
 *    - sambanova: SambaNova
 *    - fireworks: Fireworks AI
 *    - featherless: Featherless
 *    - doubao: 字节跳动豆包
 *    - moonshot: 月之暗面
 *    - minimax: MiniMax
 *    - zai: Z.ai
 *    - baseten: Baseten
 *    - io-intelligence: IO Intelligence
 *    - qwen-code: 通义千问代码
 *    - claude-code: Claude Code CLI
 *    - vscode-llm: VS Code LM API
 *
 * 2. 动态提供者（模型列表从 API 获取）：
 *    - openrouter: OpenRouter 路由平台
 *    - huggingface: HuggingFace 推理 API
 *    - litellm: LiteLLM 代理
 *    - deepinfra: DeepInfra
 *    - requesty: Requesty
 *    - unbound: Unbound AI
 *    - roo: Roo Code 路由
 *    - chutes: Chutes AI
 *    - vercel-ai-gateway: Vercel AI Gateway
 *
 * 3. 本地提供者（模型列表从本地服务获取）：
 *    - ollama: Ollama
 *    - lmstudio: LM Studio
 */

export * from "./anthropic.js"
export * from "./baseten.js"
export * from "./bedrock.js"
export * from "./cerebras.js"
export * from "./chutes.js"
export * from "./claude-code.js"
export * from "./deepseek.js"
export * from "./doubao.js"
export * from "./featherless.js"
export * from "./fireworks.js"
export * from "./gemini.js"
export * from "./groq.js"
export * from "./huggingface.js"
export * from "./io-intelligence.js"
export * from "./lite-llm.js"
export * from "./lm-studio.js"
export * from "./mistral.js"
export * from "./moonshot.js"
export * from "./ollama.js"
export * from "./openai.js"
export * from "./openrouter.js"
export * from "./qwen-code.js"
export * from "./requesty.js"
export * from "./roo.js"
export * from "./sambanova.js"
export * from "./unbound.js"
export * from "./vertex.js"
export * from "./vscode-llm.js"
export * from "./xai.js"
export * from "./vercel-ai-gateway.js"
export * from "./zai.js"
export * from "./deepinfra.js"
export * from "./minimax.js"

// ============================================================================
// 默认模型 ID 导入
// ============================================================================

import { anthropicDefaultModelId } from "./anthropic.js"
import { basetenDefaultModelId } from "./baseten.js"
import { bedrockDefaultModelId } from "./bedrock.js"
import { cerebrasDefaultModelId } from "./cerebras.js"
import { chutesDefaultModelId } from "./chutes.js"
import { claudeCodeDefaultModelId } from "./claude-code.js"
import { deepSeekDefaultModelId } from "./deepseek.js"
import { doubaoDefaultModelId } from "./doubao.js"
import { featherlessDefaultModelId } from "./featherless.js"
import { fireworksDefaultModelId } from "./fireworks.js"
import { geminiDefaultModelId } from "./gemini.js"
import { groqDefaultModelId } from "./groq.js"
import { ioIntelligenceDefaultModelId } from "./io-intelligence.js"
import { litellmDefaultModelId } from "./lite-llm.js"
import { mistralDefaultModelId } from "./mistral.js"
import { moonshotDefaultModelId } from "./moonshot.js"
import { openRouterDefaultModelId } from "./openrouter.js"
import { qwenCodeDefaultModelId } from "./qwen-code.js"
import { requestyDefaultModelId } from "./requesty.js"
import { rooDefaultModelId } from "./roo.js"
import { sambaNovaDefaultModelId } from "./sambanova.js"
import { unboundDefaultModelId } from "./unbound.js"
import { vertexDefaultModelId } from "./vertex.js"
import { vscodeLlmDefaultModelId } from "./vscode-llm.js"
import { xaiDefaultModelId } from "./xai.js"
import { vercelAiGatewayDefaultModelId } from "./vercel-ai-gateway.js"
import { internationalZAiDefaultModelId, mainlandZAiDefaultModelId } from "./zai.js"
import { deepInfraDefaultModelId } from "./deepinfra.js"
import { minimaxDefaultModelId } from "./minimax.js"

// 从 provider-settings 导入 ProviderName 类型以避免重复定义
import type { ProviderName } from "../provider-settings.js"

// ============================================================================
// getProviderDefaultModelId - 获取提供者默认模型 ID
// ============================================================================

/**
 * 获取指定提供者的默认模型 ID
 *
 * 此函数仅返回提供者的默认模型 ID，不考虑用户配置。
 * 主要用作提供者模型列表仍在加载时的回退值。
 *
 * @param provider - 提供者名称
 * @param options - 可选配置
 * @param options.isChina - 是否为中国区域（影响某些提供者的默认模型）
 * @returns 默认模型 ID 字符串
 *
 * @example
 * ```typescript
 * // 获取 Anthropic 的默认模型
 * const modelId = getProviderDefaultModelId("anthropic")
 * // 返回: "claude-sonnet-4-5"
 *
 * // 获取 Z.ai 的中国区默认模型
 * const modelId = getProviderDefaultModelId("zai", { isChina: true })
 * ```
 */
export function getProviderDefaultModelId(
	provider: ProviderName,
	options: { isChina?: boolean } = { isChina: false },
): string {
	switch (provider) {
		// 动态提供者（路由平台）
		case "openrouter":
			return openRouterDefaultModelId
		case "requesty":
			return requestyDefaultModelId
		case "unbound":
			return unboundDefaultModelId
		case "litellm":
			return litellmDefaultModelId

		// 直接 API 提供者
		case "xai":
			return xaiDefaultModelId
		case "groq":
			return groqDefaultModelId
		case "huggingface":
			return "meta-llama/Llama-3.3-70B-Instruct"
		case "chutes":
			return chutesDefaultModelId
		case "baseten":
			return basetenDefaultModelId
		case "bedrock":
			return bedrockDefaultModelId
		case "vertex":
			return vertexDefaultModelId
		case "gemini":
			return geminiDefaultModelId
		case "deepseek":
			return deepSeekDefaultModelId
		case "doubao":
			return doubaoDefaultModelId
		case "moonshot":
			return moonshotDefaultModelId
		case "minimax":
			return minimaxDefaultModelId
		case "zai":
			// Z.ai 根据区域返回不同的默认模型
			return options?.isChina ? mainlandZAiDefaultModelId : internationalZAiDefaultModelId
		case "openai-native":
			return "gpt-4o"
		case "mistral":
			return mistralDefaultModelId

		// 自定义/本地提供者（使用动态模型选择）
		case "openai":
			return "" // OpenAI 提供者使用自定义模型配置
		case "ollama":
			return "" // Ollama 使用动态模型选择
		case "lmstudio":
			return "" // LM Studio 使用动态模型选择

		// 其他直接 API 提供者
		case "deepinfra":
			return deepInfraDefaultModelId
		case "vscode-lm":
			return vscodeLlmDefaultModelId
		case "claude-code":
			return claudeCodeDefaultModelId
		case "cerebras":
			return cerebrasDefaultModelId
		case "sambanova":
			return sambaNovaDefaultModelId
		case "fireworks":
			return fireworksDefaultModelId
		case "featherless":
			return featherlessDefaultModelId
		case "io-intelligence":
			return ioIntelligenceDefaultModelId
		case "roo":
			return rooDefaultModelId
		case "qwen-code":
			return qwenCodeDefaultModelId
		case "vercel-ai-gateway":
			return vercelAiGatewayDefaultModelId

		// 默认回退到 Anthropic
		case "anthropic":
		case "gemini-cli":
		case "fake-ai":
		default:
			return anthropicDefaultModelId
	}
}
