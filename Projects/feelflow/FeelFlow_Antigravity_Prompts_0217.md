# FeelFlow MVP — Antigravity 개발 프롬프트 가이드

## 현재 상태 분석 (As-Is)

### ✅ 이미 구현된 것
- 감정 선택 (6개: Happy, Sad, Anxious, Angry, Calm, Tired)
- Intensity 슬라이더 (1-10)
- 18개 전략 (activities_v2_9_5.js — Breathing, Grounding, Music, Gratitude, Drawing 등)
- XP 포인트 시스템 (FeelFlow 객체)
- Daily Routine 체크리스트 (morning/evening)
- Guardian 로그인/회원가입 (PIN 기반)
- Guardian 대시보드 (기본: 감정 차트 Today/Weekly/Monthly, 최근 기록, 격려 메시지)
- Journey/History 페이지 (기본 타임라인)
- Trophy 페이지 (기본 XP 표시 + Goal)
- API 연동 (AWS Lambda — save/fetch/AI insight)
- 날씨 표시

### ❌ PRD 대비 미구현 (MVP 필수)
1. **Trigger Mapping** — 체크인 플로우에 트리거 태그 선택 단계 없음
2. **Emergency Mode (🆘)** — Help Me Now 버튼 및 원탭 전략 실행 없음
3. **Crisis Resources** — 위기 자원 페이지 없음
4. **Post-Strategy Intensity Re-measurement** — 전략 완료 후 intensity 재측정 없음
5. **Trophy Goal Lifecycle** — Guardian이 목표 생성/수정/큐 관리 불가 (현재 단일 goal만)
6. **Guardian Encouragement Templates** — 현재 free-text prompt만, 진행도별 템플릿 없음
7. **Guardian Alert Escalation** — high intensity 표시는 있으나 3단계 에스컬레이션 없음
8. **Journey Creative Content** — journal text, photo, drawing이 Journey에 통합 표시 안 됨 (부분적)
9. **Emotion Dashboard 개선** — Daily/Weekly/2-Month 탭은 있으나 PRD 수준 차트 미달
10. **AI Insight 개선** — 기본 AI insight 있으나 패턴 분석/권고 수준 미달
11. **Daily Routine Guardian 관리** — 아이만 사용 중, Guardian CRUD 없음
12. **Child Custom Routine** — 아이가 자기 루틴 추가/삭제 불가
13. **Clinical Report Export** — PDF 리포트 생성 기능 없음

---

## 프롬프트 분할 전략

각 프롬프트는 **하나의 응집된 기능 단위**로 구성합니다. Antigravity가 한 번에 소화할 수 있는 최적 크기 (context window 고려, 코드 + 지시 합쳐 ~3000-4000 words)로 맞춥니다.

**총 8단계** — 의존성 순서대로 진행합니다.

---

## PROMPT 1: Trigger Mapping + Re-measurement (체크인 플로우 확장)

```
You are building FeelFlow, an emotion regulation app for ASD teenagers.

CURRENT STATE:
- Check-in flow: Emotion Selection → Intensity Slider → Strategy Cards → Activity → Completion
- Files: app.js (selectEmotion, updateIntensity, goToResult, finishCheckIn functions), index.html (screen1 through screen5)

TASK: Add two new steps to the check-in flow:

### 1. TRIGGER TAG SCREEN (between Emotion Selection and Intensity)
- New screen "screenTrigger" in index.html
- After user selects emotion in screen1, go to screenTrigger instead of screen2
- Display header: "What caused this feeling?" with the selected emotion emoji
- Show tappable pill/chip buttons for these triggers:
  🏫 School | 👫 Friends | 👨‍👩‍👦 Family | 🔊 Noise | 🔄 Change in Routine | 😴 Tired | 🍽️ Hungry | ⚡ Sensory Overload | ❓ Don't Know | ✏️ Other (shows text input, max 30 chars)
- Multiple selection allowed (chips toggle on/off with visual highlight)
- Prominent "Skip" button at bottom → goes to screen2 (intensity)
- "Next →" button → goes to screen2 (intensity)
- Store selected triggers in currentEmotion.triggers = [] array

### 2. RE-MEASUREMENT SCREEN (between Activity completion and screen5)
- New screen "screenRemeasure" in index.html
- After strategy activity completes, go to screenRemeasure instead of screen5
- Show: emotion emoji, "How do you feel now?" text, same 1-10 slider
- Display BEFORE intensity (stored from screen2) as reference
- "Done" button → calculates delta (before - after), stores as currentEmotion.afterIntensity
- Then goes to screen5 (completion) which now shows: "Before: 8 → After: 5 (↓3 improved!)"

### 3. UPDATE finishCheckIn()
- Include triggers[] and afterIntensity in the saved check-in object
- The check-in entry sent to API should now include: { emotion, emoji, intensity, afterIntensity, triggers, timestamp, ... }

STYLE: Match existing app style (dark cards, rounded corners, purple/blue accent colors). Use existing CSS classes where possible.

DO NOT modify activities_v2_9_5.js or the strategy screens. Only modify app.js, index.html, and add minimal CSS to style_v2.css.
```

---

## PROMPT 2: Emergency Mode (🆘 Help Me Now)

```
You are building FeelFlow, an emotion regulation app for ASD teenagers.

CURRENT STATE:
- App has 6 emotions, 18 strategies in activities_v2_9_5.js
- Activities module has: Activities.startBreathing(), Activities.startGrounding(), Activities.startSqueeze(), etc.
- Check-in history stored in localStorage key 'feelflow_history'
- XP system: FeelFlow.addXP(amount, reason)

TASK: Build Emergency Mode — a one-tap crisis calming feature.

### 1. EMERGENCY BUTTON ON HOME SCREEN (screen1)
- Add a large red/orange "🆘 Help Me Now" button at the BOTTOM of screen1 (below emotion grid)
- Style: full-width, prominent, ~60px height, rounded, pulsing subtle glow animation
- Also add a Floating Action Button (FAB) visible on ALL screens (bottom-right corner, 56px circle, 🆘 icon)
- FAB is hidden on screenLanding, screenLogin, screenSignup
- Single tap → enters Emergency Mode (no confirmation dialog)

### 2. EMERGENCY MODE SCREEN (screenEmergency)
- New screen in index.html
- UI: Dark background (#1a1a2e), single centered content area
- On entry, auto-select best strategy:
  - Read history from localStorage, find strategy with highest average intensity reduction
  - Eligible strategies ONLY: 'Breathing', 'Grounding', 'Squeeze', 'Cold', 'Mindful'
  - Fallback (no data or new user): 'Breathing' (Box 4-4-4-4)
- Immediately launch the selected strategy's guided activity within the emergency screen
  - Reuse activity logic from Activities module but render in simplified dark UI
  - Show ONLY: animation/instruction + timer. No nav bar, no header decorations
- Two buttons at bottom: "✓ Done" and "↻ Try Another"
- "Try Another" → picks next best strategy from eligible list and relaunches
- Optional: Guardian comfort message displayed at top if set (read from localStorage key 'emergency_comfort_message')

### 3. EXIT FLOW
- "Done" → transition screen: "You did great. Take a moment. 💙" (3 seconds, dark bg, large text)
- Then → simplified post-check-in: show emotion selector (6 buttons, compact) + intensity slider + "Save" button
- Save creates a check-in entry with tag: emergency: true
- Then → return to screen1 (home)

### 4. GUARDIAN NOTIFICATION
- When Emergency Mode activates, push entry to localStorage 'feelflow_alerts' array:
  { type: 'emergency', level: 'concern', timestamp, strategyUsed }
- Guardian dashboard (Guardian.renderRecentHistory) should check this array and show 🆘 entries with orange/red highlight

### 5. CHILD CUSTOMIZATION
- In a future settings screen (not now), child can pick emergency background color
- For now, hardcode dark blue (#1a1a2e)

Add new CSS in style_v2.css for emergency mode styling. Add screen HTML in index.html. Add logic in app.js.
DO NOT modify activities_v2_9_5.js core logic — call its existing functions.
```

---

## PROMPT 3: Crisis Resources Page

```
You are building FeelFlow, an emotion regulation app for ASD teenagers.

TASK: Add a Crisis Resources page — always-accessible safety information.

### 1. CRISIS RESOURCES SCREEN (screenCrisis)
- New screen in index.html
- Accessible from: 
  a) Hamburger menu (add "🆘 Get Help" menu item for BOTH child and guardian menus)
  b) Emergency Mode completion screen (subtle "Need more help?" link)
  c) Auto-prompt: when finishCheckIn detects intensity 9-10 on Sad or Anxious, show a gentle card AFTER screen5:
     "If you're going through a really hard time, there are people who can help. 💙"
     Two buttons: "See resources →" (goes to screenCrisis) | "I'm okay" (dismiss)
     This prompt appears MAX ONCE PER DAY (track in localStorage 'crisis_prompt_date')

### 2. SCREEN CONTENT
- Clean, calm design. Light blue/white background. Large tappable elements.
- Three main resource cards:

  CARD 1: "📞 988 Suicide & Crisis Lifeline"
  - "Call or text 988"
  - Subtitle: "Free, confidential, 24/7. Someone will listen."
  - "What happens when I call?" expandable: "A real person answers. You tell them how you feel. They help you figure out what to do. You can hang up anytime."
  - Large tappable button: tel:988

  CARD 2: "💬 Crisis Text Line"
  - "Text HOME to 741741"
  - Subtitle: "If you'd rather text than talk."
  - "What happens?" expandable: "You'll text with a real person. Type as much or as little as you want."
  - Large tappable button: sms:741741

  CARD 3: "🏠 Talk to [Guardian Name]"
  - Read guardian name from localStorage 'guardian_profile'
  - Button: sends a pre-written message to guardian via the existing Guardian.sendMessage() system:
    "[Child] is having a hard time and could use your support right now."
  - Show clearly: "This will send a message to [Name]. Tap to send."

### 3. PRIVACY RULES (CRITICAL)
- Whether the child views screenCrisis is NEVER logged to history or alerts
- Whether the child taps call/text buttons is NEVER logged
- ONLY the "Talk to Guardian" action creates a visible record (because it explicitly sends a message)

### 4. ASD-SPECIFIC DESIGN
- Simple, direct language. No metaphors
- Phone numbers and text codes as LARGE buttons (min 48px tap target)
- Each resource card has a "What will happen?" expandable section to reduce unknown-situation anxiety

Add screen to index.html, CSS to style_v2.css, logic to app.js. 
Add menu items to the existing toggleMenu() function in app.js.
```

---

## PROMPT 4: Trophy System Overhaul (Guardian Goal Management)

```
You are building FeelFlow, an emotion regulation app for ASD teenagers.

CURRENT STATE:
- Trophy page (screenTrophies) shows XP progress bar and single goal
- FeelFlow object has: xp, goal, level, xpHistory
- Guardian can set goal amount and reward text (editGoalMessage function)
- Points earned via FeelFlow.addXP()

TASK: Overhaul Trophy into a full goal lifecycle system.

### 1. DATA STRUCTURE
Replace single goal with queue system in localStorage 'feelflow_goals':
{
  active: { id, name, targetXP, earnedXP, reward, emoji, status: 'active', createdAt },
  queue: [ { id, name, targetXP, reward, emoji, status: 'queued' }, ... ],  // max 10
  completed: [ { id, name, targetXP, reward, emoji, completedAt, daysToComplete }, ... ]
}

### 2. CHILD TROPHY SCREEN (screenTrophies) — REDESIGN
- Top: Current goal card showing: emoji + goal name, progress bar (earnedXP / targetXP), reward preview, days active
- Middle: "Coming Up Next" — shows next 1-2 queued goals (name + reward icon only, for motivation)
- Bottom: "🏆 Completed Goals" — scrollable list with trophy icons (🥉 first, 🥈 second, 🥇 third, 🏆 after)
- Each completed goal shows: name, reward, date completed, XP earned

### 3. GOAL COMPLETION CELEBRATION
When earnedXP >= targetXP:
- Full-screen celebration overlay: confetti CSS animation (3 seconds)
- "🏆 GOAL ACHIEVED!" large text
- Show reward: "[emoji] [reward text]!"  
- "🎉 Celebrate!" button → extra confetti burst
- After dismiss → auto-activate next goal from queue (reset earnedXP to 0)
- If queue empty: "You completed all goals! Ask [Guardian] to set a new adventure 🌈"
- Move completed goal to completed[] array

### 4. GUARDIAN GOAL MANAGEMENT (screenGuardianSettings or new section in screenGuardian)
Add "Goal Management" section to Guardian dashboard:
- "➕ Create Goal" button → form: Goal Name (text), XP Target (number input, 50-1000), Reward (text), Emoji (picker: 🍕🎮🎬🍦🎁🏆⭐🎵📱🛍️🎪🌟)
- Show active goal with progress
- Show queued goals as reorderable list (move up/down buttons)
- Edit queued goals (tap to edit name/target/reward)
- Delete queued goals (with confirmation)
- Active goal: only reward text editable if earnedXP > 0

### 5. POINT EARNING — UPDATE FeelFlow.addXP()
- When XP is added, also add to active goal's earnedXP
- Check if goal completed after each XP add
- If completed, trigger celebration sequence

### 6. TEMPLATE GOALS (optional starter)
On first Guardian setup, suggest 3 starter templates:
- "First Steps" — 100 XP, emoji: ⭐
- "Feeling Detective" — 200 XP, emoji: 🔍  
- "Streak Builder" — 300 XP, emoji: 🔥
Guardian picks one and sets their own reward text.

Update: app.js (FeelFlow object, renderTrophies, Guardian), index.html (screenTrophies redesign, Guardian goal section), style_v2.css (celebration animation, goal cards).
```

---

## PROMPT 5: Guardian Dashboard Charts + AI Insight Enhancement

```
You are building FeelFlow, an emotion regulation app for ASD teenagers.

CURRENT STATE:
- Guardian dashboard has Chart.js charts with Today/Weekly/Monthly tabs
- Guardian.renderWeather(type) renders line chart (today), bar chart (weekly/monthly)
- AI insight exists via EmotionAPI.getAIInsight()
- Check-in data now includes: triggers[], afterIntensity (from Prompt 1)

TASK: Enhance Guardian Dashboard analytics and AI insights.

### 1. DASHBOARD CHART IMPROVEMENTS

**Today View** (keep existing but enhance):
- Show before→after pairs: connect dots with arrows showing intensity change
- Color-code dots by emotion (existing emotionColors)
- Show trigger tags as small labels below each dot

**Weekly View** (enhance existing):
- Keep bar chart but add: week-over-week comparison indicators
- Below chart, add 3 comparison cards:
  "Check-ins: 12 (↑3 from last week)" | "Avg Intensity: 5.2 (↓0.8)" | "Strategies completed: 8 (↑2)"
  Green arrow = improvement, Red = decline, Gray = same

**2-Month View** (NEW — add as 4th tab):
- Line chart: 8-week rolling average intensity
- Filter toggles: "All" + each emotion name (tap to show/hide that emotion's line)
- Below chart: "Independence indicators" summary card:
  Self-initiation rate, Strategy completion rate, Avg intensity reduction

### 2. TRIGGER ANALYSIS SECTION
- New section below chart: "🎯 Top Triggers This Week"
- Read triggers from history, count frequency
- Display as horizontal bar chart or ranked list:
  "🏫 School — 8 times (42%)"
  "🔄 Change in Routine — 4 times (21%)"
  "⚡ Sensory Overload — 3 times (16%)"

### 3. AI INSIGHT ENHANCEMENT
- Replace current basic insight with structured weekly insight card
- Card shows at top of Guardian dashboard
- Content generated from LOCAL data analysis (no API needed for MVP):
  - Pattern: "Jason's anxiety peaks on weekday mornings (Mon-Fri, 7-9 AM)"
  - Strategy: "Deep Breathing reduced intensity by avg 3.2 points this week"
  - Trigger: "62% of anxious check-ins were triggered by 'School'"
  - Trend: "Average intensity is trending down for 2 consecutive weeks ✅"
- Logic: Write a generateLocalInsight(history) function that analyzes the data and produces these 4 insight sentences
- Show "Last updated: [date]" at bottom of card

### 4. ALERT ESCALATION DISPLAY
- In Guardian.renderRecentHistory(), add alert level badges:
  🟡 Notice: single high-intensity (8+)
  🟠 Concern: 3+ high-intensity in current week, or Emergency Mode used
  🔴 Alert: 3+ high-intensity in 24 hours, or intensity 10 on Sad/Anxious
- Show alert banner at top of dashboard if any 🟠 or 🔴 active:
  "🟠 2 concern-level events this week. Consider discussing with care team."
- Alert data read from check-in history + 'feelflow_alerts' localStorage

Update: app.js (Guardian object methods), index.html (Guardian screen sections), style_v2.css.
DO NOT modify api.js or activities_v2_9_5.js.
```

---

## PROMPT 6: Daily Routine — Guardian CRUD + Child Custom

```
You are building FeelFlow, an emotion regulation app for ASD teenagers.

CURRENT STATE:
- DailyRoutines object in app.js has morning[] and evening[] arrays
- Each item: { id, text, completed }
- renderHomeQuests() shows routines on home screen
- renderRoutineScreen() shows full routine screen
- handleRoutineCheck() toggles completion and awards XP

TASK: Add Guardian and Child routine management.

### 1. DATA STRUCTURE UPDATE
Change DailyRoutines structure to support ownership:
Each item now: { id, text, completed, owner: 'default'|'guardian'|'child', points: 10, timeSlot: 'morning'|'evening', repeat: 'daily'|'weekdays'|'weekends' }
- Default items keep owner: 'default'
- Max 15 total items

### 2. GUARDIAN ROUTINE MANAGEMENT
In Guardian dashboard or GuardianSettings screen, add "📋 Manage Routines" section:
- List all routines grouped by morning/evening
- Each item shows: text, owner badge (🔒 guardian, ⭐ child, — default), points
- Guardian can:
  a) ADD custom routine: text input (40 chars), time slot dropdown, points (0-30), icon picker (8 preset emojis)
  b) EDIT default/guardian items: change text, time slot, points
  c) DELETE default/guardian items (with confirm). CANNOT delete Morning Check-in (id: m1)
  d) CANNOT edit or delete child-created items (show them grayed with ⭐ badge)
- Guardian-created items get owner: 'guardian'

### 3. CHILD ROUTINE MANAGEMENT
On the existing routine screen (screenTracker), add:
- "➕ Add My Routine" button at bottom
- Tap → shows inline form: text input + time slot selector + icon picker
- Points fixed at 5 (child cannot change)
- Created items get owner: 'child', display ⭐ icon
- Child can DELETE own items (⭐ items only) with swipe-to-delete or trash icon
- Child CANNOT delete 🔒 (guardian) or default items

### 4. VISUAL INDICATORS ON ROUTINE SCREEN
- 🔒 icon next to guardian-created items (child view)
- ⭐ icon next to child-created items
- No icon for default items
- Points shown: "+10 XP" badge next to each item

### 5. ROUTINE ↔ TROPHY INTEGRATION
- Perfect Day bonus: if ALL items completed → +10 bonus XP (call FeelFlow.addXP)
- Show at bottom of routine screen: "Today: 4/7 completed · 35/55 XP earned"
- 3 consecutive Perfect Days → +20 bonus XP

### 6. NOTIFICATION TONE
- Existing renderHomeQuests() should respect new data structure
- Uncompleted past-time items: show grayed but still tappable (never hide)
- End of day: celebrate completions, never guilt about misses

Update: app.js (DailyRoutines, renderRoutineScreen, renderHomeQuests, Guardian), index.html (routine sections), style_v2.css.
```

---

## PROMPT 7: Journey Page Enhancement (Creative Content + Filters)

```
You are building FeelFlow, an emotion regulation app for ASD teenagers.

CURRENT STATE:
- Journey page (screenJourney) shows basic timeline via UI.renderHistory()
- History entries have: emotion, emoji, intensity, timestamp, photo (optional), note (optional), activityData (optional)
- Now also have: triggers[], afterIntensity, emergency flag (from Prompts 1-2)

TASK: Enhance Journey into a rich personal history with creative content and filtering.

### 1. EXPANDED TIMELINE CARDS
Each history card now shows (update UI.renderHistory in ui.js):
- Date/time header
- Emotion emoji + name + trigger tags (as small colored pills)
- Intensity: "Before: 8 → After: 5 (↓3 improved)" with green/red coloring
- Strategy used (icon + name)
- XP earned badge
- Creative content section (if any):
  - Journal text (full text displayed)
  - Photo thumbnail (tap to view full screen)
  - Drawing snapshot (if drawing activity data exists)
  - Gratitude entries (person/thing/place mini card)
  - Grounding summary (5-4-3-2-1 entries)
- 🆘 Emergency badge (if emergency: true)
- 📋 Daily Routine badge (if fromRoutine: true)
- Delete button (🗑️) on each card → confirm → remove from localStorage history

### 2. WEEKLY SUMMARY CARD
At the top of Journey, show a summary card:
- "This Week" header
- Check-ins count
- Most frequent emotion (emoji + count)
- Best strategy (highest avg intensity reduction, show name)
- Current streak days
- Mini bar chart: 6 emotion bars showing count distribution (use simple CSS bars, no Chart.js needed)

### 3. FILTER & SEARCH
Below summary, above timeline, add filter row:
- Emotion filter: 6 small emoji buttons (tap to toggle filter — show only that emotion)
- "All" button to reset
- Trigger filter: dropdown or pill row showing top triggers, tap to filter
- When filtered: "Showing: 😠 Angry · 🏫 School" label, with "✕ Clear" button

### 4. "WHAT WORKS FOR ME" SECTION
Below summary card, collapsible section:
- For each emotion with ≥3 strategy completions, show:
  "When you feel 😠 Angry → 🎨 Angry Drawing works best (avg ↓3.2)"
- If insufficient data: "Keep checking in! After a few more times, I'll show what works best 📊"

### 5. GUARDIAN VIEW DIFFERENTIATION
When currentUser === 'guardian' and viewing ChildHistory:
- Hide all creative content (journal text, photos, drawings)
- Instead show engagement indicators: "📝 Journal written", "📸 Photo captured", "🎨 Drawing created"
- Everything else (emotion, intensity, triggers, strategy, timestamps) visible

Update: ui.js (renderHistory overhaul), app.js (Journey navigation, filter state), index.html (screenJourney structure), style_v2.css.
```

---

## PROMPT 8: Clinical Report + Guardian Context Tags

```
You are building FeelFlow, an emotion regulation app for ASD teenagers.

CURRENT STATE:
- Guardian dashboard has charts, recent history, AI insight, alerts
- Check-in data includes: emotion, intensity, afterIntensity, triggers, timestamp, strategy, emergency flag

TASK: Add Clinical Report generation and Context Tags for Guardian.

### 1. CONTEXT TAGS (Guardian)
In Guardian dashboard, add "📌 Add Context" button:
- Tap → shows date picker (default: today) + tag selector:
  Preset tags: 🏥 Doctor Visit | 💊 Medication Change | 🏫 School Event | 👨‍👩‍👦 Family Event | 😴 Sleep Issue | 🤒 Sick Day | 🔄 Routine Change | 📝 IEP Meeting
  + Custom text input (30 chars)
- Save to localStorage 'feelflow_context_tags': [{ date, tag, icon, custom, timestamp }]
- Tags display as markers on Guardian chart timeline
- Tags display in clinical reports

### 2. WEEKLY SUMMARY REPORT (Auto)
- Add "📊 View Report" button in Guardian dashboard
- Generates a summary card (on-screen, not PDF for MVP):
  - Period: This week (Mon-Sun)
  - Total check-ins
  - Emotion distribution (simple text: "Happy 30%, Sad 20%, Anxious 25%, ...")
  - Average intensity (before and after)
  - Top 3 triggers
  - Strategies used with effectiveness ranking
  - Context tags this week
  - Alert events this week
  - Independence indicators: self-initiation rate, completion rate

### 3. MONTHLY REPORT (Manual)
- Add "📋 Generate Monthly Report" button
- Similar to weekly but for full month
- Additional section: "Guardian Notes" — text area where guardian can type observations (saved to localStorage 'feelflow_guardian_notes')
- "📤 Share" button → uses Web Share API (navigator.share) to share as text summary
  - Format as clean text: "FeelFlow Monthly Report — [Child Name] — [Month Year]" followed by all sections as text
  - If Web Share API not available: copy to clipboard with "Copied!" toast

### 4. INDEPENDENCE SCORE
Calculate and display in report:
- Self-initiation: check-ins not from routine / total check-ins (percentage)
- Strategy completion: completed strategies / started strategies
- Avg intensity reduction: mean of (intensity - afterIntensity) across all check-ins
- Emotion vocabulary: count of unique emotions used / 6
- Streak consistency: days with check-ins / 30
- Combined 0-100 score (simple weighted average)
- Display with milestone label: <50 "🌱 Building", 50-70 "🌿 Growing", 70-85 "🌳 Strong", 85+ "🌟 Independent"

### 5. REPORT DISCLAIMER
All reports include at bottom:
"This report was generated by FeelFlow. Data is self-reported and should be interpreted in clinical context. Not a clinical assessment."

Update: app.js (Guardian object — new methods), index.html (report display sections), style_v2.css.
DO NOT create PDF generation — text/HTML display and Web Share API only for MVP.
```

---

## 실행 순서 요약

| 단계 | 프롬프트 | 핵심 기능 | 의존성 | 예상 난이도 |
|------|---------|----------|--------|------------|
| 1 | Trigger + Re-measure | 체크인 플로우 확장 | 없음 (독립) | ⭐⭐ |
| 2 | Emergency Mode | 🆘 원탭 위기 대응 | Activities 모듈 참조 | ⭐⭐⭐ |
| 3 | Crisis Resources | 안전 자원 페이지 | Prompt 2 (링크 연결) | ⭐ |
| 4 | Trophy Overhaul | 목표 큐 + 축하 | FeelFlow.addXP 수정 | ⭐⭐⭐ |
| 5 | Dashboard + AI | 차트 강화 + 인사이트 | Prompt 1 (trigger data) | ⭐⭐⭐ |
| 6 | Routine CRUD | Guardian/Child 루틴 관리 | Prompt 4 (XP 연동) | ⭐⭐ |
| 7 | Journey Enhancement | 크리에이티브 콘텐츠 + 필터 | Prompt 1,2 (확장 데이터) | ⭐⭐⭐ |
| 8 | Clinical Report | 리포트 생성 + 컨텍스트 태그 | Prompt 5 (차트 데이터), 전체 | ⭐⭐⭐ |

---

## 각 프롬프트에 첨부할 파일

| 프롬프트 | 필수 첨부 파일 |
|---------|-------------|
| 1 | app.js, index.html, style_v2.css |
| 2 | app.js, activities_v2_9_5.js (참조용), index.html, style_v2.css |
| 3 | app.js, index.html, style_v2.css |
| 4 | app.js, index.html, style_v2.css |
| 5 | app.js, index.html, style_v2.css |
| 6 | app.js, index.html, style_v2.css |
| 7 | ui.js, app.js, index.html, style_v2.css |
| 8 | app.js, index.html, style_v2.css |

**중요:** 각 단계 완료 후 업데이트된 파일을 다음 프롬프트에 첨부해야 합니다. Antigravity가 이전 변경사항을 알 수 있게.

---

## 팁: Antigravity에게 줄 때

1. 각 프롬프트 상단에 "CURRENT STATE" 섹션을 이전 단계 결과로 업데이트
2. 한 번에 하나의 프롬프트만 실행 → 결과 확인 → 다음 진행
3. 문제 발생 시 해당 프롬프트만 재실행 (다른 프롬프트에 영향 없음)
4. 각 프롬프트에 "DO NOT modify [파일]" 지시를 포함하여 의도치 않은 변경 방지
