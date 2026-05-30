import type {
  AgentMode,
  ChatReply,
  OllamaChatResponse,
  OllamaMessage,
  OllamaToolCall,
  ResponseFormat,
  SendChatMessageParams,
  ToolCallSummary,
} from '../types/chat';

export const OLLAMA_CHAT_ENDPOINT = 'http://localhost:11434/api/chat';

type OllamaErrorKind = 'connection' | 'model' | 'server' | 'tool' | 'unknown';

interface OllamaToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      required: string[];
      properties: Record<string, unknown>;
    };
  };
}

export class OllamaRequestError extends Error {
  kind: OllamaErrorKind;
  status?: number;

  constructor(message: string, kind: OllamaErrorKind, status?: number) {
    super(message);
    this.name = 'OllamaRequestError';
    this.kind = kind;
    this.status = status;
  }
}

const CONNECTION_ERROR =
  'Ollama 서버에 연결할 수 없습니다. 터미널에서 `ollama serve` 또는 `ollama run gpt-oss:20b`를 실행했는지 확인해주세요.';

const CALCULATOR_TOOLS: OllamaToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'calculate_expression',
      description:
        'Evaluate a short arithmetic expression using +, -, *, /, %, parentheses, and decimals.',
      parameters: {
        type: 'object',
        required: ['expression'],
        properties: {
          expression: {
            type: 'string',
            description: 'A safe arithmetic expression such as (11434+12341)*412',
          },
        },
      },
    },
  },
];

const REASONING_LABEL = {
  low: '낮음',
  medium: '중간',
  high: '높음',
};

const buildSystemPrompt = ({
  systemPrompt,
  reasoningEffort,
  responseFormat,
  agentMode,
}: Pick<
  SendChatMessageParams,
  'systemPrompt' | 'reasoningEffort' | 'responseFormat' | 'agentMode'
>) => {
  const instructions = [
    systemPrompt.trim(),
    `추론 수준: ${REASONING_LABEL[reasoningEffort]}`,
  ];

  if (responseFormat === 'json') {
    instructions.push(
      '응답은 반드시 유효한 JSON 하나만 반환해줘. Markdown 코드블록이나 설명 문장을 JSON 밖에 쓰지 마.',
    );
  }

  if (agentMode === 'calculator') {
    instructions.push(
      '정확한 산술 계산이 필요하면 calculate_expression 도구를 호출하고, 도구 결과를 반영해서 최종 답변을 작성해줘.',
    );
  }

  return instructions.filter(Boolean).join('\n\n');
};

const buildMessages = ({
  messages,
  systemPrompt,
  reasoningEffort,
  responseFormat,
  agentMode,
}: Pick<
  SendChatMessageParams,
  'messages' | 'systemPrompt' | 'reasoningEffort' | 'responseFormat' | 'agentMode'
>): OllamaMessage[] => {
  const chatMessages = messages.map(({ role, content }) => ({ role, content }));
  const prompt = buildSystemPrompt({
    systemPrompt,
    reasoningEffort,
    responseFormat,
    agentMode,
  });

  if (!prompt.trim()) {
    return chatMessages;
  }

  return [{ role: 'system', content: prompt }, ...chatMessages];
};

const getReadableError = async (
  response: Response,
  model: string,
): Promise<OllamaRequestError> => {
  let payload: OllamaChatResponse | null = null;

  try {
    payload = (await response.json()) as OllamaChatResponse;
  } catch {
    payload = null;
  }

  const serverMessage = payload?.error ?? '';
  const lowerMessage = serverMessage.toLowerCase();

  if (
    response.status === 404 ||
    lowerMessage.includes('model') ||
    lowerMessage.includes('not found') ||
    lowerMessage.includes('pull')
  ) {
    return new OllamaRequestError(
      `해당 모델이 설치되어 있지 않을 수 있습니다. \`ollama pull ${model}\`를 먼저 실행해주세요.`,
      'model',
      response.status,
    );
  }

  if (response.status >= 500) {
    return new OllamaRequestError(
      'Ollama 서버에서 응답을 처리하지 못했습니다. 모델 실행 상태와 터미널 로그를 확인해주세요.',
      'server',
      response.status,
    );
  }

  return new OllamaRequestError(
    serverMessage || '요청을 처리하는 중 알 수 없는 오류가 발생했습니다.',
    'unknown',
    response.status,
  );
};

const createRequestBody = ({
  model,
  messages,
  temperature,
  reasoningEffort,
  responseFormat,
  agentMode,
}: Pick<
  SendChatMessageParams,
  | 'model'
  | 'temperature'
  | 'reasoningEffort'
  | 'responseFormat'
  | 'agentMode'
> & {
  messages: OllamaMessage[];
}) => ({
  model,
  messages,
  stream: false,
  think: reasoningEffort,
  ...(responseFormat === 'json' ? { format: 'json' } : {}),
  ...(agentMode === 'calculator' ? { tools: CALCULATOR_TOOLS } : {}),
  options: {
    temperature,
  },
});

const postChat = async (
  body: ReturnType<typeof createRequestBody>,
  model: string,
) => {
  let response: Response;

  try {
    response = await fetch(OLLAMA_CHAT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new OllamaRequestError(CONNECTION_ERROR, 'connection');
  }

  if (!response.ok) {
    throw await getReadableError(response, model);
  }

  return (await response.json()) as OllamaChatResponse;
};

const evaluateExpression = (expression: unknown) => {
  if (typeof expression !== 'string') {
    throw new OllamaRequestError(
      '계산 도구에는 expression 문자열이 필요합니다.',
      'tool',
    );
  }

  const trimmedExpression = expression.trim();

  if (trimmedExpression.length > 120) {
    throw new OllamaRequestError('계산식이 너무 깁니다.', 'tool');
  }

  if (!/^[\d+\-*/%().\s]+$/.test(trimmedExpression)) {
    throw new OllamaRequestError(
      '계산 도구는 숫자와 +, -, *, /, %, 괄호만 지원합니다.',
      'tool',
    );
  }

  const result = Function(
    `"use strict"; return (${trimmedExpression});`,
  )() as unknown;

  if (typeof result !== 'number' || !Number.isFinite(result)) {
    throw new OllamaRequestError('계산 결과가 유효한 숫자가 아닙니다.', 'tool');
  }

  return String(result);
};

const runToolCall = (toolCall: OllamaToolCall): ToolCallSummary => {
  const { name, arguments: args } = toolCall.function;

  if (name !== 'calculate_expression') {
    return {
      name,
      arguments: args,
      result: '지원하지 않는 도구입니다.',
    };
  }

  return {
    name,
    arguments: args,
    result: evaluateExpression(args.expression),
  };
};

const toToolMessage = (toolCall: ToolCallSummary): OllamaMessage => ({
  role: 'tool',
  tool_name: toolCall.name,
  content: toolCall.result ?? '',
});

const mergeThinking = (...thinkingParts: Array<string | undefined>) =>
  thinkingParts
    .map((thinking) => thinking?.trim())
    .filter(Boolean)
    .join('\n\n---\n\n');

const getAnswer = (data: OllamaChatResponse) => data.message?.content?.trim();

export const sendChatMessage = async ({
  model,
  messages,
  systemPrompt,
  temperature,
  reasoningEffort,
  showThinking,
  responseFormat,
  agentMode,
}: SendChatMessageParams): Promise<ChatReply> => {
  const ollamaMessages = buildMessages({
    messages,
    systemPrompt,
    reasoningEffort,
    responseFormat,
    agentMode,
  });

  const firstResponse = await postChat(
    createRequestBody({
      model,
      messages: ollamaMessages,
      temperature,
      reasoningEffort,
      responseFormat,
      agentMode,
    }),
    model,
  );

  const toolCalls = firstResponse.message?.tool_calls ?? [];

  if (agentMode === 'calculator' && toolCalls.length > 0) {
    const toolResults = toolCalls.map(runToolCall);
    const followUpMessages: OllamaMessage[] = [
      ...ollamaMessages,
      {
        role: 'assistant',
        content: firstResponse.message?.content ?? '',
        tool_calls: toolCalls,
      },
      ...toolResults.map(toToolMessage),
    ];

    const finalResponse = await postChat(
      createRequestBody({
        model,
        messages: followUpMessages,
        temperature,
        reasoningEffort,
        responseFormat,
        agentMode,
      }),
      model,
    );
    const content = getAnswer(finalResponse);

    if (!content) {
      throw new OllamaRequestError(
        'Ollama 응답이 비어 있습니다. 모델을 다시 실행한 뒤 재시도해주세요.',
        'unknown',
      );
    }

    return {
      content,
      thinking: showThinking
        ? mergeThinking(firstResponse.message?.thinking, finalResponse.message?.thinking)
        : undefined,
      toolCalls: toolResults,
    };
  }

  const content = getAnswer(firstResponse);

  if (!content) {
    throw new OllamaRequestError(
      'Ollama 응답이 비어 있습니다. 모델을 다시 실행한 뒤 재시도해주세요.',
      'unknown',
    );
  }

  return {
    content,
    thinking: showThinking ? firstResponse.message?.thinking : undefined,
  };
};
