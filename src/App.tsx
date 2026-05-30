import { useMemo, useState } from 'react';
import { ChatWindow } from './components/ChatWindow';
import {
  DEFAULT_MODELS,
  DEFAULT_SYSTEM_PROMPT,
  SettingsPanel,
} from './components/SettingsPanel';
import { Sidebar } from './components/Sidebar';
import { useChat } from './hooks/useChat';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ChatSettings } from './types/chat';

const SETTINGS_STORAGE_KEY = 'local-llm-chat:settings';

const DEFAULT_SETTINGS: ChatSettings = {
  model: DEFAULT_MODELS[0],
  customModels: [],
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
  reasoningEffort: 'medium',
  showThinking: false,
  responseFormat: 'text',
  agentMode: 'off',
};

const normalizeSettings = (settings: ChatSettings): ChatSettings => ({
  ...DEFAULT_SETTINGS,
  ...settings,
  customModels: settings.customModels ?? [],
  temperature:
    typeof settings.temperature === 'number'
      ? settings.temperature
      : DEFAULT_SETTINGS.temperature,
  reasoningEffort: settings.reasoningEffort ?? DEFAULT_SETTINGS.reasoningEffort,
  showThinking: settings.showThinking ?? DEFAULT_SETTINGS.showThinking,
  responseFormat: settings.responseFormat ?? DEFAULT_SETTINGS.responseFormat,
  agentMode: settings.agentMode ?? DEFAULT_SETTINGS.agentMode,
});

function App() {
  const [storedSettings, setStoredSettings] = useLocalStorage<ChatSettings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS,
  );
  const settings = useMemo(
    () => normalizeSettings(storedSettings),
    [storedSettings],
  );
  const { messages, isLoading, error, sendMessage, resetChat, dismissError } =
    useChat(settings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleClearChats = () => {
    const shouldClear = window.confirm('저장된 대화를 모두 삭제할까요?');

    if (shouldClear) {
      resetChat();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="사이드바 배경 닫기"
        />
      )}

      <div className="flex min-h-screen">
        <Sidebar
          selectedModel={settings.model}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNewChat={() => {
            resetChat();
            setIsSidebarOpen(false);
          }}
          onOpenSettings={() => {
            setIsSettingsOpen(true);
            setIsSidebarOpen(false);
          }}
          onClearChats={handleClearChats}
        />

        <ChatWindow
          model={settings.model}
          messages={messages}
          isLoading={isLoading}
          error={error}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onSendMessage={sendMessage}
          onDismissError={dismissError}
        />
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onSave={setStoredSettings}
      />
    </div>
  );
}

export default App;
