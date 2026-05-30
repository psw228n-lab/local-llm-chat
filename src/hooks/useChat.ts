import { useCallback, useState } from 'react';
import type { ChatMessage, ChatSettings } from '../types/chat';
import { OllamaRequestError, sendChatMessage } from '../utils/ollama';
import { useLocalStorage } from './useLocalStorage';

const CHAT_STORAGE_KEY = 'local-llm-chat:messages';

const createMessageId = () => {
  const randomPart =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  return `${Date.now().toString(36)}-${randomPart}`;
};

const toErrorMessage = (error: unknown) => {
  if (error instanceof OllamaRequestError) {
    return error.message;
  }

  return '답변을 가져오는 중 오류가 발생했습니다. 잠시 뒤 다시 시도해주세요.';
};

export const useChat = (settings: ChatSettings) => {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    CHAT_STORAGE_KEY,
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmedContent = content.trim();

      if (!trimmedContent || isLoading) {
        return;
      }

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: trimmedContent,
        createdAt: new Date().toISOString(),
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsLoading(true);
      setError(null);

      try {
        const assistantReply = await sendChatMessage({
          model: settings.model,
          messages: nextMessages,
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          reasoningEffort: settings.reasoningEffort,
          showThinking: settings.showThinking,
          responseFormat: settings.responseFormat,
          agentMode: settings.agentMode,
        });

        const assistantMessage: ChatMessage = {
          id: createMessageId(),
          role: 'assistant',
          content: assistantReply.content,
          thinking: assistantReply.thinking,
          toolCalls: assistantReply.toolCalls,
          createdAt: new Date().toISOString(),
        };

        setMessages([...nextMessages, assistantMessage]);
      } catch (requestError) {
        setError(toErrorMessage(requestError));
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, setMessages, settings],
  );

  const resetChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, [setMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    resetChat,
    dismissError: () => setError(null),
  };
};
