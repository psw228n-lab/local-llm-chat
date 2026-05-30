import { Sparkles } from 'lucide-react';

const RECOMMENDED_PROMPTS = [
  '마케팅 퍼널을 쉽게 설명해줘',
  'Ollama가 뭔지 비유로 설명해줘',
  '11434 더하기 12341에 412를 곱해줘',
  '오늘 공부한 내용을 TIL JSON으로 정리해줘',
];

interface EmptyStateProps {
  disabled: boolean;
  onPromptClick: (prompt: string) => void;
}

export const EmptyState = ({ disabled, onPromptClick }: EmptyStateProps) => {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col justify-center px-4 py-12">
      <div className="mb-8 max-w-2xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-indigo-400/30 bg-indigo-400/10 px-3 py-2 text-sm font-medium text-indigo-200">
          <Sparkles size={16} />
          Local Ollama
        </div>
        <h2 className="text-3xl font-semibold tracking-normal text-slate-50 sm:text-4xl">
          무엇을 도와드릴까요?
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-400">
          코딩, 마케팅, 글쓰기, 학습 정리를 로컬 LLM과 차분하게 이어가세요.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {RECOMMENDED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onPromptClick(prompt)}
            className="rounded-lg border border-slate-800 bg-slate-900/80 p-4 text-left text-sm leading-6 text-slate-200 shadow-lg shadow-slate-950/30 transition hover:border-indigo-400/60 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
