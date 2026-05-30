export type ChatRole = 'user' | 'assistant';
export type OllamaRole = ChatRole | 'system' | 'tool';
export type ReasoningEffort = 'low' | 'medium' | 'high';
export type ResponseFormat = 'text' | 'json';
export type AgentMode = 'off' | 'calculator';

export interface ToolCallSummary {
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  thinking?: string;
  toolCalls?: ToolCallSummary[];
}

export interface OllamaToolCall {
  type?: 'function';
  function: {
    index?: number;
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface OllamaMessage {
  role: OllamaRole;
  content?: string;
  tool_name?: string;
  tool_calls?: OllamaToolCall[];
}

export interface ChatSettings {
  model: string;
  customModels: string[];
  systemPrompt: string;
  temperature: number;
  reasoningEffort: ReasoningEffort;
  showThinking: boolean;
  responseFormat: ResponseFormat;
  agentMode: AgentMode;
}

export interface SendChatMessageParams {
  model: string;
  messages: ChatMessage[];
  systemPrompt: string;
  temperature: number;
  reasoningEffort: ReasoningEffort;
  showThinking: boolean;
  responseFormat: ResponseFormat;
  agentMode: AgentMode;
}

export interface ChatReply {
  content: string;
  thinking?: string;
  toolCalls?: ToolCallSummary[];
}

export interface OllamaChatResponse {
  message?: {
    role: OllamaRole;
    content?: string;
    thinking?: string;
    tool_calls?: OllamaToolCall[];
  };
  error?: string;
}
