import {
  Brain,
  Braces,
  Code2,
  Cpu,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type {
  AgentMode,
  ChatSettings,
  ReasoningEffort,
  ResponseFormat,
} from '../types/chat';

export const DEFAULT_MODELS = ['gpt-oss:20b', 'qwen3.5:9b', 'qwen3:8b'];

export const DEFAULT_SYSTEM_PROMPT =
  '너는 코딩 초보자와 마케팅 학습자를 도와주는 친절한 AI 튜터야. 어려운 개념은 비유를 먼저 들고, 그다음 핵심을 설명해줘. 답변은 한국어로 해줘.';

const CUSTOM_MODEL_VALUE = '__custom_model__';

const REASONING_OPTIONS: Array<{
  value: ReasoningEffort;
  label: string;
  description: string;
}> = [
  {
    value: 'low',
    label: '낮음',
    description: '일상 대화와 빠른 응답',
  },
  {
    value: 'medium',
    label: '중간',
    description: '속도와 설명의 균형',
  },
  {
    value: 'high',
    label: '높음',
    description: '분석과 디버깅 중심',
  },
];

const FORMAT_OPTIONS: Array<{
  value: ResponseFormat;
  label: string;
  description: string;
}> = [
  {
    value: 'text',
    label: '일반 답변',
    description: 'Markdown과 자연어 답변',
  },
  {
    value: 'json',
    label: 'JSON 출력',
    description: '구조화된 결과가 필요할 때',
  },
];

const AGENT_OPTIONS: Array<{
  value: AgentMode;
  label: string;
  description: string;
}> = [
  {
    value: 'off',
    label: '끄기',
    description: '일반 채팅만 사용',
  },
  {
    value: 'calculator',
    label: '계산 도구',
    description: '산술 계산을 로컬 함수로 처리',
  },
];

interface SettingsPanelProps {
  isOpen: boolean;
  settings: ChatSettings;
  onClose: () => void;
  onSave: (settings: ChatSettings) => void;
}

const clampTemperature = (temperature: number) =>
  Math.min(2, Math.max(0, Number(temperature.toFixed(1))));

export const SettingsPanel = ({
  isOpen,
  settings,
  onClose,
  onSave,
}: SettingsPanelProps) => {
  const [draft, setDraft] = useState<ChatSettings>(settings);
  const [customModel, setCustomModel] = useState('');

  const modelOptions = useMemo(
    () => Array.from(new Set([...DEFAULT_MODELS, ...draft.customModels])),
    [draft.customModels],
  );

  const selectedModelValue = modelOptions.includes(draft.model)
    ? draft.model
    : CUSTOM_MODEL_VALUE;

  useEffect(() => {
    if (isOpen) {
      setDraft(settings);
      setCustomModel(modelOptions.includes(settings.model) ? '' : settings.model);
    }
  }, [isOpen, modelOptions, settings]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    const trimmedCustomModel = customModel.trim();
    const nextModel = trimmedCustomModel || draft.model;
    const nextCustomModels =
      trimmedCustomModel && !DEFAULT_MODELS.includes(trimmedCustomModel)
        ? Array.from(new Set([...draft.customModels, trimmedCustomModel]))
        : draft.customModels;

    onSave({
      ...draft,
      model: nextModel,
      customModels: nextCustomModels,
      systemPrompt: draft.systemPrompt.trim(),
      temperature: clampTemperature(draft.temperature),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur">
      <section className="w-full max-w-3xl overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl shadow-slate-950">
        <header className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-500 text-white">
              <Settings size={19} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">설정</h2>
              <p className="text-sm text-slate-400">
                모델, 추론 수준, 출력 형식, 도구 사용을 조정합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-400 transition hover:bg-slate-900 hover:text-slate-100"
            aria-label="설정 닫기"
          >
            <X size={19} />
          </button>
        </header>

        <div className="max-h-[78vh] space-y-7 overflow-y-auto px-5 py-5">
          <section>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
              <SlidersHorizontal size={17} />
              기본 모델 설정
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  모델 선택
                </span>
                <select
                  value={selectedModelValue}
                  onChange={(event) => {
                    const value = event.target.value;
                    if (value === CUSTOM_MODEL_VALUE) {
                      setCustomModel(draft.model);
                      return;
                    }
                    setCustomModel('');
                    setDraft((previous) => ({ ...previous, model: value }));
                  }}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none transition focus:border-indigo-400"
                >
                  {modelOptions.map((model) => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                  <option value={CUSTOM_MODEL_VALUE}>사용자 직접 입력</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-200">
                  직접 모델명
                </span>
                <input
                  value={customModel}
                  onChange={(event) => setCustomModel(event.target.value)}
                  placeholder="예: llama3.2:latest"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-indigo-400"
                />
              </label>
            </div>
          </section>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              시스템 프롬프트
            </span>
            <textarea
              value={draft.systemPrompt}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  systemPrompt: event.target.value,
                }))
              }
              rows={5}
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-900 px-3 py-3 text-sm leading-6 text-slate-100 outline-none transition focus:border-indigo-400"
            />
          </label>

          <section>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Brain size={17} />
              gpt-oss 추론 설정
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {REASONING_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setDraft((previous) => ({
                      ...previous,
                      reasoningEffort: option.value,
                    }))
                  }
                  className={`rounded-lg border p-3 text-left transition ${
                    draft.reasoningEffort === option.value
                      ? 'border-indigo-400 bg-indigo-500/15 text-indigo-100'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>

            <label className="mt-4 flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900 p-3">
              <input
                type="checkbox"
                checked={draft.showThinking}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    showThinking: event.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 accent-indigo-500"
              />
              <span>
                <span className="block text-sm font-medium text-slate-100">
                  추론 trace 표시
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-400">
                  디버깅용입니다. 최종 사용자에게 공개할 화면에서는 끄는 것을 권장합니다.
                </span>
              </span>
            </label>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Braces size={17} />
              구조화 출력
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setDraft((previous) => ({
                      ...previous,
                      responseFormat: option.value,
                    }))
                  }
                  className={`rounded-lg border p-3 text-left transition ${
                    draft.responseFormat === option.value
                      ? 'border-blue-400 bg-blue-500/15 text-blue-100'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-100">
              <Wrench size={17} />
              에이전트 도구
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {AGENT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setDraft((previous) => ({
                      ...previous,
                      agentMode: option.value,
                    }))
                  }
                  className={`rounded-lg border p-3 text-left transition ${
                    draft.agentMode === option.value
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100'
                      : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <span className="block text-sm font-semibold">{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-400">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              브라우저만으로 배포되는 앱이라 웹 브라우징과 Python 실행은 포함하지 않았습니다.
              대신 안전한 로컬 계산 함수 호출 예제를 제공합니다.
            </p>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <label
                htmlFor="temperature"
                className="text-sm font-medium text-slate-200"
              >
                Temperature
              </label>
              <span className="rounded-md bg-slate-900 px-2 py-1 text-sm text-slate-300">
                {draft.temperature.toFixed(1)}
              </span>
            </div>
            <input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={draft.temperature}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  temperature: Number(event.target.value),
                }))
              }
              className="w-full accent-indigo-500"
            />
            <p className="mt-3 text-sm leading-6 text-slate-400">
              낮을수록 안정적이고 높을수록 창의적인 답변에 가까워집니다. 긴 대화는
              모델의 컨텍스트 길이에 따라 오래된 내용이 덜 반영될 수 있습니다.
            </p>
          </section>

          <section className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-100">
              <ShieldCheck size={17} />
              gpt-oss 참고 메모
            </div>
            <div className="grid gap-3 text-xs leading-5 text-slate-400 sm:grid-cols-2">
              <p>
                <span className="font-semibold text-slate-200">라이선스:</span>{' '}
                gpt-oss 모델은 Apache 2.0 기반으로 소개되어 실험과 상업적 활용에
                적합합니다.
              </p>
              <p>
                <span className="font-semibold text-slate-200">MXFP4:</span>{' '}
                gpt-oss-20b는 소비자용 하드웨어에서 실행 가능한 양자화 모델로
                안내됩니다.
              </p>
              <p>
                <span className="font-semibold text-slate-200">정밀 조정:</span>{' '}
                브라우저 앱이 직접 학습시키지는 않지만, README에 별도 워크플로를
                정리했습니다.
              </p>
              <p>
                <span className="font-semibold text-slate-200">로컬 우선:</span>{' '}
                대화는 사용자의 Ollama 서버로 직접 전송되며 별도 백엔드를 거치지
                않습니다.
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Cpu size={14} />
              <span>RTX 8GB 환경에서는 qwen3:8b 같은 작은 모델로 먼저 테스트하세요.</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Code2 size={14} />
              <span>구조화 출력은 Ollama의 format=json 옵션을 사용합니다.</span>
            </div>
          </section>
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-800 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-slate-100"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-indigo-400"
          >
            <Save size={17} />
            저장
          </button>
        </footer>
      </section>
    </div>
  );
};
