# FeelFlow — Complete Product Requirements Document

**Product:** FeelFlow — Autism Transition Skills App
**Target Users:** ASD Teenagers (Ages 13–18)
**Version:** 1.0 (MVP)
**Date:** February 2026
**Author:** Joo & Jason

---

## 1. Overview

FeelFlow is an emotion regulation app designed specifically for teenagers on the autism spectrum (ASD Level 1, ages 13–18). The app guides users through a structured emotion check-in process: identifying their current emotion, measuring its intensity, and receiving personalized, evidence-based coping strategies.

This PRD defines the complete feature set including: 18 coping strategies across 6 emotion categories, Trophy gamification system, Journey emotion history, Emotion Dashboard with AI Insights, Daily Routine system, Emergency Mode, Trigger Mapping, and Crisis Resources.

### 1.1 Design Philosophy

Every feature in FeelFlow is built on three pillars tailored to the ASD cognitive and sensory profile:

1. **Sensory-First Regulation:** Strategies prioritize body-based and sensory approaches over purely cognitive ones, recognizing that cognitive strategies are less accessible during emotional dysregulation.

2. **Predictability & Structure:** Every interaction follows a predictable pattern with numbered steps, visible timers, and consistent navigation. No surprises, no ambiguity.

3. **Autonomy & Zero Pressure:** Nothing is mandatory. Every screen has a skip option. Social features are opt-in only. The app never judges, scores, or compares.

### 1.2 Guardian's Two Core Roles

**Role 1: Encourager** — Motivate the child to consistently practice emotion regulation through goal-setting, rewards, and encouragement messages. Ultimate goal: the child can regulate emotions independently without the app.

**Role 2: Clinical Data Partner** — Collect and monitor the child's emotional patterns and behavioral data long-term. Detect early warning signs. Generate clinical-grade reports for doctors, therapists, and school counselors. Replace subjective "they've been struggling lately" with objective data-driven conversations.

---

## 2. User Flow Summary

The core check-in flow follows a consistent 6-step linear progression. Users always know where they are and what comes next.

| Step | Screen | User Action | App Response |
|------|--------|-------------|--------------|
| 1 | Emotion Selection | Tap one of 6 emotion buttons (Happy, Sad, Anxious, Angry, Calm, Tired) | Highlight selected emotion with color-coded border. Transition to Step 2 |
| 2 | Trigger Tag (Optional) | Select what caused this feeling: School, Friends, Family, Noise, Change in Routine, Tired, Hungry, Sensory Overload, Don't Know, Other | Store trigger tag with check-in. Skip button available |
| 3 | Intensity Thermometer | Drag slider from 1 (low) to 10 (high) to rate emotion intensity | Real-time thermometer fill animation. Store baseline intensity value |
| 4 | Strategy Cards | View 3 strategy cards. Tap any card to open guided activity | Display 3 strategies specific to selected emotion. Cards show icon, title, and one-line description |
| 5 | Guided Activity | Follow step-by-step instructions within the chosen strategy | Timer, animations, prompts per strategy specification (see Section 3) |
| 6 | Re-measurement | Rate emotion intensity again on same 1–10 scale | Show before/after comparison with visual delta. Store post-strategy intensity |
| 7 | Completion | View summary and optionally try another strategy or finish | Encouragement message. Save check-in to history. Update streak counter |

---

## 3. Emotion Strategy Matrix

### 3.1 😊 Happy — "Extend the Good Feeling"

**Strategy 1: 📝 Happy Journal**
- **App Behavior:** Text input field with sentence starter prompt ("I feel happy because...") + emoji stamp selector (6 preset emojis) + Save button that stores entry in "Memory Bank" for future review
- **ASD Design Rationale:** Structured Expression — Provides sentence scaffolding instead of blank screen to reduce expressive demand

**Strategy 2: 📸 Capture the Moment**
- **App Behavior:** Camera launch button + auto-tag photo with current emotion label and timestamp + Save to chronological "Happy Moments" gallery organized by date and emotion
- **ASD Design Rationale:** Visual Documentation — Connects abstract emotions to concrete images, building a personal coping resource library

**Strategy 3: 🔄 Body Scan**
- **App Behavior:** Display human silhouette outline. User taps body areas where happiness is felt (chest, face, stomach). Tapped areas glow with warm animation. App suggests descriptive labels (e.g., "Warm chest", "Light head", "Relaxed shoulders")
- **ASD Design Rationale:** Interoception Training — Builds emotion-body connection awareness, a core deficit area in ASD. Replaces social-demand strategy with self-directed sensory exploration

### 3.2 😢 Sad — "Find Comfort"

**Strategy 1: 🧸 Comfort Object**
- **App Behavior:** 5-step guided sequence with 60-second timer: (1) Find something soft → (2) Hold it close → (3) Notice texture and temperature → (4) Take 3 deep breaths → (5) Stay as long as needed. Optional haptic vibration feedback on each step transition
- **ASD Design Rationale:** Sensory Anchoring — Tactile stimulation activates parasympathetic nervous system for calming

**Strategy 2: 🎵 Listen to Music**
- **App Behavior:** Built-in sound library with 4 categories: Nature Sounds, Lo-fi Beats, White Noise, Classical. Volume slider with visual level indicator. Timer options: 3, 5, or 10 minutes. "My Calm Playlist" favorites feature. No sudden volume changes
- **ASD Design Rationale:** Predictable Sensory Input — Consistent auditory stimulation without unexpected changes that could cause sensory overload

**Strategy 3: 💬 Talk to Someone**
- **App Behavior:** 3 pre-written script cards displayed as tappable options: "I feel sad because ___", "Can you just listen?", "I need a hug". Tap to select → Copy/Share button. Pre-configured trusted contacts list (set in Settings) for quick sharing
- **ASD Design Rationale:** Social Scaffolding — Provides ready-made scripts for social-communication situations that are challenging for ASD individuals. Removes cognitive load of formulating emotional expressions

### 3.3 😰 Anxious — "Ground Yourself"

**Strategy 1: 🫁 Deep Breathing**
- **App Behavior:** Expanding/contracting circle animation synchronized to breath pattern. Two pattern options: Box Breathing (4-4-4-4) and 4-7-8 Calm. Numerical countdown overlay on circle. Progress bar showing rounds completed (default: 5 rounds). Post-exercise body check: "How does your body feel now?" with intensity re-measurement
- **ASD Design Rationale:** Visual Pacing — Transforms abstract "breathe slowly" instruction into concrete visual guide. Circle animation provides predictable, rhythmic sensory input

**Strategy 2: 5️⃣ 5-4-3-2-1 Grounding**
- **App Behavior:** Sequential screen transitions through 5 stages: 5 things you SEE (with text input for each) → 4 things you HEAR → 3 things you TOUCH → 2 things you SMELL → 1 thing you TASTE. Each stage has its own screen with clear numbering. Completion generates summary card showing all entries
- **ASD Design Rationale:** External Sensory Reconnection — Redirects attention from internal anxiety to present environment through structured sensory engagement

**Strategy 3: 🧊 Hold Something Cold**
- **App Behavior:** 60-second countdown timer with 4-step guided sequence: (1) Find ice or cold water → (2) Hold in your hands → (3) Focus on the cold sensation → (4) Notice your body changing. Completion triggers intensity re-measurement to show change
- **ASD Design Rationale:** Dive Reflex Activation — Cold stimulus activates mammalian diving reflex, directly stimulating vagus nerve to lower heart rate. Provides immediate physiological intervention

### 3.4 😠 Angry — "Release the Energy"

**Strategy 1: 🚶 Take a Walk**
- **App Behavior:** 5-minute countdown timer with step counter (accelerometer-based). Sequential mindfulness prompts at intervals: 1:00 "Feel your feet on the ground" → 2:30 "What do you see around you?" → 4:00 "Is your body loosening up?" Completion screen with step count and intensity re-measurement
- **ASD Design Rationale:** Motor Energy Discharge — Converts anger's physiological arousal into purposeful movement. Timed prompts prevent rumination during walk

**Strategy 2: ✊ Squeeze & Release**
- **App Behavior:** 3-round guided animation: Fist emoji (✊) displays for 5 seconds ("SQUEEZE") → Open hand emoji (✋) displays for 5 seconds ("RELEASE") → Repeat. Haptic vibration pulse during squeeze phase. Visual tension meter decreases with each round
- **ASD Design Rationale:** Progressive Muscle Relaxation (PMR) — Tension-release contrast teaches the body to recognize and achieve relaxation state. Simple enough for anger state when cognitive capacity is reduced

**Strategy 3: 🎨 Angry Drawing**
- **App Behavior:** Full-screen blank canvas with 3 color options only (red, black, orange). Finger drawing enabled with thick brush stroke. Shake device to erase (with satisfying animation). "Feeling better?" check after 60 seconds. Drawing snapshot is saved to Journey before canvas clears. Child can delete individual drawings from Journey at any time
- **ASD Design Rationale:** Non-verbal Expression — Drawing provides physical outlet without language demands. No-save-to-gallery design removes performance anxiety during the activity, while Journey snapshot preserves the record for pattern tracking

### 3.5 😌 Calm — "Savor the Peace"

**Strategy 1: 🧘 Mindful Moment**
- **App Behavior:** 60-second guided sequence with 5 text cards transitioning every 12 seconds: (1) Close your eyes → (2) Notice your body → (3) Feel the calm in your chest → (4) Smile gently → (5) Enjoy this moment. Soft chime sound at completion. Minimal visual design — dark background, white text only
- **ASD Design Rationale:** Structured Mindfulness — Replaces vague "be mindful" with concrete, timed, sequential steps. Dark UI reduces visual stimulation during calm state

**Strategy 2: 💭 Gratitude**
- **App Behavior:** 3-field input form: (1) A person I'm grateful for → (2) A thing I'm grateful for → (3) A place I'm grateful for. Each field has emoji selector. Save adds a flower to "Gratitude Garden" — visual garden grows with each entry over time
- **ASD Design Rationale:** Positive Reinforcement Visualization — Gamifies gratitude practice with growing garden metaphor. Concrete categories (person/thing/place) reduce the overwhelm of open-ended gratitude prompts

**Strategy 3: 📷 Calm Catalog**
- **App Behavior:** Camera launch with prompt: "Take a photo of something peaceful right now." Auto-tags with "😌 Calm" label and timestamp. Saves to "My Calm Collection" album. This collection becomes accessible from the Anxious and Sad strategy screens as a coping resource
- **ASD Design Rationale:** Sensory Resource Library — Builds a personalized calm-stimulus library during good moments that can be accessed as a regulation tool during difficult moments

### 3.6 😫 Tired — "Recharge"

**Strategy 1: 💧 Drink Water**
- **App Behavior:** Glass-filling animation: tap to fill 25% per tap (4 taps = full glass). Celebratory animation on completion. Daily water counter: "You've had N glasses today." Optional reminder notification setup
- **ASD Design Rationale:** Visual Reward for Simple Action — Transforms mundane hydration into interactive micro-achievement. Immediate visual feedback motivates completion

**Strategy 2: 🌬️ Fresh Air**
- **App Behavior:** 2-minute timer with 5-step guided sequence: (1) Open window or go outside → (2) Breathe the fresh air deeply → (3) Feel the temperature on your skin → (4) Listen to outdoor sounds → (5) Come back inside. Completion triggers energy level re-measurement
- **ASD Design Rationale:** Environmental Shift — Changes sensory input through physical environment transition. Multi-sensory engagement resets arousal level

**Strategy 3: 🤸 Energy Shake**
- **App Behavior:** 4-round quick exercise guide, 15 seconds each (60 seconds total): Round 1: Arm shaking → Round 2: Jumping in place → Round 3: Body twist → Round 4: Deep breath (cool down). Energetic countdown with upbeat visual tempo. Energy level re-measurement after completion
- **ASD Design Rationale:** Micro-Movement Activation — 60-second burst raises arousal level without requiring sustained exercise commitment. Structured rounds with clear endpoint prevent over-exertion

---

## 4. Universal Design Principles

These 8 principles apply to ALL screens and must be implemented consistently across the entire app.

**Principle 1: Timer Always Visible**
- Every guided activity displays a countdown timer showing exact remaining time. Large, high-contrast numerals with progress bar.
- Rationale: ASD individuals experience heightened anxiety with open-ended tasks. Visible timers provide temporal predictability and a concrete endpoint.

**Principle 2: Numbered Steps**
- All multi-step strategies display step numbers (e.g., "Step 2 of 5") with a progress indicator. Each step fits on one screen without scrolling.
- Rationale: Sequencing and executive function challenges are common in ASD. Numbered steps reduce cognitive load.

**Principle 3: Post-Strategy Intensity Re-measurement**
- After completing any strategy, re-display the emotion intensity thermometer (1–10 scale). Show before/after comparison with visual delta indicator.
- Rationale: Builds self-efficacy by making regulation progress visible. Teaches metacognitive skill of recognizing that emotions can change through action.

**Principle 4: Universal Skip/Exit Button**
- Every strategy screen includes a visible "Skip" or "Back" button. No strategy is mandatory. User can exit mid-exercise without penalty or guilt messaging.
- Rationale: Autonomy and control are critical for ASD emotional regulation. Forced completion can trigger meltdowns.

**Principle 5: Multi-Modal Sensory Feedback**
- Progress and transitions communicated through visual (color changes, animations), auditory (soft chimes), and haptic (gentle vibration pulses) channels simultaneously. All channels individually toggleable in Settings.
- Rationale: Reduces reliance on text-only communication. Customizable channels accommodate individual sensory profiles.

**Principle 6: Minimal Visual Clutter**
- Maximum 3 interactive elements per screen. High contrast text (WCAG AA minimum). No decorative animations during active exercises. Consistent color coding per emotion.
- Rationale: Visual processing differences in ASD mean cluttered interfaces increase cognitive load and can trigger sensory overload.

**Principle 7: Predictable Navigation**
- Same flow every time: Emotion → Trigger (optional) → Intensity → Strategies → Activity → Re-measure → Complete. No surprise pop-ups, no dynamic layout changes, no auto-playing content.
- Rationale: Routine and predictability are foundational needs in ASD.

**Principle 8: No Social Pressure by Default**
- Sharing and social features are opt-in only. No leaderboards, no social comparisons, no mandatory sharing.
- Rationale: Social communication challenges are a core feature of ASD. Removing social pressure allows focus on self-regulation.

---

## 5. Emergency Mode — 🆘 Help Me Now

### 5.1 Overview

Emergency Mode provides immediate crisis support when the child is in or near meltdown state. It bypasses the entire standard check-in flow and delivers the most effective calming strategy in one tap.

### 5.2 Requirements

**FR-EM01: Emergency Button Placement**
- A large "🆘 Help Me Now" button is permanently visible on the Home screen
- Button is visually distinct: red/orange color, larger than other elements, fixed position (does not scroll)
- Button is accessible from any screen via a persistent floating action button (FAB) in the bottom-right corner
- Single tap activates Emergency Mode. No confirmation dialog (speed is critical during crisis)

**FR-EM02: Automatic Strategy Selection**
- On activation, the app's AI selects the most effective strategy for this child based on historical data:
  - Primary: Strategy with highest average intensity reduction across all emotions
  - Fallback (insufficient data or first-time use): Deep Breathing (Box Breathing 4-4-4-4)
- Strategy launches immediately. No emotion selection, no intensity rating, no trigger tagging
- Only strategies with guided components are eligible for Emergency Mode: Deep Breathing, 5-4-3-2-1 Grounding, Squeeze & Release, Hold Something Cold, Mindful Moment. Non-guided strategies (journal, camera, drawing) are excluded because they require too much cognitive initiation during crisis

**FR-EM03: Emergency Mode UI**
- Maximally simplified interface:
  - Dark background (reduces visual stimulation)
  - Single animation or instruction in center of screen
  - Large, high-contrast text
  - No navigation bar, no header, no decorative elements
  - Only two buttons: "Done" and "Try Another Strategy"
- Timer visible but less prominent than standard mode
- Haptic feedback follows standard Sensory Settings (respects the child's sensory profile)

**FR-EM04: Emergency Mode Exit & Recording**
- When child taps "Done":
  - Brief screen: "You did great. Take a moment. 💙"
  - Then: simplified check-in with emotion selection and intensity (post only, no before measurement)
  - Optional: "What triggered this?" with trigger tags (same as FR-C01, fully skippable)
- All Emergency Mode usage is recorded in Journey with a "🆘 Emergency" tag
- The entry shows: timestamp, strategy used, post-strategy intensity (if provided), trigger (if provided)

**FR-EM05: Guardian Emergency Notifications**
- Every Emergency Mode activation sends Guardian a notification: "🆘 [Child] used Emergency Mode at [time]"
- Notification includes: strategy used, post-strategy intensity (if recorded), trigger (if recorded)
- This is automatically classified as Level 2 (🟠 Concern) in the Alert Escalation Protocol
- If Emergency Mode is used 3+ times in 24 hours: escalated to Level 3 (🔴 Alert) with message: "🔴 [Child] has used Emergency Mode 3 times today. Please check in with them and consider contacting their care team"
- The child is never aware that notifications were sent (protects honest usage)

**FR-EM06: Emergency Mode Customization**
- Guardian can customize Emergency Mode in Settings:
  - Override AI strategy selection: manually choose which strategy Emergency Mode uses (e.g., therapist recommended a specific technique)
  - Add a custom comfort message that displays during Emergency Mode (max 50 characters, e.g., "I love you. You're safe. This will pass.")
  - The custom message appears at the top of the Emergency Mode screen in soft text
- Child can customize:
  - Choose a "comfort color" for Emergency Mode background (default: dark blue, options: dark blue, dark green, dark purple, black)

---

## 6. Trigger Mapping System

### 6.1 Overview

Trigger Mapping tracks the causes of emotions, enabling pattern analysis that shifts FeelFlow from reactive (managing emotions after they occur) to proactive (anticipating and preventing emotional crises).

### 6.2 Requirements

**FR-C01: Trigger Tag Selection**
- After emotion selection (Step 1) and before intensity measurement (Step 3), the app displays a trigger selection screen
- Header: "What caused this feeling?" 
- Tag options displayed as tappable pills/chips:

| Tag | Icon | Description |
|-----|------|-------------|
| School | 🏫 | School-related events or stress |
| Friends | 👫 | Peer interactions |
| Family | 👨‍👩‍👦 | Family interactions or events |
| Noise | 🔊 | Loud or unexpected sounds |
| Change in Routine | 🔄 | Unexpected schedule changes |
| Tired | 😴 | Physical fatigue |
| Hungry | 🍽️ | Hunger or food-related |
| Sensory Overload | ⚡ | Too much sensory input |
| Don't Know | ❓ | Cannot identify the cause |
| Other | ✏️ | Free text input (max 30 characters) |

- The child can select multiple tags (e.g., School + Noise)
- "Don't Know" is always a valid option — the app never pressures identification
- A prominent "Skip" button is available. This entire step is optional
- Selected triggers are stored with the check-in record

**FR-C02: Guardian-Customizable Triggers**
- Guardian can add up to 5 custom trigger tags specific to their child's life:
  - Examples: "Bus Ride", "Homework", "After-School Program", "Doctor Visit", "New Food"
- Custom tags appear alongside default tags in the child's trigger selection screen
- Guardian can deactivate (hide) default tags that are irrelevant to reduce visual clutter

**FR-C03: Trigger Pattern Analysis**
- The app's AI analyzes trigger data and generates insights for the Guardian:

**Frequency Analysis:**
- "62% of [Child]'s Anxious check-ins are triggered by 'Change in Routine'"
- "School-related triggers peak on Mondays and drop on Fridays"
- Displayed as a trigger × emotion heatmap in the Guardian Dashboard

**Temporal Patterns:**
- "Sensory Overload triggers are most common between 2–4 PM (after-school transition)"
- "'Friends' trigger has increased 3x this month compared to last month"

**Correlation Insights:**
- "When triggered by 'Noise', Deep Breathing reduces intensity by 4.2 points on average. When triggered by 'Change in Routine', 5-4-3-2-1 Grounding is more effective (3.8 reduction)"
- This data feeds into strategy recommendations: when a child selects "Change in Routine" as trigger, 5-4-3-2-1 Grounding gets the "⭐ Works best for this" badge

**FR-C04: Trigger Data in Reports**
- Weekly Summary includes: Top 3 triggers this week with frequency
- Monthly Clinical Report includes: Full trigger distribution chart, trigger × emotion correlation matrix, trigger trend comparison (this month vs. last month), notable trigger pattern changes flagged by AI
- This is the single most valuable data point for therapists: "What specifically is causing distress?"

**FR-C05: Trigger Display in Journey**
- Each Journey timeline entry shows the trigger tag(s) if provided
- Child can filter their Journey by trigger: "Show me all times I felt bad because of School"
- This helps the child develop self-awareness: "I notice I always get anxious when routines change"

---

## 7. Crisis Resource Connection

### 7.1 Overview

FeelFlow includes always-accessible crisis resources as a safety net. The app does not perform crisis assessment or diagnosis — it provides immediate access to professional help.

### 7.2 Requirements

**FR-CR01: Crisis Resources Page**
- Accessible from: Settings menu (permanent link), Emergency Mode completion screen (subtle link), and any time the child records intensity 9 or 10 on Sad or Anxious (gentle prompt, not forced)
- The page displays:

**Immediate Help:**
- 988 Suicide & Crisis Lifeline: Call or text 988
  - "Free, confidential, 24/7. You can call or text."
- Crisis Text Line: Text HOME to 741741
  - "If you'd rather text than talk."
- 911 Emergency
  - "If you or someone else is in immediate danger."

**Additional Resources:**
- Autism-specific crisis support (e.g., Autism Society helpline)
- Local resources (configurable by Guardian in Settings)
- "Talk to [Guardian Name]" button — sends a pre-written message to Guardian: "[Child] is having a hard time and could use your support right now"

**FR-CR02: Gentle Prompt (Not Forced)**
- When the child records Sad or Anxious with intensity 9–10, after the check-in completion screen, a subtle card appears:
  - "If you're going through a really hard time, there are people who can help. 💙"
  - "See resources →" link
  - "I'm okay" dismiss button
- This prompt appears maximum once per day (not on every high-intensity check-in)
- The prompt is never alarming, never clinical. Tone is warm and supportive
- Prompt does NOT appear for Angry, Tired, Happy, or Calm at any intensity

**FR-CR03: Guardian Crisis Configuration**
- Guardian can add local crisis resources in Settings: therapist's emergency number, school counselor contact, family emergency contacts
- Guardian can customize the "Talk to [Guardian Name]" message that gets sent
- Guardian can configure which Guardian(s) receive the "hard time" notification

**FR-CR04: Crisis Data Privacy**
- Whether the child views the Crisis Resources page is NEVER recorded or shared with Guardian
- Whether the child calls/texts a crisis line is NEVER recorded or shared with Guardian
- The "Talk to [Guardian]" message IS sent to Guardian (that's its explicit purpose), but the child is clearly informed: "This will send a message to [Guardian Name]. Tap to send"
- Rationale: Crisis resource access must be completely private to encourage use without fear of surveillance. The only exception is when the child explicitly chooses to reach out to their Guardian

**FR-CR05: Crisis Resources — ASD-Specific Design**
- All text uses simple, direct language. No metaphors, no euphemisms
- Phone numbers are displayed as large, tappable buttons (not just text)
- "What will happen when I call?" brief explanation under each resource:
  - "988: Someone will answer. You can tell them how you feel. They will listen and help you figure out what to do next. You can hang up anytime."
  - "Text Line: You'll text with a real person. They'll ask how you're doing. You type as much or as little as you want."
- This demystification is critical for ASD users who may experience anxiety about unknown social interactions

---

## 8. Trophy Page — Gamified Goal System

### 8.1 Overview

The Trophy system is a guardian-driven gamification feature that motivates ASD teenagers to consistently practice emotion regulation. Guardians set goals, define point thresholds, and assign real-world rewards.

### 8.2 Guardian Side — Goal Configuration

**FR-T01: Goal Creation**
- Guardian can create a goal with: Goal Name (max 50 characters), Point Target (10–1000), Reward Description (max 100 characters), and Reward Emoji/Icon (12 preset icons)
- Guardian must have at least 1 active goal and can queue up to 10 goals
- Goals are ordered in a numbered list; completing goal #1 automatically activates goal #2

**FR-T02: Point Value Configuration**
- Guardian defines how many points each action earns (configurable):

| Action | Default Points | Range |
|--------|---------------|-------|
| Complete a daily check-in | 10 pts | 5–30 |
| Complete a strategy (full, no skip) | 15 pts | 5–50 |
| Intensity improvement (≥2 point drop) | 5 pts bonus | 0–20 |
| 3-day streak | 20 pts bonus | 0–50 |
| 7-day streak | 50 pts bonus | 0–100 |
| Perfect Day (all routines completed) | 10 pts bonus | 0–30 |

**FR-T03: Goal Queue Management**
- Guardian can reorder queued goals via drag-and-drop
- Guardian can edit any queued goal's name, target, or reward
- The active goal can only be fully edited if 0 points earned; if 1+ points earned, only reward description can be modified
- When queue is empty and active goal completed: prompt Guardian to set new goal

**FR-T04: Goal Lifecycle States**
- Draft → Queued → Active → Completed
- Active goals can be Paused (points preserved) and Resumed
- Queued goals can be Deleted with confirmation
- If Guardian deletes active goal mid-progress: points carry over to next queued goal

**FR-T05: Goal Template Library**
- Starter Goals: "First Steps" (50 pts), "Feeling Detective" (100 pts), "Streak Builder" (150 pts)
- Growth Goals: "Strategy Master" (200 pts), "Calm Champion" (300 pts), "Monthly Hero" (500 pts)
- Custom goal creation available
- Templates provide suggested point targets; Guardian can modify

### 8.3 Guardian Side — Encouragement System

**FR-T06: Encouragement Messages**
- Pre-built template messages based on progress level:
  - LOW (0–30%): "You started — that's the hardest part! 💪" / "Every check-in counts. Keep going! 🌱" / "I'm proud of you for trying. One step at a time 🐢"
  - MEDIUM (31–70%): "You're halfway there! 🚀" / "Your [Reward] is getting closer! 🎯"
  - HIGH (71–99%): "Almost there! 🔥" / "Your [Reward] is SO close! 🎉"
- Custom message option (max 80 characters) at all levels
- Maximum 3 messages per day
- Child sees banner notification + can tap ❤️ reaction (single tap, no text reply)

### 8.4 Child Side — Trophy Experience

**FR-T07: Trophy Dashboard**
- Displays: current goal name, reward icon and description, progress bar with percentage, current points / target points, days active on goal, "Coming Up Next" preview of queued goals

**FR-T08: Point Earning Feedback**
- "+N pts" float animation on every point earn
- Bonus points shown separately: "+15 pts (Strategy) +5 pts (Improvement Bonus!)"

**FR-T09: Goal Completion Celebration**
- Sequence: (1) Full-screen confetti (3 sec) → (2) Fanfare sound → (3) "🏆 GOAL ACHIEVED!" → (4) Reward card display → (5) "Celebrate!" button → (6) "New Goal Loading..." → (7) Next goal activates at 0 points
- Celebration intensity customizable in Sensory Settings: Full / Reduced (no sound) / Minimal (text only)
- If no goals in queue: "You completed all goals! Ask [Guardian] to set a new adventure 🌈"

**FR-T10: Trophy History**
- Scrollable completed goals list: goal name, reward, date completed, total points, days to complete
- Progressive trophy icons: 🥉 first, 🥈 second, 🥇 third, 🏆 all subsequent

---

## 9. Journey Page — Emotion History & Creative Content

### 9.1 Overview

Journey records every check-in and all creative outputs. Child sees full history with personal content; Guardian sees data patterns without private content.

### 9.2 Child Side

**FR-J01: Timeline View**
- Vertical scrollable timeline, most recent first
- Each entry shows: date/time, emotion emoji + name, trigger tag(s), intensity before → after with delta, strategy used, creative content (text/photo/drawing/gratitude/body scan/grounding summary), Trophy points earned
- Entries grouped by day with date headers
- Delete button on every entry and every creative content piece

**FR-J02: Creative Content in Timeline**

| Source Strategy | Content Displayed |
|----------------|-------------------|
| Happy Journal | Full text entry |
| Gratitude | 3 gratitude entries (person/thing/place) as mini card |
| Capture the Moment | Photo thumbnail (tap for full view) |
| Calm Catalog | Photo thumbnail with "😌 Calm" tag |
| Body Scan | Body silhouette with highlighted areas + labels |
| Angry Drawing | Drawing snapshot (auto-captured before canvas clears) |
| 5-4-3-2-1 Grounding | Summary card with all 5 stages |

**FR-J03: Weekly Summary Card**
- Top of Journey page: check-ins this week, most frequent emotion, best strategy (highest avg. intensity reduction), current streak, emotion distribution bar chart

**FR-J04: "What Works for Me" Insight**
- Per-emotion analysis: "When you feel [Emotion], [Strategy] works best for you"
- Requires ≥3 completed strategies per emotion. Based on average intensity reduction
- Enhanced with creative content: browsable past drawings, photo gallery, journal word cloud

**FR-J05: Emotion Calendar**
- Monthly view with dominant emotion emoji per day. Tap day for details. Streak days highlighted

### 9.3 Guardian Side

**FR-J06: Guardian Journey View**
- Same timeline and weekly summary as child
- Cannot see: journal text, photos, drawings, gratitude entries, body scan details
- CAN see: Content Engagement Indicators — "📝 Journal entry written", "📸 Photo captured", "🎨 Drawing created"

**FR-J07: Extreme Emotion Alerts**
- Intensity 9+ (except Happy/Calm): Guardian notification with emotion, intensity, strategy used, result
- Configurable threshold: default 9, range 7–10
- 3+ high-intensity in 24 hours: escalated alert
- Child is never aware alerts were sent

### 9.4 Privacy Rules

**FR-J08: Privacy Boundaries**
- Child's creative content is NEVER visible to Guardian
- Guardian sees engagement indicators only
- This boundary is non-configurable
- Child can delete any entry; Guardian is not notified of deletions
- If child opts in (toggle in Settings, default OFF), creative content can be included in monthly exports

---

## 10. Emotion Dashboard — Guardian Analytics

### 10.1 Overview

The Guardian Dashboard provides visual analytics across three time horizons: Daily, Weekly, and 2-Month views, enabling both immediate monitoring and long-term trend analysis.

### 10.2 Daily View

**FR-D01: Emotion Timeline**
- X-axis: time (00:00–23:59), Y-axis: Intensity (1–10)
- Each check-in as emotion-colored dot (size proportional to intensity)
- Tap dot for check-in details popup
- Before→After connected by arrow for same check-in
- Context Tags displayed as markers on timeline

**FR-D02: Today's Summary Card**
- Check-in count, highest intensity recorded, most effective strategy today, current streak, Trophy progress bar

### 10.3 Weekly View

**FR-D03: Emotion Distribution Chart**
- Horizontal stacked bar chart, 7 days, showing emotion color proportions per day

**FR-D04: Intensity Trend Line**
- X-axis: Mon–Sun, Y-axis: Intensity (1–10)
- Daily average as solid line, high/low as shaded area
- Context Tags as icons on X-axis

**FR-D05: Strategy Usage Heatmap**
- 7 days × strategies grid. Color intensity = effectiveness (intensity reduction)

**FR-D06: Week-over-Week Comparison**
- vs. last week: check-in count (↑/↓), avg. intensity (↑/↓), strategy completion rate (↑/↓)
- Green = improvement, Red = decline, Gray = stable

### 10.4 2-Month View

**FR-D07: Long-term Intensity Trend**
- X-axis: 8 weeks, Y-axis: Intensity (1–10)
- Weekly average as solid line, 7-day rolling average overlay
- Filter by individual emotion toggles
- Context Tags as markers

**FR-D08: Emotion Proportion Change**
- Stacked area chart showing weekly emotion distribution shift over 8 weeks

**FR-D09: Strategy Effectiveness Trend**
- Per-strategy weekly avg. intensity reduction as line chart
- Identifies declining effectiveness

**FR-D10: Independence Score Trend**
- FR-G07 score plotted over 8 weeks

### 10.5 Dashboard Interaction Rules

**FR-D11: Chart Interactions**
- All charts support pinch-to-zoom
- Tap any data point for detail popup
- "📤 Export" button per chart (save as image or include in report)
- Pull-to-refresh for manual update
- Minimum 3 check-ins required per period to display charts; otherwise: "More data needed" message

---

## 11. AI Insight Engine

### 11.1 Overview

Built-in AI analyzes Guardian's data and provides natural-language insights including pattern interpretation and actionable suggestions.

### 11.2 Automatic Weekly Insight

**FR-AI01: Weekly Insight Card**
- Auto-generated every Monday, displayed at top of Guardian Dashboard
- Structure: Title, 3–5 sentence analysis, "See the data →" link, "Helpful?" feedback (👍/👎)
- Insight types: Pattern Recognition, Strategy Effectiveness, Progress Recognition, Concern Flagging, Correlation Insight (with Context Tags)

### 11.3 On-Demand AI Analysis

**FR-AI02: "Ask About [Child]" Feature**
- Preset questions: "What emotions have been most frequent?", "Which strategies are working best?", "Any concerning patterns?", "How does this week compare to last month?", "What should I discuss with our therapist?", "Is [Child] becoming more independent?"
- Each answer: 2–4 sentences with specific numbers and dates
- "Include in next report" button per answer
- Custom free-text questions (Post-MVP)

### 11.4 AI Boundaries

**FR-AI03: AI Rules**
- Never diagnoses. Says "consider discussing with a professional" not "this looks like depression"
- Never recommends medications or treatments
- All insights include disclaimer: "These insights are based on app data and are not clinical assessments."
- AI insights visible to Guardian only, never to child
- Guardian can disable AI insights entirely in Settings
- AI does not analyze creative content (text, photos, drawings)

---

## 12. Daily Routine System

### 12.1 Overview

Daily Routine provides a structured daily checklist that integrates emotion check-ins and strategy practice into habitual patterns.

### 12.2 Default Routine

**FR-R01: Pre-set Routine Items**

| Time | Item | Points | Description |
|------|------|--------|-------------|
| 🌅 Morning | Morning Check-in | 10 pts | Emotion + trigger + intensity check-in |
| 🌅 Morning | Morning Breathing | 5 pts | 1-minute Deep Breathing short version |
| ☀️ Afternoon | Afternoon Check-in | 10 pts | Mid-day check-in with comparison to morning |
| 🌙 Evening | Evening Reflection | 10 pts | End-of-day check-in + one-line best moment |
| 🌙 Evening | Gratitude Entry | 5 pts | Single gratitude item (short version) |

### 12.3 Guardian Routine Management

**FR-R02: Guardian Routine Controls**
- Modify default item times and point values
- Delete default items (except Morning Check-in — minimum 1 check-in required)
- Deactivate items (hide, re-activatable later)
- Add custom routine items: name (40 chars), time slot (Morning/Afternoon/Evening/Anytime), points (0–30), repeat schedule (daily/weekdays/weekends/custom days), notification time, icon (12 presets)
- Guardian-created items display 🔒 icon (child cannot delete/modify)
- Maximum 15 total routine items

**FR-R03: Routine Modification Notifications**
- Changes notify child: "Your routine has been updated! Check it out 📋"

### 12.4 Child Routine Management

**FR-R04: Child Custom Routines**
- Child can add custom items: name, time slot, icon
- Points fixed at 5 pts (child cannot set own points)
- Child-created items display ⭐ icon
- Child can delete/modify their own items only
- Guardian can view child-created items but cannot modify/delete them
- Child adding item notifies Guardian: "✨ [Child] added a new routine: [Name]"

### 12.5 Routine UI

**FR-R05: Checklist Display**
- Organized by time slot (Morning → Afternoon → Evening)
- Each item shows: checkbox, icon, name, origin indicator (🔒/⭐/none), points
- Check-in items → tap launches check-in flow
- Strategy items → tap launches short version of strategy
- General items → tap toggles completion
- Bottom bar: "Today: X/Y completed · N/M pts earned"
- "➕ Add My Routine" button at bottom

### 12.6 Routine Integration

**FR-R06: Routine ↔ Trophy**
- All routine points count toward Trophy
- Perfect Day bonus (all items completed): +10 pts (Guardian configurable)
- 3 consecutive Perfect Days: +20 pts bonus

**FR-R07: Routine ↔ Journey**
- Routine-triggered check-ins tagged "📋 Daily Routine" in Journey
- AI Insight includes routine analysis: "[Child] completes morning routines 90% but evening only 40%"

### 12.7 ASD Design Rules for Routines

**FR-R08: Routine UX Rules**
- Items always in time-slot order (not reorderable by child). Predictable structure
- Past-due items grayed but still completable. Never disappear
- Notifications are gentle: "Time for your afternoon check-in 😊" (never "You missed your check-in!")
- End of day: "You completed 4 out of 7 today. Great effort! 🌟" (always celebrate what was done, never highlight what wasn't)
- Weekend Mode option: Guardian can set separate weekday/weekend routines

---

## 13. Clinical Reports & Professional Sharing

### 13.1 Report Types

**FR-G01: Weekly Summary (Auto-generated)**
- Generated every Monday. 1 page
- Contents: check-in count, emotion distribution (pie chart), avg. intensity per emotion, strategy usage, intensity trend, streak info

**FR-G02: Monthly Clinical Report (Manual)**
- Guardian-initiated. 3–4 pages
- Contents: patient info header (name, age, ASD level, period), emotion frequency analysis (monthly distribution, weekly change trend), intensity analysis (avg/max/min per emotion, high-intensity event list), strategy effectiveness table, trigger distribution chart and trigger × emotion matrix, behavioral pattern alerts from the month, time-of-day heatmap, Independence Score, Guardian notes (free text field)

**FR-G03: Custom Period Report (Manual)**
- Guardian selects start/end dates. Same format as Monthly
- Use case: "Since last appointment to today"

### 13.2 Report Standards

**FR-G04: All Reports Include**
- PDF export (email, save, print)
- Header disclaimer: "This report was generated by FeelFlow. Data is self-reported and should be interpreted in clinical context."
- FeelFlow logo + generation date + unique report ID
- Creative content excluded by default (child opt-in per FR-J08)
- Creative Engagement Summary included: journal entries/photos/drawings per week counts

### 13.3 Guardian Notes & Context Tags

**FR-G05: Context Tagging**
- Guardian adds date-specific tags: 🏥 Doctor Visit, 💊 Medication Change, 🏫 School Event, 👨‍👩‍👦 Family Event, 😴 Sleep Issue, 🤒 Sick Day, 🔄 Routine Change, 📝 IEP Meeting, + custom tags (30 chars)
- Tags display on Dashboard trend lines and in reports as markers
- Purpose: provides "why" context for emotional data patterns

### 13.4 Behavioral Pattern Analysis

**FR-G06: Automated Pattern Detection**
- Emotion frequency change: 50%+ increase vs. 4-week avg → 🟡 Notice
- 3 consecutive days same negative dominant emotion → 🟡 Notice
- Weekly avg intensity rising 2+ consecutive weeks → 🟠 Concern
- 3+ consecutive intensity 8+ for same emotion → 🟠 Concern
- Previously effective strategy losing 50%+ effectiveness → 🟠 Concern
- 3+ day check-in gap → 🟡 Notice
- Check-in time shift to unusual hours (e.g., 2–4 AM) → 🟠 Concern

### 13.5 Alert Escalation Protocol

**FR-G07: Three-Level Alerts**
- Level 1 🟡 Notice: Single high-intensity event, 3-day same emotion dominant. Guardian action: review
- Level 2 🟠 Concern: 3+ high-intensity in 1 week, 2-week rising intensity, strategy effectiveness declining, 5+ day gap, Emergency Mode used. Guardian action: "Consider professional consultation" + one-tap report button
- Level 3 🔴 Alert: 3+ high-intensity in 24 hours, intensity 10 on Sad/Anxious, 2+ week gap then sudden high-intensity. Guardian action: "Please contact care team soon" + auto-generated urgent report + Care Team quick-dial

### 13.6 Independence Tracking

**FR-G08: Independence Indicators**

| Indicator | Measurement | Good Signal |
|-----------|-------------|-------------|
| Self-initiation Rate | Check-ins without Guardian reminder / total | ≥80% |
| Strategy Completion | Full completions / started | ≥70% |
| Intensity Self-regulation | Avg. intensity reduction post-strategy | ≥3 points |
| Emotion Vocabulary | Unique emotions used / 6 | ≥4/6 |
| Recovery Speed | Time to return to normal intensity after high event | ≤24 hours |
| Streak Consistency | Check-in days / 30 | ≥25 days |

- Combined into 0–100 Independence Score
- Visible on Guardian Dashboard (Insight Mode) and in monthly reports
- Never visible to child
- Milestones: 50 🌱 "Building foundations", 70 🌿 "Growing independence", 85 🌳 "High self-regulation"

### 13.7 Professional Sharing

**FR-G09: Share Options**
- Email (PDF attachment), AirDrop, Print, Encrypted temporary link (72-hour expiry)
- Confirmation: "This report contains [Child]'s emotional data. Share only with trusted professionals."
- Care Team Directory (Post-MVP): saved professional contacts with roles
- Share history log

---

## 14. Accessibility & Sensory Settings

| Setting | Options | Default | Purpose |
|---------|---------|---------|---------|
| Haptic Feedback | On / Off | On | Tactile sensitivity accommodation |
| Sound Effects | On / Off / Volume | On (50%) | Auditory sensitivity accommodation |
| Animation Speed | Slow / Normal / Fast | Normal | Visual processing speed matching |
| High Contrast Mode | On / Off | Off | WCAG AAA compliance |
| Text Size | Small / Medium / Large / XL | Medium | Reading accessibility |
| Celebration Intensity | Full / Reduced / Minimal | Full | Sensory sensitivity to sudden stimuli |
| Emergency Mode Color | Dark Blue / Dark Green / Dark Purple / Black | Dark Blue | Personal comfort during crisis |
| Trusted Contacts | Add name + method | Empty | "Talk to Someone" recipients |

---

## 15. Data & Privacy

- **Local-First Storage:** All data on-device by default. No cloud sync without opt-in
- **COPPA Compliance:** No data collection under 13 without parental consent
- **No Analytics on Emotional Data:** Only anonymized usage patterns collected
- **Parental Dashboard:** Aggregated summaries only. No access to creative content
- **Crisis Resource Privacy:** Whether child views crisis resources or contacts crisis lines is NEVER recorded or shared
- **Data Deletion:** Clear All Data with confirmation. Immediate, permanent
- **Creative Content:** Stored locally, encrypted, max 500MB. Child controls all deletion
- **Data Retention:** 12 months active. Older data archived (compressed, included in exports)

---

## 16. Implementation Priority

| Phase | Features | Complexity |
|-------|----------|------------|
| **Phase 1 (MVP)** | 6 emotions × 3 strategies (18 total), check-in flow with trigger tagging, intensity measurement, Daily Routine (default), Trophy (basic goals + points), Journey timeline (basic), Emergency Mode (🆘), Crisis Resources page, Guardian alerts (basic) | Core app — estimated 8–10 weeks |
| **Phase 2** | Emotion Dashboard (Daily/Weekly/2-Month), AI Weekly Insight, Guardian goal lifecycle management, goal templates, custom routines (Guardian + Child), creative content in Journey, context tagging, monthly clinical reports, Independence Score | Analytics + engagement — estimated 6–8 weeks |
| **Phase 3** | On-demand AI analysis, custom period reports, professional sharing portal, sensory profile setup, emotion vocabulary expansion, weekly challenges, medication tracking, sleep correlation, school-home transition tracking | Advanced intelligence + integrations — estimated 8–12 weeks |

---

## 17. Cross-Feature Architecture

```
Daily Routine (daily habits)
    │
    ├── Check-ins → Journey (emotion/trigger/strategy/creative content)
    │                  │
    │                  ├── Child: Timeline + "What Works for Me" + Calendar
    │                  └── Guardian: Dashboard (Daily/Weekly/2-Month) + AI Insights
    │
    ├── Points → Trophy (goal progress)
    │               │
    │               ├── Goal achieved → 🎉 Celebration → Next goal auto-activates
    │               └── Guardian: Encouragement + Goal management
    │
    ├── Patterns → Clinical Reports (Weekly/Monthly/Custom)
    │                  │
    │                  ├── AI pattern detection → Alert Escalation (🟡🟠🔴)
    │                  ├── Context Tags → Correlation analysis
    │                  ├── Trigger Mapping → Proactive insights
    │                  └── PDF export → Therapist/Doctor/School
    │
    └── Crisis → Emergency Mode (🆘 one-tap)
                    │
                    ├── AI selects best strategy → Immediate guided activity
                    ├── Guardian notified → Level 2 alert minimum
                    └── Crisis Resources always accessible
```

---

*End of Document — FeelFlow Complete PRD v1.0*
