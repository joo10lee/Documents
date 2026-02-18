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
        if (navigator.vibrate && window.userInteracted) {
            try { navigator.vibrate(0); } catch (e) { }
        }
    },

    // 3. 🧠 [Master] 지능형 전략 렌더러 (매핑 오류 & 강도 분기 해결)
    renderStrategies(emotionName, intensity) {
        const container = document.getElementById('strategiesContainer');
        if (!container) return;

        const name = emotionName ? emotionName.toString().trim().toLowerCase() : "";
        const level = parseInt(intensity) || 5;
        console.log(`🧠 [STRATEGY DEBUG] Input Name: "${emotionName}", Parsed: "${name}", Level: ${level}`);


        let quests = [];

        // 💡 [해결] Happy (😊) - 1-2단계(🌱) vs 3단계 이상(✍️) 분기 복구
        if (name.includes('happy') || name.includes('😊')) {
            if (level <= 2) {
                quests = [
                    { title: 'Happy Note', icon: '🌱', tier: 'gold', xp: 60, color: '#1e293b', tag: 'SMALL JOY' },
                    { title: 'Share the joy', icon: '✨', tier: 'silver', xp: 30, color: '#fff' }
                ];
            } else {
                // PRD 일치: Happy Journal, Capture the Moment, Body Scan
                quests = [
                    { title: 'Happy Journal', icon: '✍️', tier: 'gold', xp: 60, color: '#1e293b', tag: 'WRITE' },
                    { title: 'Capture the Moment', icon: '📸', tier: 'silver', xp: 50, color: '#fff' },
                    { title: 'Body Scan', icon: '🧘', tier: 'silver', xp: 30, color: '#fff', tag: 'AWARENESS' }
                ];
            }
        }
        else if (name.includes('sad') || name.includes('😢')) {
            quests = [
                { title: 'Comfort Object', icon: '🧸', tier: 'gold', xp: 60, color: '#1e293b', tag: 'HUG' },
                { title: 'Listen to Music', icon: '🎵', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Talk to Someone', icon: '🗣️', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }
        else if (name.includes('anxious') || name.includes('😰')) {
            quests = [
                { title: 'Deep Breathing', icon: '🌬️', tier: 'gold', xp: 60, color: '#1e293b', tag: 'BREATHE' },
                { title: '5-4-3-2-1 Grounding', icon: '🖐️', tier: 'silver', xp: 30, color: '#fff', tag: 'SENSES' },
                { title: 'Calm Catalog', icon: '🌌', tier: 'silver', xp: 30, color: '#fff' } // PRD상 Calm전략이지만 Anxious에도 유용하여 배치됨
            ];
        }
        else if (name.includes('angry') || name.includes('😠')) {
            quests = [
                { title: 'Angry Drawing', icon: '🖍️', tier: 'gold', xp: 60, color: '#ef4444', tag: 'SCRIBBLE' },
                { title: 'Squeeze & Release', icon: '✊', tier: 'silver', xp: 30, color: '#fff' },
                { title: 'Take a Walk', icon: '🚶', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }
        else if (name.includes('calm') || name.includes('😌')) {
            quests = [
                { title: 'Calm Catalog', icon: '🌌', tier: 'gold', xp: 60, color: '#1e293b', tag: 'ZEN' },
                { title: 'Meditation', icon: '🧘', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }
        else if (name.includes('tired') || name.includes('😫')) {
            quests = [
                { title: 'Body Scan', icon: '🧘', tier: 'gold', xp: 60, color: '#1e293b', tag: 'REST' },
                { title: 'Drink Water', icon: '💧', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }
        else {
            quests = [
                { title: 'Deep Breathing', icon: '🌬️', tier: 'gold', xp: 60, color: '#1e293b', tag: 'BREATHE' },
                { title: 'Write it down', icon: '✍️', tier: 'silver', xp: 30, color: '#fff' }
            ];
        }

        container.className = `strategy-grid grid-${quests.length}`;
        container.innerHTML = `
            <!-- 💡 Title removed to avoid duplication -->
            ${quests.map((q, idx) => `
                <button class="bento-card ${q.tier}-tier ${idx === 0 ? 'hero-card' : ''}" 
                        onclick="Activities.setupActivity('${q.title}')" 
                        style="background:${q.color}; ${q.tier === 'gold' ? 'color:white;' : ''}">
                    <span class="quest-icon">${q.icon}</span>
                    <div class="quest-info" style="text-align:left;">
                        <div class="quest-title" style="font-weight:850; font-size: ${idx === 0 ? '1.2rem' : '0.95rem'};">${q.title}</div>
                        <div class="quest-reward" style="font-weight:700; font-size:0.8rem; color:${q.tier === 'gold' ? '#FFD700' : '#7c3aed'}">
                            ✨ +${q.xp} XP
                        </div>
                    </div>
                    ${q.tag ? `<div class="recommend-tag">${q.tag}</div>` : ''}
                </button>
            `).join('')}`;
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
            else if (type === 'Meditation' || type === 'Listen to music' || type.includes('music')) {
                area.innerHTML = `<div style="font-size:4rem;">🎵</div><p>Listen to your favorite song.</p>`;
                if (btn) { btn.textContent = "Done! (+30 XP)"; btn.onclick = () => this.completeAction('silver', 30); }
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
                this.startCalmCatalog();
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
                icon.innerText = '🚶';
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
        const area = document.getElementById('inAppActionArea');
        let r = 1;
        const update = () => {
            area.innerHTML = `<div style=\"text-align:center; padding:40px;\"><div style=\"font-size:8rem;\">✊</div><h2 style=\"font-weight:850;\">SQUEEZE! (${r}/3)</h2></div>`;
            this.activeTimeouts.push(setTimeout(() => {
                area.innerHTML = `<div style=\"text-align:center; padding:40px;\"><div style=\"font-size:8rem;\">🖐️</div><h2 style=\"font-weight:850;\">RELEASE...</h2></div>`;
                this.activeTimeouts.push(setTimeout(() => { if (r < 3) { r++; update(); } else this.completeAction('silver', 30); }, 3000));
            }, 3000));
        };
        update();
    },

    startBigHugTimer() {
        const area = document.getElementById('inAppActionArea');
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
                <div style="padding:20px; text-align:center; position:relative; min-height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div id="bCircle" style="width:150px; height:150px; background:#ddd6fe; border-radius:50%; display:flex; align-items:center; justify-content:center; transition: all 1s ease-in-out; position:relative;">
                        <span id="bTimer" style="font-size:3rem; font-weight:800; color:#7c3aed;">4</span>
                    </div>
                    <h2 id="bText" style="margin-top:40px; font-weight:800; color:#4b5563; min-height:40px;">Get Ready...</h2>
                    <div id="bDots" style="margin-top:30px; display:flex; gap:8px;">
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
                circle.style.backgroundColor = color;

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
                    // Inhale 4 (Scale 1 -> 2, Purple)
                    tick(4, "Inhale...", 1.8, "#c4b5fd", () => {
                        // Hold 4 (Scale 2, Blue)
                        tick(4, "Hold...", 1.8, "#a5b4fc", () => {
                            // Exhale 4 (Scale 2 -> 1, Gray)
                            tick(4, "Exhale...", 1.0, "#e2e8f0", () => {
                                // Hold 4 (Scale 1, Gray)
                                tick(4, "Hold...", 1.0, "#e2e8f0", () => {
                                    currentRound++;
                                    runRound();
                                });
                            });
                        });
                    });
                } else {
                    // 4-7-8 Pattern
                    // Inhale 4
                    tick(4, "Inhale...", 1.8, "#f9a8d4", () => {
                        // Hold 7
                        tick(7, "Hold...", 1.8, "#fbcfe8", () => {
                            // Exhale 8
                            tick(8, "Exhale...", 1.0, "#e2e8f0", () => {
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
                         <button class="btn-primary" onclick="Activities.completeAction('gold', 60)">Much Better</button>
                    </div>
                </div>
            `;
        };
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