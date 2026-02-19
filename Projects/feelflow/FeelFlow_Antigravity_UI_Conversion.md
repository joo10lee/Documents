# FeelFlow UI Conversion: V0 React → Vanilla HTML/CSS
## Antigravity (Cursor) 실행 프롬프트

---

## CONTEXT

FeelFlow는 ASD 청소년용 감정 조절 앱입니다. 현재 vanilla HTML/CSS/JS로 동작하는 MVP가 있고, V0(v0.dev)에서 만든 React/Tailwind 디자인 컴포넌트 13개를 이 기존 코드에 통합해야 합니다.

**기존 코드 파일:**
- `index.html` — 모든 screen div가 한 파일에 있음
- `css/style_v2.css` — 모든 스타일
- `js/app.js` — 메인 로직 (감정 선택, 체크인, Guardian, 루틴 등)
- `js/ui.js` — 화면 전환, 차트, 히스토리 렌더링
- `js/activities_v2.9.5.js` — 18개 전략 활동 렌더링
- `js/api.js` — AWS Lambda 연동

**V0 코드 위치:** `v0_design/` 폴더 (ZIP 압축 풀어둠)
- `v0_design/components/feelflow/*.tsx` — 13개 화면 컴포넌트
- `v0_design/app/globals.css` — 애니메이션, 슬라이더, CSS 변수

**목표:** V0의 **비주얼 디자인**을 기존 코드에 적용. 로직(onclick, 데이터 바인딩 등)은 기존 app.js/ui.js 그대로 유지.

---

## RULES (반드시 지켜야 할 것)

1. **기존 JS 로직을 절대 변경하지 마라.** onclick, id, class 바인딩은 보존해야 한다.
2. **screen ID를 변경하지 마라.** `screen1`, `screenTrigger`, `screenEmergency` 등 기존 ID 유지.
3. **파일 구조를 변경하지 마라.** index.html 한 파일에 모든 screen, style_v2.css 한 파일에 모든 스타일.
4. **React/Next.js 코드를 넣지 마라.** useState, useRouter, import 등은 모두 무시. vanilla HTML/CSS/JS만 사용.
5. **Lucide 아이콘은 인라인 SVG로 변환하라.** CDN이나 라이브러리 추가 없이 SVG를 직접 삽입.
6. **Tailwind 클래스를 CSS 클래스로 변환하라.** 인라인 style은 최소화하고 가능한 CSS 클래스로.

---

## STEP 1: CSS Design System 추가 (style_v2.css)

V0의 `globals.css`에서 아래 내용을 `style_v2.css` **최상단**에 추가:

### 1a. CSS 변수 (기존 변수와 충돌하지 않게 `--ff-` prefix 사용)

```css
:root {
  /* FeelFlow V4 Design System */
  --ff-bg: #F5F2EC;
  --ff-bg-gradient: linear-gradient(180deg, #F5F2EC 0%, #EDE9E1 100%);
  --ff-card: #FFFFFF;
  --ff-card-shadow: 0 2px 16px rgba(0,0,0,0.05), 0 0.5px 2px rgba(0,0,0,0.03);
  --ff-card-radius: 20px;
  --ff-primary: #6C5CE7;
  --ff-primary-light: #F0EDFF;
  --ff-success: #10B981;
  --ff-warning: #FDCB6E;
  --ff-danger: #FF6B6B;
  --ff-danger-gradient: linear-gradient(135deg, #FF6B6B, #E17055);
  --ff-text-primary: #1A1A2E;
  --ff-text-secondary: #6B7280;
  --ff-text-tertiary: #9CA3AF;
  --ff-border: rgba(0,0,0,0.06);
  --ff-nav-height: 72px;

  /* Emotion colors */
  --ff-happy: #F59E0B;
  --ff-sad: #3B82F6;
  --ff-anxious: #8B5CF6;
  --ff-angry: #EF4444;
  --ff-calm: #10B981;
  --ff-tired: #94A3B8;

  /* Font family */
  --ff-font: 'Plus Jakarta Sans', -apple-system, sans-serif;
  --ff-font-mono: 'JetBrains Mono', monospace;
}
```

### 1b. Google Fonts 추가 (index.html <head>에)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
```

### 1c. 애니메이션 (globals.css에서 가져옴)

```css
/* FAB pulse */
@keyframes fab-pulse {
  0%, 100% { box-shadow: 0 4px 16px rgba(255, 107, 107, 0.35); }
  50% { box-shadow: 0 4px 24px rgba(255, 107, 107, 0.55); }
}
.fab-emergency { animation: fab-pulse 3s ease-in-out infinite; }

/* Tag select pop */
@keyframes tag-pop {
  0% { transform: scale(1); }
  40% { transform: scale(0.95); }
  70% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
.animate-tag-pop { animation: tag-pop 200ms ease-out; }

/* Emoji float */
@keyframes emoji-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-emoji-float { animation: emoji-float 4s ease-in-out infinite; }

/* Breathing circle */
@keyframes breathe-circle {
  0%   { transform: scale(0.85); }
  25%  { transform: scale(1.0); }
  50%  { transform: scale(1.0); }
  75%  { transform: scale(0.85); }
  100% { transform: scale(0.85); }
}
.animate-breathe { animation: breathe-circle 16s ease-in-out infinite; }

/* Emergency glow */
@keyframes emergency-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(108, 92, 231, 0.15); }
  50% { box-shadow: 0 0 30px rgba(108, 92, 231, 0.25); }
}
.animate-emergency-glow { animation: emergency-glow 4s ease-in-out infinite; }

/* Sparkle entrance */
@keyframes sparkle-entrance {
  0%   { transform: scale(0); opacity: 0; }
  60%  { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-sparkle { animation: sparkle-entrance 500ms ease-out forwards; }

/* Reward bounce */
@keyframes reward-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-reward-bounce { animation: reward-bounce 2s ease-in-out infinite; }

/* Progress fill */
@keyframes progress-fill {
  from { width: 0%; }
  to { width: var(--progress-width, 65%); }
}
.animate-progress-fill { animation: progress-fill 800ms ease-out forwards; }

/* Checkbox bounce */
@keyframes check-bounce {
  0%   { transform: scale(1); }
  30%  { transform: scale(0.9); }
  60%  { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.animate-check-bounce { animation: check-bounce 200ms ease-out; }

/* Confetti drift */
@keyframes confetti-drift {
  0%   { transform: translateY(-10px) rotate(0deg); opacity: 0.3; }
  100% { transform: translateY(700px) rotate(45deg); opacity: 0; }
}
```

### 1d. 슬라이더 스타일 (globals.css에서 가져옴)

```css
input[type="range"].ff-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 9999px;
  outline: none;
  background: transparent;
}
input[type="range"].ff-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #FFFFFF;
  border: 3px solid var(--thumb-color, #8B5CF6);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  cursor: pointer;
  margin-top: -11px;
  transition: transform 150ms ease-out;
}
input[type="range"].ff-slider:active::-webkit-slider-thumb {
  transform: scale(1.1);
}
input[type="range"].ff-slider::-webkit-slider-runnable-track {
  height: 6px;
  border-radius: 9999px;
}
```

---

## STEP 2: HTML 변환 (화면별)

각 V0 컴포넌트(`.tsx`)를 해당 기존 `<main class="screen" id="screenXXX">` 안에 HTML로 변환합니다.

### 변환 매핑

| V0 컴포넌트 파일 | 기존 screen ID | 비고 |
|-----------------|---------------|------|
| `header.tsx` + `emotion-grid.tsx` + `daily-quests.tsx` + `emergency-button.tsx` | `screen1` | Home — 4개 합침 |
| `trigger-tags.tsx` | `screenTrigger` | |
| `intensity-slider.tsx` | `screen2` | |
| `strategy-selection.tsx` | `screen4` | |
| `breathing-activity.tsx` | `screenActivity` | |
| `re-measurement.tsx` | `screenRemeasure` | |
| `checkin-complete.tsx` | `screen5` | |
| `emergency-mode.tsx` | `screenEmergency` | |
| `crisis-resources.tsx` | `screenCrisis` | |
| `trophy-room.tsx` | `screenTrophies` | |
| `daily-routine.tsx` | `screenTracker` | |
| `journey-timeline.tsx` | `screenJourney` | |
| `guardian-dashboard.tsx` | `screenGuardian` | |
| `bottom-nav.tsx` | 각 탭 화면에 포함 | screen1, screenTracker, screenTrophies, screenJourney |

### 변환 규칙

**React → HTML 변환:**
```
// React (V0)
<button onClick={() => router.push("/triggers")} className="...">

// HTML (변환 결과) — 기존 onclick 바인딩 유지
<button onclick="selectEmotion('Happy', '😊', '#FFD93D')" class="...">
```

**Tailwind → CSS 변환:**
```
// Tailwind (V0)
className="flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[0.8rem] font-semibold text-[#6B7280]"

// CSS (변환 결과)
.ff-weather-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 9999px;
  padding: 5px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6B7280;
}
```

**Lucide 아이콘 → SVG 변환:**
V0에서 사용된 Lucide 아이콘을 인라인 SVG로 교체. 주요 아이콘:
- `Home` (bottom nav)
- `CheckCircle2` (bottom nav)
- `Trophy` (bottom nav)
- `CalendarDays` (bottom nav)
- `ArrowLeft` (back button)
- `ArrowRight` (next button)
- `ChevronRight` (quest card)
- `Settings/Gear` (guardian)
- `Phone`, `MessageCircle`, `Shield` (crisis)

각 아이콘을 https://lucide.dev에서 SVG 코드를 가져와 인라인으로 삽입:
```html
<!-- 예: ArrowLeft -->
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
</svg>
```

### 기존 onclick/id 보존 목록

**절대 변경하면 안 되는 바인딩들:**

```
screen1:
  onclick="selectEmotion('Happy', '😊', '#FFD93D')"   ← 6개 감정 버튼
  onclick="startEmergencyMode()"                        ← 🆘 FAB
  id="quickTaskList"                                    ← Daily Quest 컨테이너
  id="weatherIcon", id="headerTitle"                    ← 헤더 동적 요소

screenTrigger:
  id="triggerTagContainer"                              ← 태그 컨테이너 (app.js가 렌더링)
  onclick="submitTriggers()"                            ← Next 버튼
  onclick="skipTriggers()"                              ← Skip 버튼

screen2:
  id="intensitySlider", id="intensityDisplay"           ← 슬라이더
  id="selectedEmoji", id="selectedName"                 ← 감정 표시
  oninput="updateIntensity(this.value)"                 ← 슬라이더 이벤트
  onclick="goToResult()"                                ← Next 버튼

screen4:
  id="strategiesContainer"                              ← 전략 카드 컨테이너 (activities.js가 렌더링)
  id="resultSummaryBar"                                 ← 요약 바

screenActivity:
  id="inAppActionArea"                                  ← 활동 컨텐츠 (activities.js가 렌더링)
  id="activityTitle", id="activityIcon"                 ← 활동 헤더

screenRemeasure:
  id="remeasureSlider", id="remeasureDisplay"           ← 재측정 슬라이더
  id="remeasureOriginal"                                ← 원래 수치 표시
  id="remeasureFeedback"                                ← 피드백 텍스트
  onclick="finishCheckIn()"                             ← Finish 버튼

screen5:
  id="screen5XpDisplay"                                 ← XP 수치
  id="finalMessage"                                     ← 완료 메시지
  onclick="shareWithFamily()"                           ← 공유 버튼
  onclick="startOver()"                                 ← 완료 버튼

screenEmergency:
  id="emergencyActivityArea"                            ← 활동 컨텐츠
  onclick="retryEmergencyStrategy()"                    ← Try Another
  onclick="exitEmergencyMode()"                         ← I'm Okay

screenCrisis:
  id="lblCrisisGuardianName"                            ← Guardian 이름
  onclick="window.sendCrisisMessage()"                  ← 메시지 버튼

screenTrophies:
  id="activeGoalContainer", id="activeGoalBar"          ← 목표 진행
  id="goalQueueContainer"                               ← 대기열
  id="goalHistoryContainer"                             ← 완료 목록
  id="pendingGoalContainer"                             ← 보상 수령

screenTracker:
  id="routineTaskList"                                  ← 루틴 목록
  onclick="switchRoutine(type)"                         ← AM/PM 토글
  onclick="addCustomRoutine(text)"                      ← 추가 버튼

screenJourney:
  id="historyList"                                      ← 타임라인 컨테이너

screenGuardian:
  id="guardianChart"                                    ← Chart.js 차트
  id="aiInsightText"                                    ← AI 인사이트
  id="guardianRecentHistory"                            ← 최근 활동
  id="guardianAlert"                                    ← 알림 카드
  id="guardianGoalInput"                                ← 목표 입력
  onclick="Guardian.saveGoal()"                         ← 목표 저장
```

---

## STEP 3: Bottom Nav SVG (4개 탭 화면에 공통)

screen1, screenTracker, screenTrophies, screenJourney에 아래 Bottom Nav HTML을 포함:

```html
<nav class="ff-bottom-nav">
  <button class="ff-nav-tab active" onclick="UI.goToScreen('1')">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0.5">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
    <span>Home</span>
    <span class="ff-nav-dot"></span>
  </button>
  <button class="ff-nav-tab" onclick="UI.goToScreen('screenTracker')">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
    <span>Routine</span>
  </button>
  <button class="ff-nav-tab" onclick="UI.goToScreen('screenTrophies')">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
    </svg>
    <span>Trophies</span>
  </button>
  <button class="ff-nav-tab" onclick="UI.goToScreen('screenJourney')">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
      <path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>
      <path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>
    </svg>
    <span>Journey</span>
  </button>
</nav>
```

active 클래스는 각 화면에 맞게 다른 탭에 적용.

---

## STEP 4: 변환 실행 순서

1. `style_v2.css`에 STEP 1의 CSS 변수, 애니메이션, 슬라이더 스타일 추가
2. 각 V0 `.tsx` 파일을 읽고, Tailwind → CSS 클래스로 변환하여 `style_v2.css`에 추가
3. 각 V0 `.tsx` 파일의 JSX를 HTML로 변환하여 `index.html`의 해당 screen에 교체
4. 기존 onclick/id 바인딩 보존 확인
5. Lucide 아이콘 → 인라인 SVG 교체
6. `phone-frame.tsx`, `phone-frame-dark.tsx`, `phone-frame-safe.tsx`는 무시 (V0 프리뷰용)
7. `v0_design/components/ui/*.tsx`는 무시 (shadcn UI 라이브러리, 사용 안 함)

---

## STEP 5: 검증

변환 후 확인할 것:
- [ ] 모든 화면 전환이 동작하는가 (UI.goToScreen)
- [ ] 감정 선택 → 트리거 → 슬라이더 → 전략 → 활동 → 재측정 → 완료 플로우 동작
- [ ] 🆘 FAB → Emergency → Crisis 플로우 동작
- [ ] Guardian Dashboard 차트 렌더링 (Chart.js)
- [ ] Daily Routine 체크박스 동작
- [ ] Trophy 목표 표시 동작
- [ ] Bottom Nav 4탭 전환 동작
- [ ] 모바일 뷰포트(390px)에서 레이아웃 정상

---

## 중요 참고사항

- V0 코드는 **디자인 참조용**입니다. 로직을 그대로 가져오지 마세요.
- V0의 `useState`, `useRouter`, `useCallback` 등은 모두 무시. 기존 app.js의 전역 함수가 로직을 담당합니다.
- V0 코드에 하드코딩된 데이터(예: "Anxious", intensity 7)는 **동적 바인딩으로 교체**해야 합니다. 기존 코드의 `id`와 `app.js` 함수가 이를 담당합니다.
- Emergency Mode의 다크 배경(#161627)은 해당 screen에만 적용. 전역 배경에 영향 없어야 합니다.
