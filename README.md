# Local LLM Chat

Ollama에서 실행 중인 로컬 LLM 모델과 브라우저에서 대화할 수 있는 React 기반 개인 AI 챗봇 웹앱입니다. 백엔드 서버 없이 프론트엔드에서 Ollama Chat API를 직접 호출하며, 대화 기록과 설정은 `localStorage`에 저장됩니다.

![사용 예시 이미지 자리 표시](./docs/screenshot-placeholder.svg)

## 주요 기능

- ChatGPT 스타일의 대화형 UI
- Ollama `/api/chat` 연동
- 기본 모델 선택: `gpt-oss:20b`, `qwen3.5:9b`, `qwen3:8b`
- 사용자 직접 모델명 입력 및 저장
- 시스템 프롬프트 편집 및 저장
- temperature 설정
- gpt-oss 추론 수준 설정: 낮음, 중간, 높음
- Ollama `thinking` 응답 trace 표시 옵션
- Ollama `format=json` 기반 구조화 출력 모드
- Ollama tool calling 기반 계산 도구 실험 모드
- 대화 기록 `localStorage` 저장
- 새 채팅 시작, 전체 대화 삭제
- 추천 질문 버튼
- 로딩 상태와 친절한 오류 메시지
- 모바일 반응형 다크모드 UI

## gpt-oss 기능 지원

이 앱은 백엔드 없이 브라우저에서 Ollama API를 직접 호출하는 구조입니다. 따라서 로컬 브라우저 앱에서 안전하게 다룰 수 있는 기능을 중심으로 지원합니다.

| 기능 | 앱 지원 상태 | 설명 |
| --- | --- | --- |
| Apache 2.0 라이선스 안내 | 지원 | 설정 패널의 gpt-oss 참고 메모에 표시합니다. |
| 추론 노력 수준 | 지원 | 설정 패널에서 낮음, 중간, 높음을 선택하면 `/api/chat`의 `think` 값으로 전달합니다. |
| 추론 trace | 지원 | 설정에서 `추론 trace 표시`를 켜면 assistant 메시지 아래에 접을 수 있는 디버그 패널로 표시합니다. |
| 구조화 출력 | 지원 | JSON 출력 모드를 켜면 Ollama의 `format: "json"` 옵션을 사용합니다. |
| 도구 호출 | 부분 지원 | 백엔드 없이 안전하게 실행 가능한 계산 도구 예제를 제공합니다. |
| 웹 브라우징, Python 실행 | 제외 | 공개 정적 사이트에서 임의 브라우징/Python 실행은 보안상 백엔드 샌드박스가 필요합니다. |
| 정밀 조정 | 문서화 | 앱에서 직접 학습하지는 않으며, 별도 CLI/학습 환경에서 진행해야 합니다. |
| MXFP4 양자화 | 안내 | 모델 특성과 하드웨어 참고 정보로 표시합니다. |

추론 trace는 디버깅과 검증 목적에 가깝습니다. 최종 사용자에게 공개하는 서비스에서는 기본값처럼 꺼두는 것을 권장합니다.

## 기술 스택

- React
- Vite
- TypeScript
- Tailwind CSS
- Fetch API
- localStorage
- Ollama

## 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/local-llm-chat.git
cd local-llm-chat
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Ollama 실행

Ollama가 설치되어 있다면 터미널에서 다음 명령어를 실행합니다.

```bash
ollama serve
```

다른 터미널에서 원하는 모델을 실행해도 됩니다.

```bash
ollama run gpt-oss:20b
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 Vite가 안내하는 주소, 보통 `http://localhost:5173`, 로 접속합니다.

## Ollama 설치 방법

Ollama 공식 사이트에서 운영체제에 맞는 설치 파일을 내려받아 설치합니다.

- [Ollama 공식 사이트](https://ollama.com/)

설치 후 정상 동작 여부를 확인합니다.

```bash
ollama --version
```

## 모델 다운로드 방법

사용하려는 모델이 로컬에 없다면 먼저 다운로드합니다.

```bash
ollama pull gpt-oss:20b
ollama pull qwen3.5:9b
ollama pull qwen3:8b
```

모델명이 다르거나 Ollama 라이브러리에 없는 경우, 설정 패널에서 직접 입력한 모델명과 `ollama pull`에 사용하는 모델명이 일치해야 합니다.

## 빌드 방법

```bash
npm run build
```

빌드 결과는 `dist/` 폴더에 생성됩니다.

로컬에서 빌드 결과를 확인하려면 다음 명령어를 사용합니다.

```bash
npm run preview
```

## 배포 방법

이 프로젝트는 정적 프론트엔드 앱이므로 GitHub Pages 또는 Netlify에 배포할 수 있습니다. 단, 배포된 사이트도 사용자의 브라우저에서 `http://localhost:11434`의 로컬 Ollama 서버를 호출합니다. 즉, 사이트 방문자의 PC에서 Ollama가 실행 중이어야 합니다.

### GitHub Pages

이 저장소에는 `.github/workflows/deploy.yml`이 포함되어 있습니다.

1. GitHub 저장소의 `Settings > Pages`로 이동합니다.
2. `Build and deployment > Source`를 `GitHub Actions`로 설정합니다.
3. `main` 브랜치에 push하면 GitHub Actions가 `npm ci`, `npm run build`를 실행합니다.
4. 빌드 결과인 `dist/`가 GitHub Pages에 배포됩니다.

Vite 설정의 `base: './'` 덕분에 `https://사용자명.github.io/local-llm-chat/` 같은 프로젝트 페이지 경로에서도 정적 파일이 동작합니다.

### Netlify

1. Netlify에서 새 사이트를 생성하고 GitHub 저장소를 연결합니다.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. 배포 후 Ollama CORS 허용 origin에 Netlify 주소를 추가합니다.

## CORS 문제가 생길 때

브라우저에서 다음과 비슷한 오류가 보이면 Ollama가 현재 웹앱 주소를 허용하지 않는 상태일 수 있습니다.

```text
Access to fetch at 'http://localhost:11434/api/chat' from origin 'http://localhost:5173' has been blocked by CORS policy
```

Ollama를 종료한 뒤, 허용할 주소를 `OLLAMA_ORIGINS`에 넣고 다시 실행합니다.

### Windows PowerShell

```powershell
$env:OLLAMA_ORIGINS="http://localhost:5173,https://your-username.github.io,https://your-site.netlify.app"
ollama serve
```

이 저장소를 그대로 배포했다면 다음처럼 실행할 수 있습니다.

```powershell
$env:OLLAMA_ORIGINS="https://psw228n-lab.github.io,https://psw228n-lab.github.io/local-llm-chat,http://localhost:5173,http://127.0.0.1:5173"
ollama serve
```

### macOS 또는 Linux

```bash
OLLAMA_ORIGINS="http://localhost:5173,https://your-username.github.io,https://your-site.netlify.app" ollama serve
```

Windows에서 Ollama가 백그라운드 서비스로 실행 중이라면 환경 변수를 시스템 환경 변수에 등록한 뒤 Ollama를 재시작해야 할 수 있습니다.

## 오류 메시지 가이드

- Ollama 서버에 연결할 수 없습니다: `ollama serve`가 실행 중인지 확인하세요.
- 모델이 설치되어 있지 않을 수 있습니다: `ollama pull 모델명`을 먼저 실행하세요.
- 답변이 너무 느립니다: 더 작은 모델을 선택하거나 temperature를 낮추고 대화 기록을 새로 시작해보세요.
- JSON 출력이 깨집니다: JSON 출력 모드를 켜고 새 채팅으로 다시 시작하세요.
- 계산 도구가 동작하지 않습니다: 설정에서 에이전트 도구를 `계산 도구`로 바꾸고, 모델이 tool calling을 지원하는지 확인하세요.

## 폴더 구조

```text
src/
  components/
    Sidebar.tsx
    ChatWindow.tsx
    MessageBubble.tsx
    ChatInput.tsx
    SettingsPanel.tsx
    EmptyState.tsx
  hooks/
    useChat.ts
    useLocalStorage.ts
  types/
    chat.ts
  utils/
    ollama.ts
  App.tsx
  main.tsx
  index.css
```

## 라이선스

이 프로젝트는 MIT 라이선스로 공개할 수 있습니다. 자세한 내용은 [LICENSE](./LICENSE)를 확인하세요.
