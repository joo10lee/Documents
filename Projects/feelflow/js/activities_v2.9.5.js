/**
 * Activities Module: Ver.0215-ULTIMATE-FINAL
 * [복구] 408줄 상세 로직 + 감정 매핑 오류 수정 + 강도별 지능형 분기 통합
 */

let audioCtx = null;

const Activities = {
    currentStream: null,
    currentFacingMode: 'user',
    currentInterval: null,
    activeTimeouts: [],

    // 1. 오디오/햅틱 엔진 (브라우저 정책 대응)
    initAudio() {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
        } catch (e) { console.error("Audio init fail:", e); }
    },

    feedback(type) {
        this.initAudio();
        const sounds = {
            tap: { freq: 880, dur: 0.1, vib: 15 },
            tick: { freq: 440, dur: 0.05, vib: 8 },
            success: { freq: [523.25, 659.25, 783.99], dur: 0.5, vib: [50, 100, 50] }
        };
        const cfg = sounds[type];
        if (!cfg || !audioCtx) return;
        if (Array.isArray(cfg.freq)) {
            cfg.freq.forEach((f, i) => this.playTone(f, cfg.dur, audioCtx.currentTime + (i * 0.1)));
        } else {
            this.playTone(cfg.freq, cfg.dur, audioCtx.currentTime);
        }
        if (typeof safeVibrate === 'function') safeVibrate(cfg.vib);
    },

    playTone(freq, dur, startTime) {
        const start = Math.max(startTime, audioCtx.currentTime + 0.05);
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.1, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(start); osc.stop(start + dur);
    },

    // 2. 활동 정리 및 리소스 해제
    stopAll() {
        if (this.currentInterval) clearInterval(this.currentInterval);
        this.activeTimeouts.forEach(clearTimeout);
        this.activeTimeouts = [];
        this.currentInterval = null;
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }

        // 💡 Audio Cleanup
        if (this.currentAudioSource) {
            try { this.currentAudioSource.stop(); } catch (e) { }
            try { this.currentAudioSource.disconnect(); } catch (e) { }
            this.currentAudioSource = null;
        }
        if (this.currentGainNode) {
            try { this.currentGainNode.disconnect(); } catch (e) { }
            this.currentGainNode = null;
        }
        // Reset state
        this.isPlaying = false;

        if (navigator.vibrate && window.userInteracted) {
            try { navigator.vibrate(0); } catch (e) { }
        }

        // 💡 Restore Header if hidden
        const appHeader = document.querySelector('.app-header');
        if (appHeader) appHeader.style.display = 'flex';
    },

    // 4-Step Sequence for Hold Something Cold
    startHoldIce() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.app-header');
        if (headerEl) headerEl.style.display = 'none';

        let step = 0;
        const totalTime = 60;
        let timeLeft = 60;

        area.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <h2 style="font-weight:850; color:#3b82f6; margin-bottom:10px;">Ice Challenge</h2>
                <div id="iceIcon" style="font-size:6rem; margin:20px 0;">🧊</div>
                <h3 id="iceStep" style="font-weight:800; color:#1e293b; min-height:50px;">Find an ice cube...</h3>
                
                <div id="iceTimer" style="font-size:3rem; font-weight:900; color:#3b82f6; margin:20px 0;">1:00</div>
                
                <div style="width:80%; height:10px; background:#e2e8f0; margin:0 auto; border-radius:5px;">
                    <div id="iceBar" style="width:100%; height:100%; background:#3b82f6; transition:width 1s linear;"></div>
                </div>

                <button id="iceBtn" class="btn-primary" style="margin-top:30px;">I'm Ready</button>
            </div>
        `;
        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        const stepEl = document.getElementById('iceStep');
        const timerEl = document.getElementById('iceTimer');
        const barEl = document.getElementById('iceBar');
        const actionBtn = document.getElementById('iceBtn');

        // Step 0: Prep
        actionBtn.onclick = () => {
            actionBtn.style.display = 'none';
            startTimer();
        };

        const startTimer = () => {
            this.currentInterval = setInterval(() => {
                timeLeft--;
                const m = Math.floor(timeLeft / 60);
                const s = timeLeft % 60;
                timerEl.innerText = `${m}:${s < 10 ? '0' + s : s}`;

                // Progress
                const pct = (timeLeft / totalTime) * 100;
                barEl.style.width = `${pct}%`;

                // Logic Steps
                // 60-45: Hold
                if (timeLeft > 45) { stepEl.innerText = "Hold it in your hands."; }
                // 45-30: Focus
                else if (timeLeft > 30) { stepEl.innerText = "Focus on the cold sensation."; }
                // 30-15: Breathe
                else if (timeLeft > 15) { stepEl.innerText = "Take a deep breath..."; if (timeLeft === 29 && navigator.vibrate) navigator.vibrate(100); }
                // 15-0: Notice
                else { stepEl.innerText = "Notice your body changing."; }

                if (timeLeft <= 0) {
                    clearInterval(this.currentInterval);
                    this.completeAction('gold', 60);
                }
            }, 1000);
        };
    },

    // 3. 🧠 [Master] 지능형 전략 렌더러 (매핑 오류 & 강도 분기 해결)
    renderStrategies(emotionName, intensity) {
        const container = document.getElementById('strategiesContainer');
        if (!container) return;

        const name = emotionName ? emotionName.toString().trim().toLowerCase() : "";
        const level = parseInt(intensity) || 5;
        console.log(`🧠 [STRATEGY DEBUG] Input Name: "${emotionName}", Parsed: "${name}", Level: ${level}`);

        let quests = [];

        // Strategy Metadata for V0 cards
        const meta = {
            'Deep Breathing': { desc: 'Breathe in a calming pattern', dur: '2 min' },
            '5-4-3-2-1 Grounding': { desc: 'Focus on your 5 senses', dur: '3 min' },
            'Calm Catalog': { desc: 'Look at peaceful photos', dur: '2 min' },
            'Angry Drawing': { desc: 'Draw how you feel', dur: '5 min' },
            'Squeeze & Release': { desc: 'Tense and relax your muscles', dur: '3 min' },
            'Take a Walk': { desc: 'Get some fresh air', dur: '10 min' },
            'Happy Note': { desc: 'Write a small joy', dur: '1 min' },
            'Share the joy': { desc: 'Tell someone something good', dur: '2 min' },
            'Happy Journal': { desc: 'Record your best moments', dur: '5 min' },
            'Capture the Moment': { desc: 'Take a photo of joy', dur: '2 min' },
            'Body Scan': { desc: 'Notice feelings in your body', dur: '5 min' },
            'Comfort Object': { desc: 'Find something soft', dur: '2 min' },
            'Listen to Music': { desc: 'Soothing sounds for you', dur: '5 min' },
            'Talk to Someone': { desc: 'Reach out to a friend', dur: '10 min' },
            'Mindful Moment': { desc: 'Simply be present', dur: '3 min' },
            'Gratitude': { desc: 'What are you thankful for?', dur: '3 min' },
            'Drink Water': { desc: 'Hydrate your body', dur: '1 min' },
            'Fresh Air': { desc: 'Step outside for a moment', dur: '3 min' },
            'Energy Shake': { desc: 'Move your body! (+30 XP)', dur: '2 min' },
            'Write it down': { desc: 'Get it out of your head', dur: '5 min' },
        };

        // 💡 [해결] Happy (😊) - 1-2단계(🌱) vs 3단계 이상(✍️) 분기 복구
        if (name.includes('happy') || name.includes('😊')) {
            if (level <= 2) {
                quests = [
                    { title: 'Happy Note', icon: '🌱', tier: 'gold', xp: 60, tag: 'SMALL JOY' },
                    { title: 'Share the joy', icon: '✨', tier: 'silver', xp: 30 }
                ];
            } else {
                quests = [
                    { title: 'Happy Journal', icon: '✍️', tier: 'gold', xp: 60, tag: 'WRITE' },
                    { title: 'Capture the Moment', icon: '📸', tier: 'silver', xp: 50 },
                    { title: 'Body Scan', icon: '🧘', tier: 'silver', xp: 30, tag: 'AWARENESS' }
                ];
            }
        }
        else if (name.includes('sad') || name.includes('😢')) {
            quests = [
                { title: 'Comfort Object', icon: '🧸', tier: 'gold', xp: 60, tag: 'HUG' },
                { title: 'Listen to Music', icon: '🎵', tier: 'silver', xp: 30 },
                { title: 'Talk to Someone', icon: '🗣️', tier: 'silver', xp: 30 }
            ];
        }
        else if (name.includes('anxious') || name.includes('😰')) {
            quests = [
                { title: 'Deep Breathing', icon: '🌬️', tier: 'gold', xp: 60, tag: 'BREATHE' },
                { title: '5-4-3-2-1 Grounding', icon: '🖐️', tier: 'silver', xp: 30, tag: 'SENSES' },
                { title: 'Calm Catalog', icon: '🌌', tier: 'silver', xp: 30 }
            ];
        }
        else if (name.includes('angry') || name.includes('😠')) {
            quests = [
                { title: 'Angry Drawing', icon: '🖍️', tier: 'gold', xp: 60, tag: 'SCRIBBLE' },
                { title: 'Squeeze & Release', icon: '✊', tier: 'silver', xp: 30 },
                { title: 'Take a Walk', icon: '🚶', tier: 'silver', xp: 30 }
            ];
        }
        else if (name.includes('calm') || name.includes('😌')) {
            quests = [
                { title: 'Mindful Moment', icon: '🧘', tier: 'gold', xp: 60, tag: 'MEDITATE' },
                { title: 'Gratitude', icon: '🙏', tier: 'silver', xp: 50 },
                { title: 'Calm Catalog', icon: '📸', tier: 'silver', xp: 30, tag: 'PHOTO' }
            ];
        }
        else if (name.includes('tired') || name.includes('😫')) {
            quests = [
                { title: 'Drink Water', icon: '💧', tier: 'gold', xp: 60, tag: 'HYDRATE' },
                { title: 'Fresh Air', icon: '🍃', tier: 'silver', xp: 40 },
                { title: 'Energy Shake', icon: '⚡', tier: 'silver', xp: 40 }
            ];
        }
        else {
            quests = [
                { title: 'Deep Breathing', icon: '🌬️', tier: 'gold', xp: 60, tag: 'BREATHE' },
                { title: 'Write it down', icon: '✍️', tier: 'silver', xp: 30 }
            ];
        }

        const emotionColor = currentEmotion.color || '#6C5CE7';

        container.innerHTML = quests.map((q, idx) => {
            const d = meta[q.title] || { desc: 'A calming activity', dur: '5 min' };
            return `
                <button class="ff-strategy-card" onclick="Activities.setupActivity('${q.title}', '${q.icon}')">
                    <div class="ff-strategy-icon-circle" style="background: ${emotionColor}15;">
                        <span>${q.icon}</span>
                    </div>
                    <div class="ff-strategy-info">
                        <p class="ff-strategy-title">${q.title}</p>
                        <p class="ff-strategy-desc">${d.desc}</p>
                        <div class="ff-strategy-meta">
                            <span class="ff-strategy-duration" style="background: ${emotionColor}12; color: ${emotionColor}">${d.dur}</span>
                            <span class="ff-strategy-tag">${q.tag || 'Strategy'}</span>
                        </div>
                    </div>
                    <svg style="color: #9CA3AF; flex-shrink: 0;" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
            `;
        }).join('');
    },

    // 4. 활동 디스패처 (실제 퀘스트 매핑)
    setupActivity(type, icon) {
        this.stopAll();
        this.feedback('tap');
        if (typeof UI !== 'undefined' && UI.goToScreen) UI.goToScreen('Activity', type);

        setTimeout(() => {
            const area = document.getElementById('inAppActionArea');
            const btn = document.getElementById('activityBtn');
            const title = document.getElementById('activityTitle');
            if (!area) return;
            area.innerHTML = '';

            // 💡 Title is handled by App Header (Phase 8 fix for duplication)
            // const titleEl = document.getElementById('activityTitle');
            // if(titleEl) titleEl.textContent = act.title;

            const iconEl = document.getElementById('activityIcon');
            if (iconEl) iconEl.textContent = icon;
            if (title) title.textContent = type;
            if (btn) btn.style.display = 'block';

            // 💡 Dynamic Action Button Text based on Tier
            // Default to +30 XP for Silver, +60 XP for Gold if not specific

            if (type === 'Deep Breathing') {
                this.startDeepBreathing();
            }
            else if (type === '5-4-3-2-1 Grounding') {
                area.innerHTML = `<div style="font-size:3rem;">🖐️ 👀 👂 👃 👅</div><p>Name 5 things you see...</p>`;
                if (btn) { btn.textContent = "I'm Calm Now (+30 XP)"; btn.onclick = () => this.completeAction('silver', 30); }
            }
            else if (type === 'Push the Wall') {
                area.innerHTML = `<div style="font-size:4rem;">🧱</div><p>Push against the wall with all your might!</p>`;
                if (btn) { btn.textContent = "I feel stronger (+60 XP)"; btn.onclick = () => this.completeAction('gold', 60); }
            }
            else if (type === 'Squeeze & Release') {
                this.startSqueezeRelease();
            }
            else if (type === 'Power Nap') {
                area.innerHTML = `<div style="font-size:4rem;">🛌</div><p>Close your eyes for 10 minutes.</p>`;
                if (btn) { btn.textContent = "I'm awake! (+60 XP)"; btn.onclick = () => this.completeAction('gold', 60); }
            }
            else if (type === 'Listen to Music' || type.toLowerCase().includes('music')) {
                this.startListenToMusic();
            }
            else if (type === 'Meditation') {
                this.startMeditation();
            }
            else if (type === 'Hold Something Cold') {
                area.innerHTML = `<div style="font-size:4rem;">❄️</div><p>Hold an ice cube or cold pack.</p>`;
                let r = 0;
                const update = () => area.querySelector('p').innerText = `Hold it... ${3 - r}`;
                this.currentInterval = setInterval(() => { r++; update(); }, 1000);
                this.activeTimeouts.push(setTimeout(() => { if (r < 3) { r++; update(); } else this.completeAction('silver', 30); }, 3000));

                if (btn) btn.style.display = 'none'; // Auto-complete
            }
            else if (type === 'Write it down') {
                area.innerHTML = `<textarea id="actionNote" placeholder="What's on your mind?" style="width:100%; height:100px; border-radius:12px; border:1px solid #cbd5e1; padding:10px;"></textarea>`;
                if (btn) { btn.textContent = "Save (+30 XP)"; btn.onclick = () => this.completeAction('silver', 30); }
            }
            else if (type === 'Capture the Moment' || type === 'Capture the moment') {
                // startCaptureAction 함수가 UI 렌더링까지 모두 처리하므로 여기서 innerHTML을 비우고 넘깁니다.
                this.startCaptureAction();
            }
            else if (type === 'Body Scan') {
                this.startBodyScan();
            }
            else if (type === 'Angry Drawing') {
                this.startAngryDrawing();
            }
            else if (type === 'Calm Catalog') {
                this.startCalmCatalog(); // Will trigger photo mode
            }
            else if (type === 'Drink Water') {
                this.startDrinkWater();
            }
            else if (type === 'Fresh Air') {
                this.startFreshAir();
            }
            else if (type === 'Energy Shake') {
                this.startEnergyShake();
            }
            else if (type === 'Mindful Moment') {
                this.startMindfulMoment();
            }
            else if (type === 'Gratitude') {
                this.startGratitude();
            }

            // 💡 Phase 10: PRD New Strategies (Detailed Implementation)

            // 1. Happy Journal / Happy Note (Emoji Stamps + Text)
            else if (type === 'Happy Journal' || type === 'Happy Note') {
                const emojis = ['😊', '😂', '🥰', '🎉', '🌟', '🍩'];
                area.innerHTML = `
                    <p style="margin-bottom:10px; font-weight:600;">I feel happy because...</p>
                    <div style="display:flex; gap:10px; margin-bottom:10px; justify-content:center;">
                        ${emojis.map(e => `<button onclick="document.getElementById('actionNote').value += '${e}'" style="font-size:1.5rem; background:none; border:none; cursor:pointer;">${e}</button>`).join('')}
                    </div>
                    <textarea id="actionNote" placeholder="Type here..." style="width:100%; height:120px; border-radius:12px; border:1px solid #cbd5e1; padding:10px; font-size:1rem;"></textarea>
                `;
                if (btn) { btn.textContent = "Save to Memory Bank (+60 XP)"; btn.onclick = () => this.completeAction('gold', 60); }
            }

            // 2. Gratitude (3 Fields + Garden)
            else if (type === 'Gratitude') {
                area.innerHTML = `
                    <div style="text-align:left; gap:10px; display:flex; flex-direction:column;">
                        <label style="font-size:0.9rem; font-weight:700; color:#334155;">1. A Person 👤</label>
                        <input type="text" id="gratitudePerson" placeholder="Who?" style="padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                        
                        <label style="font-size:0.9rem; font-weight:700; color:#334155;">2. A Thing 🎁</label>
                        <input type="text" id="gratitudeThing" placeholder="What?" style="padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                        
                        <label style="font-size:0.9rem; font-weight:700; color:#334155;">3. A Place 🏞️</label>
                        <input type="text" id="gratitudePlace" placeholder="Where?" style="padding:10px; border-radius:8px; border:1px solid #cbd5e1;">
                    </div>
                    <div id="gratitudeGarden" style="margin-top:20px; text-align:center; height:50px;">
                        <!-- Flowers appear here -->
                    </div>
                `;
                // Simple visual feedback when typing
                ['Person', 'Thing', 'Place'].forEach(f => {
                    const el = document.getElementById(`gratitude${f}`);
                    if (el) el.addEventListener('input', (e) => {
                        if (e.target.value.length === 1) { // Add flower on first char
                            document.getElementById('gratitudeGarden').innerHTML += ['🌻', '🌷', '🌹'][Math.floor(Math.random() * 3)];
                            if (typeof playSound === 'function') playSound('tap');
                        }
                    });
                });

                if (btn) { btn.textContent = "Grow My Garden (+60 XP)"; btn.onclick = () => this.completeAction('gold', 60); }
            }

            // 3. Talk to Someone / Share the Joy / Big Hug (Script Cards or Interaction)
            else if (type === 'Talk to Someone' || type === 'Share the joy') {
                const scripts = type === 'Share the joy' ?
                    ["I have good news!", "I feel great because...", "Let's celebrate!"] :
                    ["I feel sad because...", "Can you just listen?", "I need a hug"];

                area.innerHTML = `
                    <div style="display:flex; flex-direction:column; gap:10px;">
                        ${scripts.map(s => `
                            <div class="script-card" onclick="Activities.selectScript(this)" style="background:#f8fafc; padding:15px; border-radius:12px; border:2px solid #e2e8f0; font-weight:600; cursor:pointer;">
                                "${s}"
                            </div>
                        `).join('')}
                    </div>
                    <div id="selectedScriptAction" style="margin-top:20px; display:none;">
                       <button onclick="navigator.clipboard.writeText(document.querySelector('.script-selected').innerText); alert('Copied!');" style="background:#3b82f6; color:white; padding:8px 16px; border-radius:8px; border:none;">📋 Copy</button>
                    </div>
                `;
                // Helper to handle selection
                this.selectScript = (el) => {
                    document.querySelectorAll('.script-card').forEach(c => {
                        c.style.borderColor = '#e2e8f0'; c.style.background = '#f8fafc'; c.classList.remove('script-selected');
                    });
                    el.style.borderColor = '#3b82f6'; el.style.background = '#eff6ff'; el.classList.add('script-selected');
                    document.getElementById('selectedScriptAction').style.display = 'block';
                };

                if (btn) { btn.textContent = "I Shared It (+30 XP)"; btn.onclick = () => this.completeAction('silver', 30); }
            }

            else if (type === 'Big Hug') {
                // Use Comfort Object logic or dedicated timer
                this.startBigHugTimer(); // Using the existing method for Big Hug
                if (btn) btn.style.display = 'none';
            }

            // 4. Timer/Sequence Strategies (Pass-through to specific logic below)
            else if (['Take a Walk', 'Fresh Air', 'Mindful Moment', 'Comfort Object', 'Energy Shake', 'Drink Water', 'Count to Calm'].includes(type)) {
                this.setupComplexStrategy(type, area, btn);
            }
            else {
                // Fallback
                area.innerHTML = `<div style="font-size:4rem;">✨</div><p>Take a moment for yourself.</p>`;
                if (btn) { btn.textContent = "Finished! (+30 XP)"; btn.onclick = () => this.completeAction('silver', 30); }
            }

        }, 100);
    },

    // 5. Complex Strategy Logic (Timers, Sequences, Sensors)
    setupComplexStrategy(type, area, btn) {

        // Helper: Create Timer UI
        const createTimer = (duration, onTick, onComplete) => {
            area.innerHTML = `<div style="font-size:4rem; margin-bottom:10px;" id="strategyIcon"></div><div id="strategyText" style="font-size:1.1rem; font-weight:600; margin-bottom:20px; min-height:50px;"></div><div style="font-size:2rem; font-weight:800; color:#3b82f6;" id="strategyTimer"></div>`;
            let time = duration;
            const update = () => {
                const m = Math.floor(time / 60);
                const s = time % 60;
                const tEl = document.getElementById('strategyTimer');
                if (tEl) tEl.innerText = `${m}:${s < 10 ? '0' + s : s}`;
                if (onTick) onTick(duration - time);
            };
            update();
            this.currentInterval = setInterval(() => {
                time--;
                if (time <= 0) { clearInterval(this.currentInterval); if (onComplete) onComplete(); }
                update();
            }, 1000);
        };

        if (type === 'Take a Walk') {
            createTimer(300, (elapsed) => {
                const text = document.getElementById('strategyText');
                const icon = document.getElementById('strategyIcon');
                if (!text) return;

                // 💡 Animation Update
                const container = document.getElementById('strategyIcon').parentElement.parentElement; // Roughly get container
                if (container) container.classList.add('walking-bg');

                icon.innerText = '🏃';
                icon.classList.add('walking-active');

                if (elapsed < 60) text.innerText = "Let's start walking at a steady pace.";
                else if (elapsed === 60) { text.innerText = "Feel your feet on the ground."; if (window.navigator.vibrate) window.navigator.vibrate(200); }
                else if (elapsed === 150) { text.innerText = "What do you see around you?"; if (window.navigator.vibrate) window.navigator.vibrate(200); }
                else if (elapsed === 240) { text.innerText = "Is your body loosening up?"; if (window.navigator.vibrate) window.navigator.vibrate(200); }
            }, () => this.completeAction('silver', 30));
            if (btn) { btn.textContent = "Finished Walking (+30 XP)"; btn.onclick = () => this.completeAction('silver', 30); }
        }
        else if (type === 'Fresh Air') {
            const steps = [
                { t: 0, text: "Open a window or go outside.", icon: "🚪" },
                { t: 20, text: "Breathe the fresh air deeply.", icon: "🌬️" },
                { t: 50, text: "Feel the temperature on your skin.", icon: "🌡️" },
                { t: 80, text: "Listen to the sounds outdoors.", icon: "👂" },
                { t: 110, text: "Come back inside, feeling refreshed.", icon: "🏡" }
            ];
            createTimer(120, (elapsed) => {
                const step = steps.slice().reverse().find(s => elapsed >= s.t);
                if (step) {
                    document.getElementById('strategyText').innerText = step.text;
                    document.getElementById('strategyIcon').innerText = step.icon;
                }
            }, () => this.completeAction('silver', 30));
            if (btn) { btn.textContent = "I'm Refreshed (+30 XP)"; btn.onclick = () => this.completeAction('silver', 30); }
        }
        else if (type === 'Mindful Moment' || type === 'Comfort Object') {
            const isMindful = type === 'Mindful Moment';
            const duration = 60;
            const steps = isMindful ? [
                { t: 0, text: "Close your eyes...", icon: "😌" },
                { t: 12, text: "Notice your body...", icon: "🧘" },
                { t: 24, text: "Feel the calm in your chest...", icon: "🫁" },
                { t: 36, text: "Smile gently...", icon: "🙂" },
                { t: 48, text: "Enjoy this moment...", icon: "✨" }
            ] : [
                { t: 0, text: "Find something soft.", icon: "🧸" },
                { t: 12, text: "Hold it close.", icon: "🤗" },
                { t: 24, text: "Notice the texture.", icon: "🖐️" },
                { t: 36, text: "Take 3 deep breaths.", icon: "🌬️" },
                { t: 48, text: "Stay as long as you need.", icon: "💙" }
            ];
            createTimer(duration, (elapsed) => {
                const step = steps.slice().reverse().find(s => elapsed >= s.t);
                if (step) {
                    document.getElementById('strategyText').innerText = step.text;
                    document.getElementById('strategyIcon').innerText = step.icon;
                }
            }, () => this.completeAction('gold', 60));
            if (btn) { btn.textContent = "Done (+60 XP)"; btn.onclick = () => this.completeAction('gold', 60); }
        }
        else if (type === 'Energy Shake') {
            const rounds = [
                { name: "Arm Shake! 👋", icon: "👋" },
                { name: "Jump! 🦘", icon: "🦘" },
                { name: "Body Twist! 🌪️", icon: "🌪️" },
                { name: "Deep Breath! 😤", icon: "😤" }
            ];
            let round = 0;
            let timeLeft = 15;
            area.innerHTML = `<div style="font-size:5rem;" id="shakeIcon">👋</div><h3 id="shakeTitle">Arm Shake!</h3><div style="font-size:3rem; font-weight:800; color:#ea580c;" id="shakeTimer">15</div>`;

            this.currentInterval = setInterval(() => {
                timeLeft--;
                if (document.getElementById('shakeTimer')) document.getElementById('shakeTimer').innerText = timeLeft;

                // 💡 Add Shake Animation
                const iconEl = document.getElementById('shakeIcon');
                if (iconEl) iconEl.classList.add('shake-active');

                if (timeLeft <= 0) {
                    round++;
                    if (iconEl) iconEl.classList.remove('shake-active'); // Stop shaking during break

                    if (round >= 4) {
                        clearInterval(this.currentInterval);
                        this.completeAction('gold', 60);
                        return;
                    }
                    timeLeft = 15;
                    const r = rounds[round];
                    document.getElementById('shakeIcon').innerText = r.icon;
                    document.getElementById('shakeTitle').innerText = r.name;
                    if (window.navigator.vibrate) window.navigator.vibrate(500);
                }
            }, 1000);
            if (btn) { btn.textContent = "Skip to Done (+60 XP)"; btn.onclick = () => this.completeAction('gold', 60); }
        }
        else if (type === 'Drink Water') {
            let taps = 0;
            area.innerHTML = `
                <div style="width:100px; height:150px; border:4px solid #3b82f6; border-top:none; border-radius:0 0 20px 20px; margin:0 auto; position:relative; overflow:hidden;" onclick="document.getElementById('waterBtn').click()">
                    <div id="waterFill" style="width:100%; height:0%; background:#60a5fa; position:absolute; bottom:0; transition:height 0.3s;"></div>
                </div>
                <p style="margin-top:20px;">Tap to fill! (<span id="waterCount">0</span>/4)</p>
                <button id="waterBtn" style="display:none;"></button>
            `;
            document.getElementById('waterBtn').onclick = () => {
                taps++;
                document.getElementById('waterFill').style.height = (taps * 25) + '%';
                document.getElementById('waterCount').innerText = taps;
                if (typeof playSound === 'function') playSound('tap');
                if (taps >= 4) {
                    setTimeout(() => this.completeAction('gold', 60), 500);
                }
            };
            if (btn) btn.style.display = 'none'; // Replaced by interaction
        }
        else if (type === 'Count to Calm') {
            area.innerHTML = `<div style="font-size:5rem; font-weight:800; color:#3b82f6;" id="countDisplay">1</div><p>Count slowly with me...</p>`;
            let count = 1;
            this.currentInterval = setInterval(() => {
                count++;
                if (count > 10) count = 1;
                const el = document.getElementById('countDisplay');
                if (el) { el.innerText = count; el.style.transform = 'scale(1.2)'; setTimeout(() => el.style.transform = 'scale(1)', 200); }
                if (typeof playSound === 'function') playSound('tick');
            }, 1000);
            if (btn) { btn.textContent = "I'm Calm Now (+60 XP)"; btn.onclick = () => this.completeAction('gold', 60); }
        }
    },

    // 5. 세부 활동 상세 구현 (총 408줄 분량 로직 보존)
    startCaptureAction() {
        const area = document.getElementById('inAppActionArea');
        document.getElementById('activityBtn').style.display = 'none';
        area.innerHTML = `
            <div id="cameraModule" style="text-align:center;">
                <div id="videoContainer" style="position:relative; width:92%; margin:0 auto; aspect-ratio:3/4; background:#000; border-radius:32px; overflow:hidden;">
                    <video id="webcam" autoplay playsinline style="width:100%; height:100%; object-fit:cover; transform: ${this.currentFacingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'};"></video>
                    <div id="photoPreview" style="display:none; position:absolute; top:0; left:0; width:100%; height:100%; background-size:cover; background-position:center; z-index:10;"></div>
                </div>
                <div style="margin-top:20px; display:flex; flex-direction:column; gap:12px; padding:0 24px;">
                    <button id="snapBtn" class="btn-primary" style="margin:0; height:65px;">📸 Take Photo</button>
                    <button id="switchBtn" class="btn-secondary" style="background:white; border:none; padding:12px; border-radius:15px; font-weight:700;">🔄 Flip Camera</button>
                    <button id="retakeBtn" style="display:none; background:#475569; color:white; border:none; padding:18px; border-radius:24px;">🔄 Try Again</button>
                    <div id="shareOptions" style="display:none; flex-direction:column; gap:10px;">
                        <input type="text" id="photoCaption" placeholder="Add a caption..." style="width:100%; padding:15px; border-radius:15px; border:2px solid #e2e8f0;">
                        <button id="shareSmsBtn" style="background:#4ade80; color:#064e3b; padding:18px; border-radius:24px; font-weight:900; border:none;">💬 Share with Family</button>
                        <button id="skipShareBtn" style="background:#cbd5e1; color:#475569; padding:18px; border-radius:24px; font-weight:700; border:none;">Just Save</button>
                    </div>
                </div>
                <canvas id="hiddenCanvas" style="display:none;"></canvas>
            </div>`;

        const video = document.getElementById('webcam');
        const canvas = document.getElementById('hiddenCanvas');
        const preview = document.getElementById('photoPreview');
        const snapBtn = document.getElementById('snapBtn');
        const switchBtn = document.getElementById('switchBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const shareOptions = document.getElementById('shareOptions');

        const startStream = async () => {
            if (this.currentStream) this.currentStream.getTracks().forEach(t => t.stop());
            try {
                this.currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.currentFacingMode } });
                video.srcObject = this.currentStream;
            } catch (err) { area.innerHTML = `<div style=\"padding:40px;\">😢 Camera blocked.</div>`; }
        };

        snapBtn.onclick = () => {
            this.feedback('success');
            canvas.width = video.videoWidth; canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (this.currentFacingMode === 'user') { ctx.translate(canvas.width, 0); ctx.scale(-1, 1); }
            ctx.drawImage(video, 0, 0);
            window.lastCapturedPhoto = canvas.toDataURL('image/png');
            preview.style.backgroundImage = `url(${window.lastCapturedPhoto})`; preview.style.display = 'block';
            snapBtn.style.display = 'none'; switchBtn.style.display = 'none';
            retakeBtn.style.display = 'block'; shareOptions.style.display = 'flex';
        };

        retakeBtn.onclick = () => { preview.style.display = 'none'; snapBtn.style.display = 'block'; switchBtn.style.display = 'block'; retakeBtn.style.display = 'none'; shareOptions.style.display = 'none'; };
        switchBtn.onclick = () => { this.currentFacingMode = (this.currentFacingMode === 'user' ? 'environment' : 'user'); startStream(); };

        document.getElementById('shareSmsBtn').onclick = () => {
            const caption = document.getElementById('photoCaption').value;
            window.location.href = `sms:?&body=${encodeURIComponent("I just took a photo! 📸 " + caption)}`;
            this.completeAction('gold', 60);
        };
        document.getElementById('skipShareBtn').onclick = () => this.completeAction('gold', 60);

        startStream();
    },

    startHappyWriteAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="padding:24px;">
                <h2 style="font-weight:850; margin-bottom:15px;">Happy Note</h2>
                <textarea id="actionNote" style="width:100%; height:180px; border-radius:24px; padding:20px; border:3px solid #e2e8f0; font-size:1.1rem;" placeholder="What made you happy?"></textarea>
                <div style="margin-top:20px; display:flex; flex-direction:column; gap:10px;">
                    <button id="shareNoteBtn" class="btn-primary" style="margin:0; background:#4ade80; color:#064e3b;">💬 Share with Family</button>
                    <button id="saveNoteBtn" class="btn-secondary" style="margin:0;">Just Save</button>
                </div>
            </div>`;

        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none'; // Hide default button

        document.getElementById('shareNoteBtn').onclick = () => {
            const note = document.getElementById('actionNote').value;
            window.location.href = `sms:?&body=${encodeURIComponent("Happy Moment: " + note)}`;
            this.completeAction('gold', 60);
        };
        document.getElementById('saveNoteBtn').onclick = () => this.completeAction('gold', 60);
    },

    startBreathingAnimation() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.app-header'); // Fixed Selector
        if (headerEl) headerEl.style.display = 'none';

        area.innerHTML = `
            <div style="padding:40px 24px; text-align:center;">
                <div id="lungCircle" style="width:140px; height:140px; margin:0 auto; background:rgba(124,58,237,0.15); border-radius:50%; border:6px solid #7c3aed; transition:all 4s ease-in-out; display:flex; justify-content:center; align-items:center; font-size:4.5rem;">🫁</div>
                <h2 id="breathStatus" style="margin-top:40px; font-weight:850; color:#7c3aed; font-size:2.2rem;">Ready...</h2>
            </div>`;
        const l = document.getElementById('lungCircle');
        const s = document.getElementById('breathStatus');
        const anim = () => {
            if (!l || !document.getElementById('lungCircle')) return;
            this.feedback('tap'); s.textContent = "Inhale... 🌬️"; l.style.transform = "scale(2.2)";
            this.currentInterval = setTimeout(() => {
                if (!l) return;
                this.feedback('tick'); s.textContent = "Exhale... 💨"; l.style.transform = "scale(1)";
                this.activeTimeouts.push(setTimeout(anim, 4500));
            }, 4000);
        };
        setTimeout(anim, 1000);
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "I'm Calm Now 🥈"; btn.onclick = () => this.completeAction('silver', 30); }
    },

    startGroundingAnimation() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.app-header'); // Fixed Selector
        if (headerEl) headerEl.style.display = 'none';

        const steps = [
            { n: 5, s: 'SEE 👀', c: '#3b82f6' }, { n: 4, s: 'TOUCH ✋', c: '#10b981' },
            { n: 3, s: 'HEAR 👂', c: '#f59e0b' }, { n: 2, s: 'SMELL 👃', c: '#8b5cf6' }, { n: 1, s: 'TASTE 👅', c: '#ef4444' }
        ];
        const render = (i) => {
            const s = steps[i];
            area.innerHTML = `
                <div style="text-align:center; padding:40px 24px;" class="animate-pop">
                    <div style="font-size:5rem; font-weight:900; color:${s.c}; margin-bottom:20px;">${s.n}</div>
                    <h2 style="font-weight:850; color:#1e293b;">Things you ${s.s}</h2>
                    <button id="nextG" class="btn-primary" style="margin-top:40px; background:${s.c}; border:none;">${i === 4 ? 'Finish Mission' : 'Next Step'}</button>
                </div>`;
            document.getElementById('nextG').onclick = () => {
                this.feedback('tap');
                if (i < 4) render(i + 1);
                else this.completeAction('silver', 30);
            };
        };
        render(0);
    },

    startPushWallAction() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.app-header'); // Fixed Selector
        if (headerEl) headerEl.style.display = 'none';

        area.innerHTML = `<div style="text-align:center; padding:40px 24px;"><div id="pCir" style="width:140px; height:140px; margin:0 auto; border:10px solid #ef4444; border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:4rem; font-weight:900; color:#ef4444; background:rgba(239,68,68,0.05);">10</div><h2 style="margin-top:30px; font-weight:850;">PUSH THE WALL!</h2></div>`;
        let t = 10;
        this.currentInterval = setInterval(() => {
            const cir = document.getElementById('pCir');
            if (!cir) return clearInterval(this.currentInterval);
            t--; cir.textContent = t; this.feedback('tick');
            if (t <= 0) {
                clearInterval(this.currentInterval);
                cir.textContent = "💪"; cir.style.borderColor = "#10b981"; cir.style.color = "#10b981";
                const btn = document.getElementById('activityBtn');
                if (btn) { btn.textContent = "Done! 🥈"; btn.onclick = () => this.completeAction('silver', 30); }
            }
        }, 1000);
    },

    startSqueezeAction() {
        // 💡 Use new SqueezeRelease logic instead
        this.startSqueezeRelease();
    },

    startBigHugTimer() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.activity-header');
        if (headerEl) headerEl.style.display = 'none';

        area.innerHTML = `<div style=\"text-align:center; padding:60px 24px;\"><div style=\"font-size:7rem; margin-bottom:20px;\">🫂</div><h2 id=\"hT\" style=\"font-size:4rem; font-weight:900; color:#7c3aed;\">10</h2><p style=\"font-weight:850;\">Hold a BIG hug!</p></div>`;
        let tl = 10;
        this.currentInterval = setInterval(() => {
            tl--; const el = document.getElementById('hT');
            if (!el) return clearInterval(this.currentInterval);
            el.textContent = tl; this.feedback('tick');
            if (tl <= 0) { clearInterval(this.currentInterval); this.completeAction('silver', 30); }
        }, 1000);
    },

    startRestAction(t) {
        const area = document.getElementById('inAppActionArea');
        const icon = t.includes('Meditation') ? '🧘' : '🛌';
        area.innerHTML = `<div style=\"text-align:center; padding:60px 24px;\"><div style=\"font-size:7rem; margin-bottom:30px; animation:pulse 2s infinite;\">${icon}</div><h2 style=\"font-weight:850;\">${t}</h2></div>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Finished! 🏅"; btn.onclick = () => this.completeAction(t.includes('Nap') ? 'gold' : 'silver', t.includes('Nap') ? 60 : 30); }
    },

    startSMSAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style=\"padding:24px;\"><h2 style=\"font-weight:850; margin-bottom:15px;\">Share Joy</h2><textarea id=\"actionNote\" style=\"width:100%; height:120px; border-radius:20px; padding:15px; border:2px solid #e2e8f0;\">I'm feeling good today! ✨</textarea></div>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Send SMS 🥈"; btn.onclick = () => { window.location.href = `sms:?&body=${encodeURIComponent(document.getElementById('actionNote').value)}`; this.completeAction('silver', 30); }; }
    },

    startWriteAction(type) {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style=\"padding:24px;\"><h2 style=\"font-weight:850; margin-bottom:15px;\">${type}</h2><textarea id=\"actionNote\" style=\"width:100%; height:180px; border-radius:24px; padding:20px; border:3px solid #e2e8f0; font-size:1.1rem;\" placeholder=\"What's on your mind?\"></textarea></div>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Save! 🥈"; btn.onclick = () => this.completeAction('silver', 30); }
    },

    startMusicAction() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style=\"text-align:center; padding:40px;\"><div style=\"font-size:6rem; margin-bottom:20px;\">🎵</div><button class=\"btn-primary\" style=\"background:#FF0000;\" onclick=\"window.open('https://www.youtube.com/results?search_query=relaxing+music', '_blank')\">📺 Open YouTube</button></div>`;
        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "Finished! 🥈"; btn.onclick = () => this.completeAction('silver', 30); }
    },

    startBodyScan() {
        const area = document.getElementById('inAppActionArea');
        // 💡 Hide duplicated title header for this immersive activity
        const headerEl = document.querySelector('.activity-header');
        if (headerEl) headerEl.style.display = 'none';

        area.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <!-- Fixed SVG string quoting -->
                <div style="width:200px; height:300px; margin:0 auto; background-image: url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 200\\'><path d=\\'M50 20 C50 10 60 10 60 20 C60 30 50 30 50 20 M50 30 L50 80 M20 40 L50 40 L80 40 M20 40 L20 70 M80 40 L80 70 M50 80 L30 140 M50 80 L70 140 M30 140 L30 180 M70 140 L70 180\\' stroke=\\'%23cbd5e1\\' stroke-width=\\'4\\' fill=\\'none\\' stroke-linecap=\\'round\\' /></svg>'); background-repeat: no-repeat; background-position: center; background-size: contain; position:relative;">
                    <div class="body-node" id="node-head" style="top:10%; left:50%; width:20px; height:20px; background:#cbd5e1; border-radius:50%; position:absolute; transform:translate(-50%,-50%); transition:0.3s;"></div>
                    <div class="body-node" id="node-shoulders" style="top:25%; left:50%; width:20px; height:20px; background:#cbd5e1; border-radius:50%; position:absolute; transform:translate(-50%,-50%); transition:0.3s;"></div>
                    <div class="body-node" id="node-hands" style="top:45%; left:20%; width:20px; height:20px; background:#cbd5e1; border-radius:50%; position:absolute; transform:translate(-50%,-50%); transition:0.3s;"></div>
                    <div class="body-node" id="node-hands-r" style="top:45%; left:80%; width:20px; height:20px; background:#cbd5e1; border-radius:50%; position:absolute; transform:translate(-50%,-50%); transition:0.3s;"></div>
                    <div class="body-node" id="node-stomach" style="top:45%; left:50%; width:20px; height:20px; background:#cbd5e1; border-radius:50%; position:absolute; transform:translate(-50%,-50%); transition:0.3s;"></div>
                    <div class="body-node" id="node-feet" style="top:85%; left:35%; width:20px; height:20px; background:#cbd5e1; border-radius:50%; position:absolute; transform:translate(-50%,-50%); transition:0.3s;"></div>
                    <div class="body-node" id="node-feet-r" style="top:85%; left:65%; width:20px; height:20px; background:#cbd5e1; border-radius:50%; position:absolute; transform:translate(-50%,-50%); transition:0.3s;"></div>
                </div>
                <h2 id="bodyScanText" style="margin-top:20px; font-weight:850; color:#334155; min-height:60px;">Focus on your head...</h2>
            </div>
        `;

        const steps = [
            { id: ['node-head'], text: "Relax your head... Soften your face." },
            { id: ['node-shoulders'], text: "Drop your shoulders... Let go of tension." },
            { id: ['node-hands', 'node-hands-r'], text: "Unclench your hands... Let them float." },
            { id: ['node-stomach'], text: "Breathe into your stomach... Soft and easy." },
            { id: ['node-feet', 'node-feet-r'], text: "Feel your feet... Connected to the ground." }
        ];

        let index = -1;
        const nextStep = () => {
            index++;
            if (index >= steps.length) {
                this.completeAction('gold', 60);
                return;
            }

            document.querySelectorAll('.body-node').forEach(n => {
                n.style.background = '#cbd5e1'; n.style.transform = 'translate(-50%,-50%) scale(1)';
            });

            const s = steps[index];
            if (document.getElementById('bodyScanText')) document.getElementById('bodyScanText').textContent = s.text;

            s.id.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.background = '#3b82f6';
                    el.style.transform = 'translate(-50%,-50%) scale(1.5)';
                }
            });
            this.feedback('tick');

            this.activeTimeouts.push(setTimeout(nextStep, 4000));
        };

        // Start after slight delay
        this.activeTimeouts.push(setTimeout(nextStep, 1000));

        const btn = document.getElementById('activityBtn');
        if (btn) { btn.textContent = "I feel relaxed 🏅"; btn.onclick = () => this.completeAction('gold', 60); }
    },

    startAngryDrawing() {
        const area = document.getElementById('inAppActionArea');
        // 💡 Hide duplicated title header for this immersive activity
        const headerEl = document.querySelector('.activity-header');
        if (headerEl) headerEl.style.display = 'none';

        // Hide default padding for full canvas
        area.style.padding = '0';
        area.innerHTML = `
            <div id="drawingContainer" style="position:relative; height:350px; width:100%; overflow:hidden; border-radius:24px;">
                <canvas id="drawingCanvas" style="width:100%; height:100%;"></canvas>
                <div style="position:absolute; top:10px; right:10px; display:flex; gap:8px;">
                     <button onclick="Activities.setBrushColor('#000')" style="width:30px; height:30px; background:black; border-radius:50%; border:2px solid white;"></button>
                     <button onclick="Activities.setBrushColor('#ef4444')" style="width:30px; height:30px; background:#ef4444; border-radius:50%; border:2px solid white;"></button>
                </div>
                <div style="position:absolute; bottom:20px; left:50%; transform:translateX(-50%);">
                     <button class="btn-primary" style="background:#ef4444; margin:0; width:auto; padding:12px 24px;" onclick="Activities.crumpleAndToss()">Crumple & Toss! 🗑️</button>
                </div>
            </div>
            <p style="text-align:center; color:#64748b; margin-top:10px;">Scribble as fast as you can!</p>
        `;

        const canvas = document.getElementById('drawingCanvas');
        const ctx = canvas.getContext('2d');

        // Resize
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';

        let drawing = false;

        const start = (e) => { drawing = true; draw(e); };
        const end = () => { drawing = false; ctx.beginPath(); };
        const draw = (e) => {
            if (!drawing) return;
            const x = (e.clientX || e.touches[0].clientX) - rect.left;
            const y = (e.clientY || e.touches[0].clientY) - rect.top;

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);

            if (Math.random() > 0.8) this.feedback('tick'); // Haptic feedback on draw
        };

        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('touchstart', start);
        canvas.addEventListener('mouseup', end);
        canvas.addEventListener('touchend', end);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); }, { passive: false });

        this.setBrushColor = (c) => { ctx.strokeStyle = c; ctx.lineWidth = (c === '#000' ? 5 : 10); };

        this.crumpleAndToss = () => {
            const c = document.getElementById('drawingContainer');
            this.feedback('success');
            if (window.navigator.vibrate) window.navigator.vibrate(200);
            c.classList.add('crumple-effect');
            setTimeout(() => {
                c.style.display = 'none';
                this.completeAction('gold', 60);
            }, 800);
        };

        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';
    },

    startMeditation() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.activity-header');
        if (headerEl) headerEl.style.display = 'none';

        area.style.padding = '0';
        area.innerHTML = `
            <div style="padding:40px 24px; text-align:center;">
                <h2 style="font-weight:850; margin-bottom:10px;">Meditation Moment</h2>
                <div style="font-size:6rem; margin:30px 0; animation: float 3s ease-in-out infinite;">🧘‍♂️</div>
                <p id="meditationText" style="font-size:1.2rem; color:#475569; margin-bottom:40px; min-height:60px;">
                    Find a comfortable seat.<br>Close your eyes.
                </p>
                
                <div id="meditationTimer" style="font-size:2.5rem; font-weight:800; color:#3b82f6; margin-bottom:30px;">03:00</div>
                
                <button id="btnMeditation" class="btn-primary" onclick="Activities.runMeditationSession()">
                    Start Session
                </button>
            </div>
            <style>
                @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
            </style>
        `;

        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        this.runMeditationSession = () => {
            const timerEl = document.getElementById('meditationTimer');
            const textEl = document.getElementById('meditationText');
            const btnStart = document.getElementById('btnMeditation');

            if (btnStart) btnStart.style.display = 'none';

            // Audio (Drone)
            this.initAudio();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 150; // Low drone
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);

            // Binaural beat effect (L/R slightly off)
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.value = 155; // 5Hz Theta wave difference
            gain2.gain.setValueAtTime(0.1, audioCtx.currentTime);

            osc.connect(gain).connect(audioCtx.destination);
            osc2.connect(gain2).connect(audioCtx.destination);

            osc.start();
            osc2.start();

            this.currentAudioSource = { stop: () => { osc.stop(); osc2.stop(); }, disconnect: () => { gain.disconnect(); gain2.disconnect(); } };

            // Timer Logic
            let timeLeft = 180; // 3 Minutes
            textEl.innerText = "Focus on your breath...\nInhale... Exhale...";

            this.currentInterval = setInterval(() => {
                timeLeft--;
                const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const s = (timeLeft % 60).toString().padStart(2, '0');
                timerEl.innerText = `${m}:${s}`;

                // Guidance Text Updates
                if (timeLeft === 160) textEl.innerText = "Let go of any tension in your shoulders.";
                if (timeLeft === 120) textEl.innerText = "If your mind wanders, gently bring it back to your breath.";
                if (timeLeft === 60) textEl.innerText = "You are doing great. Just be present.";
                if (timeLeft === 10) textEl.innerText = "Slowly bring your awareness back.";

                if (timeLeft <= 0) {
                    clearInterval(this.currentInterval);
                    this.stopAll();
                    this.completeAction('gold', 60);
                }
            }, 1000);
        };
    },

    startCalmCatalog() {
        const area = document.getElementById('inAppActionArea');
        // 💡 Hide duplicated title header for this immersive activity
        const headerEl = document.querySelector('.activity-header');
        if (headerEl) headerEl.style.display = 'none';

        // Initialize State
        this.volume = 0.5;
        this.isPlaying = false;
        this.currentGainNode = null;

        area.style.padding = '0'; // Full width for scroll
        area.innerHTML = `
            <div style="padding:20px 24px 0;">
                <h2 style="font-weight:850; margin-bottom:10px;">Calm Catalog</h2>
                <p style="color:#64748b; margin-bottom:15px;">Swipe & Listen</p>
            </div>
            <div class="calm-gallery">
                <div class="calm-card" onclick="Activities.playSoundscape('rain', this)">
                    <div style="font-size:4rem;">🌧️</div>
                    <h3 style="font-weight:800; margin-top:20px;">Rainy Day</h3>
                    <p style="color:#64748b;">White Noise</p>
                </div>
                <div class="calm-card" onclick="Activities.playSoundscape('forest', this)">
                    <div style="font-size:4rem;">🌲</div>
                    <h3 style="font-weight:800; margin-top:20px;">Deep Forest</h3>
                    <p style="color:#64748b;">Pink Noise</p>
                </div>
                <div class="calm-card" onclick="Activities.playSoundscape('space', this)">
                    <div style="font-size:4rem;">🌌</div>
                    <h3 style="font-weight:800; margin-top:20px;">Galaxy</h3>
                    <p style="color:#64748b;">Deep Drone</p>
                </div>
            </div>

            <!-- 💡 New Controls -->
            <div id="calmControls" style="display:none; padding:20px; background:#f8fafc; border-top:1px solid #e2e8f0; text-align:center;">
                <div style="display:flex; justify-content:center; align-items:center; gap:20px; margin-bottom:15px;">
                     <button class="btn-control" onclick="Activities.adjustVolume(-0.1)" style="font-size:1.5rem;">🔉</button>
                     <span id="volDisplay" style="font-weight:800; color:#475569; width:50px;">50%</span>
                     <button class="btn-control" onclick="Activities.adjustVolume(0.1)" style="font-size:1.5rem;">🔊</button>
                </div>
                
                <button id="btnPlayPause" class="btn-primary" onclick="Activities.toggleAudio()" 
                        style="width:60px; height:60px; border-radius:50%; padding:0; display:flex; align-items:center; justify-content:center; font-size:2rem; margin:0 auto;">
                    ⏸️
                </button>
            </div>

            <div style="padding:20px; text-align:center;">
                 <button class="btn-primary" onclick="Activities.completeAction('gold', 60)">I feel calm now (+60 XP)</button>
            </div>
        `;

        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        // 💡 Control Methods
        this.adjustVolume = (delta) => {
            this.volume = Math.max(0, Math.min(1, this.volume + delta));

            // Update UI
            const volDisp = document.getElementById('volDisplay');
            if (volDisp) volDisp.innerText = Math.round(this.volume * 100) + "%";

            // Apply to Audio
            if (this.currentGainNode) {
                this.currentGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
                this.currentGainNode.gain.setValueAtTime(this.volume, audioCtx.currentTime);
            }
        };

        this.toggleAudio = () => {
            if (!audioCtx) return;
            const btn = document.getElementById('btnPlayPause');

            if (audioCtx.state === 'running') {
                audioCtx.suspend().then(() => {
                    this.isPlaying = false;
                    if (btn) btn.innerText = "▶️";
                    // Optional: visually dim the active card
                });
            } else if (audioCtx.state === 'suspended') {
                audioCtx.resume().then(() => {
                    this.isPlaying = true;
                    if (btn) btn.innerText = "⏸️";
                });
            }
        };

        // Soundscape Logic
        this.playSoundscape = (type, el) => {
            // Stop existing
            this.stopAll();
            this.initAudio();

            // UI Update
            document.querySelectorAll('.calm-card').forEach(c => c.classList.remove('active'));
            el.classList.add('active');

            // Show Controls
            const controls = document.getElementById('calmControls');
            if (controls) controls.style.display = 'block';

            // Reset Button to Pause (since we are starting)
            const btn = document.getElementById('btnPlayPause');
            if (btn) btn.innerText = "⏸️";

            // Generate Sound
            const gain = audioCtx.createGain();
            gain.gain.value = this.volume; // Apply current volume
            gain.connect(audioCtx.destination);

            this.currentGainNode = gain; // Store for volume control

            if (type === 'rain') {
                // White Noise
                const bufferSize = audioCtx.sampleRate * 2;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;

                // Filter for rain sound
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 800;

                noise.connect(filter);
                filter.connect(gain);

                noise.start();
                this.currentAudioSource = noise;
            }
            else if (type === 'forest') {
                // Pink Noise (approx)
                const bufferSize = audioCtx.sampleRate * 2;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                let b0, b1, b2, b3, b4, b5, b6;
                b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.96900 * b2 + white * 0.1538520;
                    b3 = 0.86650 * b3 + white * 0.3104856;
                    b4 = 0.55000 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.0168980;
                    data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    data[i] *= 0.11; // (roughly) compensate for gain
                    b6 = white * 0.115926;
                }
                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;
                noise.connect(gain);
                noise.start();
                this.currentAudioSource = noise;
            }
            else if (type === 'space') {
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = 100;
                // LFO for drone effect
                const lfo = audioCtx.createOscillator();
                lfo.type = 'sine';
                lfo.frequency.value = 0.2;
                const lfoGain = audioCtx.createGain();
                lfoGain.gain.value = 50;
                lfo.connect(lfoGain);
                lfoGain.connect(osc.frequency);
                lfo.start();

                osc.connect(gain);
                osc.start();
                this.currentAudioSource = osc;
                this.activeTimeouts.push(setTimeout(() => lfo.stop(), 99999));
            }

            // Register cleanup
            this.currentInterval = setInterval(() => { }, 1000); // Dummy to trigger stopAll cleanup rights
            const originalStop = this.currentAudioSource.stop.bind(this.currentAudioSource);
            this.currentAudioSource.stop = () => {
                try { originalStop(); } catch (e) { }
                gain.disconnect();
                this.currentGainNode = null;
            };
        };
    },

    startColdSqueezeAnimation() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `<div style=\"text-align:center; padding:60px 24px;\"><div style=\"font-size:7rem; animation:pulse 2s infinite;\">❄️</div><h2 style=\"font-weight:850; margin-top:20px;\">Hold Something Cold</h2></div>`;
        this.activeTimeouts.push(setTimeout(() => this.completeAction('silver', 30), 8000));
    },

    // 6. 보상 시퀀스
    completeAction(tier, xp) {
        if (typeof FeelFlow !== 'undefined' && FeelFlow.addXP) FeelFlow.addXP(xp, tier);
        this.showCelebration(tier, xp);
        setTimeout(() => { if (typeof window.finishCheckIn === 'function') window.finishCheckIn(); }, 2200);
    },

    showCelebration(tier, xp) {
        this.feedback('success');
        const burst = document.createElement('div');
        burst.className = 'xp-burst';
        burst.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:9999; text-align:center;";
        burst.innerHTML = `<div style=\"font-size:6rem;\">${tier === 'gold' ? '🥇' : '🥈'}</div><div style=\"font-weight:900; font-size:2rem; color:${tier === 'gold' ? '#FFD700' : '#7c3aed'};\">${tier.toUpperCase()}!<br>+${xp} XP</div>`;
        document.body.appendChild(burst);
        setTimeout(() => burst.remove(), 2500);
    },

    // 5. Activity Animations (Phase 5)

    // Calm: Mindful Moment
    startMindfulMoment() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.activity-header');
        if (headerEl) headerEl.style.display = 'none';

        area.style.background = "#1e293b"; // Dark mode
        area.style.color = "#fff";
        area.style.height = "100%";
        area.style.display = "flex";
        area.style.alignItems = "center";
        area.style.justifyContent = "center";

        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        const cards = [
            "Close your eyes...",
            "Notice your body...",
            "Feel the calm in your chest...",
            "Smile gently...",
            "Enjoy this moment."
        ];

        let idx = 0;

        const showCard = () => {
            if (idx >= cards.length) {
                // Done
                this.initAudio(); // Just for chime if avail
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.value = 880;
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
                osc.connect(gain).connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 1);

                this.completeAction('gold', 60);
                return;
            }

            area.innerHTML = `<div style="font-size:1.8rem; font-weight:300; text-align:center; animation:fadeIn 2s;">${cards[idx]}</div>`;
            idx++;
            this.activeTimeouts.push(setTimeout(showCard, 12000));
        };

        showCard();
    },

    // Calm: Gratitude
    startGratitude() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="padding:20px;">
                <h2 style="font-weight:850; margin-bottom:20px; text-align:center; color:#db2777;">Gratitude Garden</h2>
                <div id="garden" style="font-size:2rem; text-align:center; margin-bottom:20px; min-height:40px;">
                    ${localStorage.getItem('gratitudeGarden') || '🌱'}
                </div>
                
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <input id="gPerson" type="text" placeholder="A person I'm grateful for..." style="padding:15px; border-radius:12px; border:1px solid #e2e8f0; font-size:1rem;">
                    <input id="gThing" type="text" placeholder="A thing I'm grateful for..." style="padding:15px; border-radius:12px; border:1px solid #e2e8f0; font-size:1rem;">
                    <input id="gPlace" type="text" placeholder="A place I'm grateful for..." style="padding:15px; border-radius:12px; border:1px solid #e2e8f0; font-size:1rem;">
                </div>
                
                <button class="btn-primary" onclick="Activities.saveGratitude()" style="margin-top:20px; background:#db2777;">Plant Seeds (+50 XP)</button>
            </div>
        `;
        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        this.saveGratitude = () => {
            const p = document.getElementById('gPerson').value;
            const t = document.getElementById('gThing').value;
            const pl = document.getElementById('gPlace').value;

            if (!p && !t && !pl) return alert("Write at least one!");

            // Add flower
            const flowers = ['🌸', '🌼', '🌻', '🌷', '🌹', '🪷'];
            const f = flowers[Math.floor(Math.random() * flowers.length)];

            let currentGarden = localStorage.getItem('gratitudeGarden') || '';
            currentGarden += f;
            localStorage.setItem('gratitudeGarden', currentGarden);

            document.getElementById('garden').innerText = currentGarden;
            this.showCelebration('Garden Grown!', 50, 'silver');
            setTimeout(() => {
                const p = document.getElementById('gPerson').value;
                const t = document.getElementById('gThing').value;
                const pl = document.getElementById('gPlace').value;

                this.completeAction('silver', 50, {
                    category: 'Gratitude',
                    detail: 'Cultivated Garden',
                    garden: currentGarden,
                    inputs: [p, t, pl].filter(Boolean)
                });
            }, 1500);
        };
    },

    // Calm: Calm Catalog (Photo Version)
    startCalmCatalog() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <h2 style="font-weight:850; margin-bottom:10px;">Calm Collection</h2>
                <p style="color:#64748b; margin-bottom:30px;">Capture a peaceful moment.</p>
                
                <div style="width:200px; height:200px; background:#f1f5f9; border-radius:20px; margin:0 auto; display:flex; align-items:center; justify-content:center; border:2px dashed #cbd5e1; position:relative; overflow:hidden;">
                    <img id="previewImg" style="width:100%; height:100%; object-fit:cover; display:none;">
                    <div id="camIcon" style="font-size:3rem; color:#94a3b8;">📸</div>
                </div>
                
                <input type="file" accept="image/*" capture="environment" id="camInput" style="display:none;" onchange="Activities.handlePhoto(this)">
                
                <button class="btn-primary" onclick="document.getElementById('camInput').click()" style="margin-top:30px;">Open Camera</button>
            </div>
         `;
        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        this.handlePhoto = (input) => {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('previewImg').src = e.target.result;
                    document.getElementById('previewImg').style.display = 'block';
                    document.getElementById('camIcon').style.display = 'none';

                    // Simulate Saving
                    setTimeout(() => {
                        this.showCelebration('Added to Collection!', 30, 'silver');
                        setTimeout(() => this.completeAction('silver', 30), 1000);
                    }, 1500);
                };
                reader.readAsDataURL(input.files[0]);
            }
        };
    },

    startDrinkWater() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.activity-header');
        if (headerEl) headerEl.style.display = 'none';

        area.style.padding = '20px';
        area.innerHTML = `
            <div style="text-align:center; padding-top:20px;">
                <h2 style="font-weight:850; color:#3b82f6; margin-bottom:10px;">Hydrate</h2>
                <p style="color:#64748b; margin-bottom:30px;">Tap to fill the glass</p>
                
                <div id="waterContainer" style="width:120px; height:200px; border:4px solid #cbd5e1; border-top:none; border-radius:0 0 20px 20px; margin:0 auto; position:relative; overflow:hidden; background:#f8fafc; cursor:pointer;">
                    <div id="waterLevel" style="width:100%; height:0%; background:#60a5fa; position:absolute; bottom:0; transition:height 0.3s ease-out;"></div>
                    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); font-size:2rem; opacity:0.8; pointer-events:none;">💧</div>
                </div>
                
                <h3 id="waterText" style="margin-top:20px; font-weight:700;">0 / 4 Cups</h3>
            </div>
        `;

        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        let taps = 0;
        const maxTaps = 4;
        const container = document.getElementById('waterContainer');
        const level = document.getElementById('waterLevel');
        const text = document.getElementById('waterText');

        container.onclick = () => {
            if (taps >= maxTaps) return;
            taps++;
            level.style.height = (taps * 25) + "%";
            text.innerText = `${taps} / 4 Cups`;
            if (window.navigator.vibrate) window.navigator.vibrate(50);

            // Celebration
            if (taps === maxTaps) {
                text.innerText = "Refreshed!";
                text.style.color = "#3b82f6";
                setTimeout(() => {
                    this.showCelebration('Hydrated!', 60, 'gold');
                    setTimeout(() => this.completeAction('gold', 60), 2000);
                }, 500);
            }
        };
    },

    // Tired: Fresh Air
    startFreshAir() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <h2 style="font-weight:850; color:#10b981; margin-bottom:20px;">Fresh Air Break</h2>
                <div id="faIcon" style="font-size:5rem; margin:20px 0;">💨</div>
                <h3 id="faText" style="font-size:1.5rem; font-weight:700; color:#334155; min-height:60px;">Open a window or step outside.</h3>
                <div id="faTimer" style="font-size:2rem; font-weight:800; color:#10b981; margin-top:20px;">2:00</div>
            </div>
        `;
        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        const steps = [
            { t: 0, text: "Open a window or step outside.", icon: "🚪" },
            { t: 15, text: "Take a deep breath of fresh air.", icon: "😤" },
            { t: 45, text: "Feel the temperature on your skin.", icon: "🌡️" },
            { t: 75, text: "Listen to the sounds of nature.", icon: "👂" },
            { t: 105, text: "Slowly return inside, feeling energized.", icon: "🏠" }
        ];

        let timeLeft = 120;
        const timerEl = document.getElementById('faTimer');
        const textEl = document.getElementById('faText');
        const iconEl = document.getElementById('faIcon');

        this.currentInterval = setInterval(() => {
            timeLeft--;
            const m = Math.floor(timeLeft / 60);
            const s = (timeLeft % 60).toString().padStart(2, '0');
            timerEl.innerText = `${m}:${s}`;

            // Update Step
            const elapsed = 120 - timeLeft;
            const currentStep = steps.find(s => s.t === elapsed); // Simplified logic
            if (currentStep) {
                textEl.innerText = currentStep.text;
                iconEl.innerText = currentStep.icon;
                if (window.navigator.vibrate) window.navigator.vibrate(100);
            }

            if (timeLeft <= 0) {
                clearInterval(this.currentInterval);
                this.completeAction('gold', 60);
            }
        }, 1000);
    },

    // Tired: Energy Shake
    startEnergyShake() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <h2 style="font-weight:850; color:#f59e0b; margin-bottom:10px;">Energy Shake</h2>
                <div id="esIcon" style="font-size:6rem; margin:20px 0; animation:shake 0.5s infinite;">👐</div>
                <h3 id="esText" style="font-size:1.8rem; font-weight:900; color:#334155;">Shake your arms!</h3>
                <div style="width:100%; height:10px; background:#e2e8f0; border-radius:5px; margin-top:20px;">
                    <div id="esBar" style="width:100%; height:100%; background:#f59e0b; transition:width 1s linear;"></div>
                </div>
            </div>
            <style>@keyframes shake { 0% { transform: rotate(0deg); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } 100% { transform: rotate(0deg); } }</style>
        `;
        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        const rounds = [
            { text: "Shake your arms!", icon: "👐", color: "#f59e0b" },
            { text: "Jump in place!", icon: "🏃", color: "#ef4444" },
            { text: "Twist your body!", icon: "🌪️", color: "#8b5cf6" },
            { text: "Deep breath... relax.", icon: "🌬️", color: "#10b981", noAnim: true }
        ];

        let rIdx = 0;
        let timeLeft = 15;

        const runRound = () => {
            const round = rounds[rIdx];
            document.getElementById('esText').innerText = round.text;
            document.getElementById('esIcon').innerText = round.icon;
            document.getElementById('esIcon').style.animation = round.noAnim ? "none" : "shake 0.5s infinite";
            document.getElementById('esBar').style.background = round.color;

            timeLeft = 15;
            const int = setInterval(() => {
                timeLeft--;
                const pct = (timeLeft / 15) * 100;
                document.getElementById('esBar').style.width = pct + "%";

                if (timeLeft <= 0) {
                    clearInterval(int);
                    rIdx++;
                    if (rIdx < rounds.length) {
                        runRound();
                    } else {
                        this.completeAction('gold', 60);
                    }
                }
            }, 1000);
            this.currentInterval = int;
        };

        runRound();
    },

    // Calm: Mindful Moment
    startMindfulMoment() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.activity-header');
        if (headerEl) headerEl.style.display = 'none';

        area.style.background = "#1e293b"; // Dark mode
        area.style.color = "#fff";
        area.style.height = "100%";
        area.style.display = "flex";
        area.style.alignItems = "center";
        area.style.justifyContent = "center";

        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        const cards = [
            "Close your eyes...",
            "Notice your body...",
            "Feel the calm in your chest...",
            "Smile gently...",
            "Enjoy this moment."
        ];

        let idx = 0;

        const showCard = () => {
            if (idx >= cards.length) {
                // Done
                this.initAudio(); // Just for chime if avail
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = "sine";
                osc.frequency.value = 880;
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
                osc.connect(gain).connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + 1);

                this.completeAction('gold', 60);
                return;
            }

            area.innerHTML = `<div style="font-size:1.8rem; font-weight:300; text-align:center; animation:fadeIn 2s;">${cards[idx]}</div>`;
            idx++;
            this.activeTimeouts.push(setTimeout(showCard, 12000));
        };

        showCard();
    },

    // Calm: Gratitude
    startGratitude() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="padding:20px;">
                <h2 style="font-weight:850; margin-bottom:20px; text-align:center; color:#db2777;">Gratitude Garden</h2>
                <div id="garden" style="font-size:2rem; text-align:center; margin-bottom:20px; min-height:40px;">
                    ${localStorage.getItem('gratitudeGarden') || '🌱'}
                </div>
                
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <input id="gPerson" type="text" placeholder="A person I'm grateful for..." style="padding:15px; border-radius:12px; border:1px solid #e2e8f0; font-size:1rem;">
                    <input id="gThing" type="text" placeholder="A thing I'm grateful for..." style="padding:15px; border-radius:12px; border:1px solid #e2e8f0; font-size:1rem;">
                    <input id="gPlace" type="text" placeholder="A place I'm grateful for..." style="padding:15px; border-radius:12px; border:1px solid #e2e8f0; font-size:1rem;">
                </div>
                
                <button class="btn-primary" onclick="Activities.saveGratitude()" style="margin-top:20px; background:#db2777;">Plant Seeds (+50 XP)</button>
            </div>
        `;
        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        this.saveGratitude = () => {
            const p = document.getElementById('gPerson').value;
            const t = document.getElementById('gThing').value;
            const pl = document.getElementById('gPlace').value;

            if (!p && !t && !pl) return alert("Write at least one!");

            // Add flower
            const flowers = ['🌸', '🌼', '🌻', '🌷', '🌹', '🪷'];
            const f = flowers[Math.floor(Math.random() * flowers.length)];

            let currentGarden = localStorage.getItem('gratitudeGarden') || '';
            currentGarden += f;
            localStorage.setItem('gratitudeGarden', currentGarden);

            document.getElementById('garden').innerText = currentGarden;
            this.showCelebration('Garden Grown!', 50, 'silver');
            setTimeout(() => this.completeAction('silver', 50), 1500);
        };
    },

    // Calm: Calm Catalog (Photo Version)
    startCalmCatalog() {
        const area = document.getElementById('inAppActionArea');
        area.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <h2 style="font-weight:850; margin-bottom:10px;">Calm Collection</h2>
                <p style="color:#64748b; margin-bottom:30px;">Capture a peaceful moment.</p>
                
                <div style="width:200px; height:200px; background:#f1f5f9; border-radius:20px; margin:0 auto; display:flex; align-items:center; justify-content:center; border:2px dashed #cbd5e1; position:relative; overflow:hidden;">
                    <img id="previewImg" style="width:100%; height:100%; object-fit:cover; display:none;">
                    <div id="camIcon" style="font-size:3rem; color:#94a3b8;">📸</div>
                </div>
                
                <input type="file" accept="image/*" capture="environment" id="camInput" style="display:none;" onchange="Activities.handlePhoto(this)">
                
                <button class="btn-primary" onclick="document.getElementById('camInput').click()" style="margin-top:30px;">Open Camera</button>
            </div>
         `;
        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        this.handlePhoto = (input) => {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('previewImg').src = e.target.result;
                    document.getElementById('previewImg').style.display = 'block';
                    document.getElementById('camIcon').style.display = 'none';

                    // Simulate Saving
                    setTimeout(() => {
                        this.showCelebration('Added to Collection!', 30, 'silver');
                        setTimeout(() => this.completeAction('silver', 30), 1000);
                    }, 1500);
                };
                reader.readAsDataURL(input.files[0]);
            }
        };
    },

    startSqueezeRelease() {
        const area = document.getElementById('inAppActionArea');
        let round = 1;
        const totalRounds = 3;

        area.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <h2 style="margin-bottom:10px; font-weight:800; color:#334155;">Round <span id="sqRound">1</span>/3</h2>
                <div id="squeezeEmoji" style="font-size:8rem; margin:20px 0; transition:transform 0.2s;">✋</div>
                <h3 id="sqStatus" style="font-size:2rem; font-weight:900; color:#3b82f6; min-height:40px;">Relax...</h3>
                
                <div style="width:80%; height:20px; background:#e2e8f0; margin:30px auto; border-radius:10px; overflow:hidden;">
                    <div id="sqBar" style="width:0%; height:100%; background:#ef4444; transition:width 0.1s linear;"></div>
                </div>
            </div>
        `;

        const emoji = document.getElementById('squeezeEmoji');
        const status = document.getElementById('sqStatus');
        const bar = document.getElementById('sqBar');
        const roundDisplay = document.getElementById('sqRound');

        const runCycle = () => {
            if (round > totalRounds) {
                this.completeAction('silver', 30);
                return;
            }
            roundDisplay.innerText = round;

            // SQUEEZE Phase (5s)
            status.innerText = "SQUEEZE!";
            status.style.color = "#ef4444";
            emoji.innerText = "✊";
            emoji.style.transform = "scale(0.8)";
            bar.style.background = "#ef4444";

            let p = 0;
            const squeezeInt = setInterval(() => {
                p += 2; // 50 * 2 = 100% in 50 steps (100ms * 50 = 5s)
                if (p > 100) p = 100;
                bar.style.width = p + "%";

                // Haptic Pulse
                if (p % 20 === 0 && window.navigator.vibrate) window.navigator.vibrate(50);
            }, 100);

            this.activeTimeouts.push(setTimeout(() => {
                clearInterval(squeezeInt);

                // RELEASE Phase (5s)
                status.innerText = "RELEASE...";
                status.style.color = "#3b82f6";
                emoji.innerText = "✋";
                emoji.style.transform = "scale(1.1)";
                bar.style.background = "#3b82f6";
                if (window.navigator.vibrate) window.navigator.vibrate([100, 50, 100]); // Sigh pattern

                let r = 100;
                const releaseInt = setInterval(() => {
                    r -= 2;
                    if (r < 0) r = 0;
                    bar.style.width = r + "%";
                }, 100);

                this.activeTimeouts.push(setTimeout(() => {
                    clearInterval(releaseInt);
                    round++;
                    runCycle();
                }, 5000));

            }, 5000));
        };

        // Start after 1s delay
        this.activeTimeouts.push(setTimeout(runCycle, 1000));

        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';
    },

    startDeepBreathing() {
        const area = document.getElementById('inAppActionArea');
        // Step 1: Selection
        area.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <h2 style="margin-bottom:30px; font-weight:800;">Choose Pattern</h2>
                <button class="btn-primary" onclick="Activities.runBreathingSession('box')" style="background:#8b5cf6; margin-bottom:15px;">📦 Box Breathing (4-4-4-4)</button>
                <button class="btn-primary" onclick="Activities.runBreathingSession('478')" style="background:#ec4899;">🌙 4-7-8 Calm</button>
            </div>
        `;
        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        this.runBreathingSession = (pattern) => {
            let rounds = 5;
            let currentRound = 1;

            area.innerHTML = `
                <div style="padding:20px; text-align:center; position:relative; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden;">
                    <!-- Lungs Container -->
                    <div id="bCircle" style="font-size:8rem; transition: transform 1s ease-in-out; display:flex; align-items:center; justify-content:center; position:relative; width:auto; height:auto; background:transparent;">
                        🫁
                        <!-- Timer centered in lungs -->
                        <span id="bTimer" style="position:absolute; font-size:2rem; font-weight:800; color:#fff; text-shadow:0 2px 4px rgba(0,0,0,0.3);">4</span>
                    </div>
                    
                    <!-- Text below, with margin to avoid overlap when scaled -->
                    <h2 id="bText" style="margin-top:60px; font-weight:800; color:#4b5563; min-height:40px; z-index:10; position:relative;">Get Ready...</h2>
                    
                    <div id="bDots" style="margin-top:20px; display:flex; gap:8px;">
                        ${Array(rounds).fill(0).map((_, i) => `<div class="b-dot" id="dot-${i}" style="width:12px; height:12px; background:#e2e8f0; border-radius:50%;"></div>`).join('')}
                    </div>
                </div>
            `;

            const circle = document.getElementById('bCircle');
            const timer = document.getElementById('bTimer');
            const text = document.getElementById('bText');

            const tick = (sec, label, scale, color, next) => {
                text.innerText = label;
                circle.style.transform = `scale(${scale})`;
                // Remove background color change since we use emoji
                // circle.style.backgroundColor = color; 

                let t = sec;
                timer.innerText = t;

                const int = setInterval(() => {
                    t--;
                    if (t < 0) {
                        clearInterval(int);
                        next();
                    } else {
                        timer.innerText = t;
                    }
                }, 1000);
                this.activeTimeouts.push(setTimeout(() => clearInterval(int), (sec + 1) * 1000));
            };

            const runRound = () => {
                if (currentRound > rounds) {
                    this.finishBreathing();
                    return;
                }

                // Update dots
                document.querySelectorAll('.b-dot').forEach((d, i) => d.style.background = i < currentRound ? '#7c3aed' : '#e2e8f0');

                if (pattern === 'box') {
                    // Inhale 4 (Scale 1 -> 1.5) - Reduced scale for emoji to fit
                    tick(4, "Inhale...", 1.5, null, () => {
                        // Hold 4
                        tick(4, "Hold...", 1.5, null, () => {
                            // Exhale 4
                            tick(4, "Exhale...", 1.0, null, () => {
                                // Hold 4
                                tick(4, "Hold...", 1.0, null, () => {
                                    currentRound++;
                                    runRound();
                                });
                            });
                        });
                    });
                } else {
                    // 4-7-8 Pattern
                    // Inhale 4
                    tick(4, "Inhale...", 1.5, null, () => {
                        // Hold 7
                        tick(7, "Hold...", 1.5, null, () => {
                            // Exhale 8
                            tick(8, "Exhale...", 1.0, null, () => {
                                currentRound++;
                                runRound();
                            });
                        });
                    });
                }
            };

            setTimeout(runRound, 1000);
        };

        this.finishBreathing = () => {
            area.innerHTML = `
                <div style="padding:30px; text-align:center;">
                    <h2 style="margin-bottom:20px;">How do you feel?</h2>
                    <div style="font-size:4rem; margin-bottom:30px;">😌</div>
                    <div style="display:flex; gap:10px; justify-content:center;">
                         <button class="btn-primary" onclick="Activities.completeAction('gold', 60, { category: 'Breathing', detail: 'Deep Breathing Session' })">Much Better</button>
                    </div>
                </div>
            `;
        };
    },

    // Sad: Listen to Music (Full Audio Engine)
    startListenToMusic() {
        const area = document.getElementById('inAppActionArea');
        const headerEl = document.querySelector('.activity-header');
        if (headerEl) headerEl.style.display = 'none'; // Hide generic header

        // Default State
        this.musicState = {
            type: null,
            volume: 0.5,
            timer: null,
            timerDuration: 0,
            isFavorite: false
        };

        // Load Favorites
        const fav = localStorage.getItem('musicFavorite');
        if (fav) {
            try {
                const parsed = JSON.parse(fav);
                this.musicState.type = parsed.type;
                this.musicState.volume = parsed.volume || 0.5;
                this.musicState.isFavorite = true;
            } catch (e) { }
        }

        area.style.padding = '0';
        area.innerHTML = `
            <div style="padding:20px; text-align:center; background:#f8fafc; height:100%; display:flex; flex-direction:column;">
                <h2 style="font-weight:850; margin-bottom:10px; color:#334155;">Sound Library</h2>
                
                <!-- 4 Categories -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                    <button id="btnNature" class="music-card" onclick="Activities.playMusicTrack('Nature')">
                        <div style="font-size:2.5rem;">🌿</div>
                        <div style="font-weight:700;">Nature</div>
                    </button>
                    <button id="btnLofi" class="music-card" onclick="Activities.playMusicTrack('Lo-fi')">
                        <div style="font-size:2.5rem;">☕</div>
                        <div style="font-weight:700;">Lo-fi Beats</div>
                    </button>
                    <button id="btnWhite" class="music-card" onclick="Activities.playMusicTrack('White Noise')">
                        <div style="font-size:2.5rem;">📻</div>
                        <div style="font-weight:700;">White Noise</div>
                    </button>
                    <button id="btnClassic" class="music-card" onclick="Activities.playMusicTrack('Classical')">
                        <div style="font-size:2.5rem;">🎻</div>
                        <div style="font-weight:700;">Classical</div>
                    </button>
                </div>

                <!-- Controls -->
                <div style="background:#fff; padding:20px; border-radius:20px; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                         <span style="font-weight:700; color:#64748b;">Volume</span>
                         <input type="range" min="0" max="1" step="0.1" value="${this.musicState.volume}" 
                                oninput="Activities.setMusicVolume(this.value)" style="width:60%;">
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <span style="font-weight:700; color:#64748b;">Timer</span>
                        <div style="display:flex; gap:10px;">
                            <button class="timer-btn" onclick="Activities.setMusicTimer(3)">3m</button>
                            <button class="timer-btn" onclick="Activities.setMusicTimer(5)">5m</button>
                            <button class="timer-btn" onclick="Activities.setMusicTimer(10)">10m</button>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <button id="btnFav" onclick="Activities.toggleMusicFavorite()" style="border:none; background:none; font-size:1.5rem; cursor:pointer; color:#ccc;">
                            ${this.musicState.isFavorite ? '❤️' : '🤍'}
                        </button>
                        <span style="font-size:0.9rem; color:#94a3b8;">Add to My Calm Playlist</span>
                    </div>
                </div>
                
                <button class="btn-primary" onclick="Activities.completeAction('silver', 30, { category: 'Music', detail: Activities.musicState.type || 'Music', volume: Activities.musicState.volume })" style="margin-top:auto;">Done (+30 XP)</button>
            </div>
            
            <style>
                .music-card { background:#fff; border:2px solid #e2e8f0; border-radius:15px; padding:15px; cursor:pointer; transition:all 0.2s; }
                .music-card.active { border-color:#3b82f6; background:#eff6ff; transform:scale(1.05); }
                .timer-btn { padding:5px 12px; border-radius:15px; border:1px solid #cbd5e1; background:#fff; cursor:pointer; font-weight:600; font-size:0.9rem; }
                .timer-btn.active { background:#3b82f6; color:white; border-color:#3b82f6; }
            </style>
        `;

        const btn = document.getElementById('activityBtn');
        if (btn) btn.style.display = 'none';

        // Helper Methods attached to Activities instance
        this.playMusicTrack = (type) => {
            if (this.musicState.type === type && this.isPlaying) {
                // Already playing
            }

            this.stopAll();
            this.initAudio();
            this.musicState.type = type;
            this.isPlaying = true;

            // Update UI
            document.querySelectorAll('.music-card').forEach(b => b.classList.remove('active'));
            const btnId = type === 'Nature' ? 'btnNature' : type === 'Lo-fi' ? 'btnLofi' : type === 'White Noise' ? 'btnWhite' : 'btnClassic';
            document.getElementById(btnId).classList.add('active');

            // Audio Generation
            const gain = audioCtx.createGain();
            gain.gain.value = this.musicState.volume;
            gain.connect(audioCtx.destination);
            this.currentGainNode = gain;

            if (type === 'Nature') {
                // Rain logic (reused)
                const bufSize = audioCtx.sampleRate * 2;
                const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;

                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 600;
                noise.connect(filter).connect(gain);
                noise.start();
                this.currentAudioSource = noise;
            }
            else if (type === 'White Noise') {
                // Pure White Noise
                const bufSize = audioCtx.sampleRate * 2;
                const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;
                noise.connect(gain);
                noise.start();
                this.currentAudioSource = noise;
            }
            else if (type === 'Lo-fi') {
                // Simple Beat (Kick + Snare) + Drone
                // 1. Drone Chord
                const osc1 = audioCtx.createOscillator();
                osc1.type = 'triangle';
                osc1.frequency.value = 261.63; // C4
                const osc2 = audioCtx.createOscillator();
                osc2.type = 'sine';
                osc2.frequency.value = 329.63; // E4

                const chordGain = audioCtx.createGain();
                chordGain.gain.value = 0.3;
                osc1.connect(chordGain);
                osc2.connect(chordGain);
                chordGain.connect(gain);
                osc1.start(); osc2.start();

                // 2. Beat (Low thud)
                const beatInt = setInterval(() => {
                    const k = audioCtx.createOscillator();
                    const kG = audioCtx.createGain();
                    k.frequency.setValueAtTime(150, audioCtx.currentTime);
                    k.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                    kG.gain.setValueAtTime(0.5, audioCtx.currentTime);
                    kG.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
                    k.connect(kG).connect(gain);
                    k.start(); k.stop(audioCtx.currentTime + 0.5);
                }, 2000); // 30 BPM chill

                this.currentInterval = beatInt;
                // Store sources for cleanup
                this.currentAudioSource = { stop: () => { osc1.stop(); osc2.stop(); clearInterval(beatInt); } };
            }
            else if (type === 'Classical') {
                // Arpeggio
                const notes = [261.63, 329.63, 392.00, 523.25]; // C Major
                let nIdx = 0;
                const arpInt = setInterval(() => {
                    const osc = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = notes[nIdx];
                    g.gain.setValueAtTime(0.3, audioCtx.currentTime);
                    g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
                    osc.connect(g).connect(gain);
                    osc.start(); osc.stop(audioCtx.currentTime + 1.5);
                    nIdx = (nIdx + 1) % notes.length;
                }, 1000); // Slow

                this.currentInterval = arpInt;
                this.currentAudioSource = { stop: () => clearInterval(arpInt) };
            }
        };

        this.setMusicVolume = (val) => {
            this.musicState.volume = parseFloat(val);
            if (this.currentGainNode) {
                this.currentGainNode.gain.cancelScheduledValues(audioCtx.currentTime);
                this.currentGainNode.gain.setValueAtTime(this.musicState.volume, audioCtx.currentTime);
            }
        };

        this.setMusicTimer = (min) => {
            // Clear existing
            this.activeTimeouts.forEach(clearTimeout);
            document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));

            // Initial select logic
            const btns = document.querySelectorAll('.timer-btn');
            if (min === 3) btns[0].classList.add('active');
            if (min === 5) btns[1].classList.add('active');
            if (min === 10) btns[2].classList.add('active');

            // Set timeout
            this.activeTimeouts.push(setTimeout(() => {
                this.stopAll();
                alert("Music session ended.");
            }, min * 60 * 1000));
        };

        this.toggleMusicFavorite = () => {
            this.musicState.isFavorite = !this.musicState.isFavorite;
            const btn = document.getElementById('btnFav');
            if (btn) btn.innerText = this.musicState.isFavorite ? '❤️' : '🤍';

            if (this.musicState.isFavorite) {
                localStorage.setItem('musicFavorite', JSON.stringify({
                    type: this.musicState.type,
                    volume: this.musicState.volume
                }));
            } else {
                localStorage.removeItem('musicFavorite');
            }
        };

        // Auto-play if Favorite exists
        if (this.musicState.type) {
            this.playMusicTrack(this.musicState.type);
        }
    },

    safeVibrate(pattern) {
        if (!navigator.vibrate) return;
        try { navigator.vibrate(pattern); } catch (e) { }
    }
};

window.Activities = Activities;
window.renderStrategies = (n, i) => Activities.renderStrategies(n, i);
window.feedback = (t) => Activities.feedback(t);
['click', 'touchstart'].forEach(e => window.addEventListener(e, () => Activities.initAudio(), { once: false }));