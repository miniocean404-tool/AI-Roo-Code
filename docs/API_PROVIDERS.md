# Roo Code API 提供者详解

## 概述

Roo Code 支持 30+ 种 AI 提供者，通过统一的 `ApiHandler` 接口抽象，实现了灵活的多模型支持。

---

## 提供者架构

### 接口定义

```typescript
// src/api/index.ts
export interface ApiHandler {
    // 创建消息流
    createMessage(
        systemPrompt: string,
        messages: Anthropic.Messages.MessageParam[],
        metadata?: ApiHandlerCreateMessageMetadata,
    ): ApiStream

    // 获取模型信息
    getModel(): { id: string; info: ModelInfo }

    // Token 计数
    countTokens(content: Array<Anthropic.Messages.ContentBlockParam>): Promise<number>
}
```

### 工厂函数

```typescript
export function buildApiHandler(configuration: ProviderSettings): ApiHandler {
    const { apiProvider, ...options } = configuration

    switch (apiProvider) {
        case "anthropic":
            return new AnthropicHandler(options)
        case "openai":
            return new OpenAiHandler(options)
        case "gemini":
            return new GeminiHandler(options)
        // ... 更多提供者
        default:
            return new AnthropicHandler(options)
    }
}
```

---

## 支持的提供者列表

### Anthropic 系列

| 提供者 | 文件 | 说明 |
|--------|------|------|
| **Anthropic** | `anthropic.ts` | 官方 Anthropic API |
| **Claude Code** | `claude-code.ts` | Claude Code OAuth 直连 |
| **Bedrock** | `bedrock.ts` | AWS Bedrock Claude |
| **Vertex** | `anthropic-vertex.ts` | Google Vertex AI Claude |

### OpenAI 系列

| 提供者 | 文件 | 说明 |
|--------|------|------|
| **OpenAI** | `openai.ts` | OpenAI 兼容 API |
| **OpenAI Native** | `openai-native.ts` | 原生 OpenAI API |
| **Azure OpenAI** | 通过 `openai.ts` | Azure 托管 |

### Google 系列

| 提供者 | 文件 | 说明 |
|--------|------|------|
| **Gemini** | `gemini.ts` | Google Gemini API |
| **Vertex AI** | `vertex.ts` | Google Vertex AI |

### 开源/本地

| 提供者 | 文件 | 说明 |
|--------|------|------|
| **Ollama** | `native-ollama.ts` | 本地 Ollama |
| **LM Studio** | `lm-studio.ts` | LM Studio |
| **HuggingFace** | `huggingface.ts` | HuggingFace Inference |

### 聚合服务

| 提供者 | 文件 | 说明 |
|--------|------|------|
| **OpenRouter** | `openrouter.ts` | OpenRouter 聚合 |
| **Requesty** | `requesty.ts` | Requesty 服务 |
| **LiteLLM** | `litellm.ts` | LiteLLM 代理 |
| **Roo** | `roo.ts` | Roo Code Router |

### 其他提供者

| 提供者 | 文件 | 说明 |
|--------|------|------|
| **DeepSeek** | `deepseek.ts` | DeepSeek API |
| **Mistral** | `mistral.ts` | Mistral AI |
| **xAI** | `xai.ts` | xAI Grok |
| **Groq** | `groq.ts` | Groq 推理 |
| **Cerebras** | `cerebras.ts` | Cerebras |
| **SambaNova** | `sambanova.ts` | SambaNova |
| **Moonshot** | `moonshot.ts` | Moonshot AI |
| **Doubao** | `doubao.ts` | 字节豆包 |
| **Qwen Code** | `qwen-code.ts` | 通义千问 |
| **Fireworks** | `fireworks.ts` | Fireworks AI |
| **DeepInfra** | `deepinfra.ts` | DeepInfra |
| **Chutes** | `chutes.ts` | Chutes AI |
| **Featherless** | `featherless.ts` | Featherless |
| **MiniMax** | `minimax.ts` | MiniMax |
| **Baseten** | `baseten.ts` | Baseten |
| **IO Intelligence** | `io-intelligence.ts` | IO Intelligence |
| **ZAI** | `zai.ts` | ZAI |
| **Vercel AI Gateway** | `vercel-ai-gateway.ts` | Vercel AI |
| **Unbound** | `unbound.ts` | Unbound |
| **VS Code LM** | `vscode-lm.ts` | VS Code 语言模型 |
| **Fake AI** | `fake-ai.ts` | 测试用假 AI |

---

## 提供者实现详解

### AnthropicHandler

```typescript
// src/api/providers/anthropic.ts
export class AnthropicHandler implements ApiHandler {
    private client: Anthropic
    private options: AnthropicHandlerOptions

    constructor(options: AnthropicHandlerOptions) {
        this.options = options
        this.client = new Anthropic({
            apiKey: options.apiKey,
            baseURL: options.anthropicBaseUrl,
        })
    }

    async *createMessage(
        systemPrompt: string,
        messages: MessageParam[],
        metadata?: ApiHandlerCreateMessageMetadata
    ): ApiStream {
        const stream = await this.client.messages.stream({
            model: this.options.apiModelId,
            max_tokens: this.getMaxTokens(),
            system: systemPrompt,
            messages,
            // ... 其他参数
        })

        for await (const event of stream) {
            yield this.transformEvent(event)
        }
    }
}
```

### OpenAI 兼容提供者

```typescript
// src/api/providers/base-openai-compatible-provider.ts
export abstract class BaseOpenAiCompatibleProvider implements ApiHandler {
    protected client: OpenAI

    constructor(options: OpenAiCompatibleOptions) {
        this.client = new OpenAI({
            apiKey: options.apiKey,
            baseURL: options.baseUrl,
        })
    }

    async *createMessage(
        systemPrompt: string,
        messages: MessageParam[],
        metadata?: ApiHandlerCreateMessageMetadata
    ): ApiStream {
        // 转换消息格式
        const openaiMessages = convertToOpenAiFormat(messages)

        const stream = await this.client.chat.completions.create({
            model: this.getModelId(),
            messages: [
                { role: "system", content: systemPrompt },
                ...openaiMessages
            ],
            stream: true,
        })

        for await (const chunk of stream) {
            yield this.transformChunk(chunk)
        }
    }
}
```

### GeminiHandler

```typescript
// src/api/providers/gemini.ts
export class GeminiHandler implements ApiHandler {
    private client: GoogleGenerativeAI

    constructor(options: GeminiHandlerOptions) {
        this.client = new GoogleGenerativeAI(options.apiKey)
    }

    async *createMessage(
        systemPrompt: string,
        messages: MessageParam[],
        metadata?: ApiHandlerCreateMessageMetadata
    ): ApiStream {
        const model = this.client.getGenerativeModel({
            model: this.options.apiModelId,
            systemInstruction: systemPrompt,
        })

        // 转换为 Gemini 格式
        const geminiMessages = convertToGeminiFormat(messages)

        const result = await model.generateContentStream({
            contents: geminiMessages,
        })

        for await (const chunk of result.stream) {
            yield this.transformChunk(chunk)
        }
    }
}
```

---

## 消息格式转换

### 转换层架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Anthropic Format                          │
│  (内部统一格式)                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Transform Layer                           │
│  src/api/transform/                                          │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   OpenAI    │       │   Gemini    │       │   Mistral   │
│   Format    │       │   Format    │       │   Format    │
└─────────────┘       └─────────────┘       └─────────────┘
```

### 转换文件

| 文件 | 功能 |
|------|------|
| `openai-format.ts` | Anthropic -> OpenAI 格式 |
| `gemini-format.ts` | Anthropic -> Gemini 格式 |
| `mistral-format.ts` | Anthropic -> Mistral 格式 |
| `bedrock-converse-format.ts` | Anthropic -> Bedrock 格式 |
| `vscode-lm-format.ts` | Anthropic -> VS Code LM 格式 |
| `r1-format.ts` | DeepSeek R1 特殊格式 |
| `minimax-format.ts` | MiniMax 格式 |

---

## 流式响应处理

### ApiStream 类型

```typescript
// src/api/transform/stream.ts
export type ApiStream = AsyncGenerator<ApiStreamEvent, void, unknown>

export type ApiStreamEvent =
    | { type: "text"; text: string }
    | { type: "reasoning"; text: string }
    | { type: "tool_use"; id: string; name: string; input: unknown }
    | { type: "usage"; inputTokens: number; outputTokens: number }
    | { type: "error"; error: Error }
    | { type: "grounding"; sources: GroundingSource[] }
```

### 流处理示例

```typescript
async function processStream(stream: ApiStream) {
    for await (const event of stream) {
        switch (event.type) {
            case "text":
                // 处理文本
                appendText(event.text)
                break
            case "tool_use":
                // 处理工具调用
                await executeTool(event.name, event.input)
                break
            case "usage":
                // 记录 Token 使用
                recordUsage(event.inputTokens, event.outputTokens)
                break
        }
    }
}
```

---

## 缓存策略

### 缓存实现

```typescript
// src/api/transform/caching/
├── anthropic.ts      # Anthropic 缓存
├── gemini.ts         # Gemini 缓存
├── vertex.ts         # Vertex 缓存
└── vercel-ai-gateway.ts
```

### 缓存策略类型

```typescript
// src/api/transform/cache-strategy/
export type CacheStrategy =
    | "none"           // 不缓存
    | "system"         // 仅缓存系统提示
    | "all"            // 缓存所有
    | "auto"           // 自动决定
```

---

## 模型信息

### ModelInfo 类型

```typescript
interface ModelInfo {
    maxTokens: number           // 最大输出 Token
    contextWindow: number       // 上下文窗口大小
    supportsImages: boolean     // 是否支持图片
    supportsPromptCache: boolean // 是否支持提示缓存
    inputPrice: number          // 输入价格 ($/M tokens)
    outputPrice: number         // 输出价格 ($/M tokens)
    cacheWritesPrice?: number   // 缓存写入价格
    cacheReadsPrice?: number    // 缓存读取价格
    description?: string        // 模型描述
}
```

### 模型获取

```typescript
// 动态获取模型列表
// src/api/providers/fetchers/
├── openrouter.ts     # OpenRouter 模型列表
├── lmstudio.ts       # LM Studio 模型列表
├── ollama.ts         # Ollama 模型列表
├── litellm.ts        # LiteLLM 模型列表
├── chutes.ts         # Chutes 模型列表
├── roo.ts            # Roo 模型列表
└── modelCache.ts     # 模型缓存管理
```

---

## 错误处理

### 错误类型

```typescript
// src/api/providers/utils/error-handler.ts
export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public retryable?: boolean
    ) {
        super(message)
    }
}

// 常见错误
- RateLimitError      // 速率限制
- AuthenticationError // 认证失败
- ContextWindowError  // 上下文超限
- NetworkError        // 网络错误
```

### 重试策略

```typescript
// 指数退避重试
async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn()
        } catch (error) {
            if (!isRetryable(error) || i === maxRetries - 1) {
                throw error
            }
            await delay(Math.pow(2, i) * 1000)
        }
    }
}
```

---

## 配置示例

### Anthropic 配置

```json
{
    "apiProvider": "anthropic",
    "apiKey": "sk-ant-...",
    "apiModelId": "claude-sonnet-4-20250514",
    "anthropicBaseUrl": "https://api.anthropic.com"
}
```

### OpenAI 配置

```json
{
    "apiProvider": "openai",
    "openAiApiKey": "sk-...",
    "openAiModelId": "gpt-4o",
    "openAiBaseUrl": "https://api.openai.com/v1"
}
```

### Ollama 配置

```json
{
    "apiProvider": "ollama",
    "ollamaModelId": "llama3.2",
    "ollamaBaseUrl": "http://localhost:11434"
}
```

### OpenRouter 配置

```json
{
    "apiProvider": "openrouter",
    "openRouterApiKey": "sk-or-...",
    "openRouterModelId": "anthropic/claude-sonnet-4"
}
```

---

## 添加新提供者指南

### 步骤 1: 创建 Handler 文件

```typescript
// src/api/providers/my-provider.ts
import { ApiHandler, ApiHandlerCreateMessageMetadata } from ".."
import { ApiStream } from "../transform/stream"

export class MyProviderHandler implements ApiHandler {
    private options: MyProviderOptions

    constructor(options: MyProviderOptions) {
        this.options = options
    }

    async *createMessage(
        systemPrompt: string,
        messages: MessageParam[],
        metadata?: ApiHandlerCreateMessageMetadata
    ): ApiStream {
        // 实现消息创建逻辑
    }

    getModel(): { id: string; info: ModelInfo } {
        return {
            id: this.options.modelId,
            info: {
                maxTokens: 4096,
                contextWindow: 128000,
                supportsImages: true,
                supportsPromptCache: false,
                inputPrice: 0.001,
                outputPrice: 0.002,
            }
        }
    }

    async countTokens(content: ContentBlockParam[]): Promise<number> {
        // 使用 tiktoken 或提供者 API
        return estimateTokens(content)
    }
}
```

### 步骤 2: 注册提供者

```typescript
// src/api/index.ts
import { MyProviderHandler } from "./providers/my-provider"

export function buildApiHandler(configuration: ProviderSettings): ApiHandler {
    switch (apiProvider) {
        // ... 其他提供者
        case "my-provider":
            return new MyProviderHandler(options)
    }
}
```

### 步骤 3: 添加类型定义

```typescript
// packages/types/src/providers.ts
export type ProviderName =
    | "anthropic"
    | "openai"
    // ... 其他提供者
    | "my-provider"

export interface MyProviderSettings {
    apiKey: string
    modelId: string
    baseUrl?: string
}
```

### 步骤 4: 添加测试

```typescript
// src/api/providers/__tests__/my-provider.spec.ts
describe("MyProviderHandler", () => {
    it("should create messages", async () => {
        const handler = new MyProviderHandler({
            apiKey: "test-key",
            modelId: "test-model",
        })

        const stream = handler.createMessage("system", [])
        // 测试流输出
    })
})
```

---

## 相关文档

- [架构文档](./ARCHITECTURE.md) - 整体架构
- [工具系统](./TOOLS.md) - 工具系统详解
- [开发指南](./DEVELOPMENT.md) - 开发环境配置
