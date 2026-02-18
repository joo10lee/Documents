# FeelFlow 사업 전략 핸드오프 문서

> 이 문서는 FeelFlow PRD 개발 대화에서 나온 사업 전략 논의를 새 대화로 이전하기 위한 것입니다.
> 원본 대화: FeelFlow PRD 최종 + MVP 개발 프롬프트 작성 세션

---

## 1. 제품 개요

**FeelFlow**: ASD(자폐 스펙트럼 장애) 청소년(13-18세)을 위한 감정 조절 앱

### 핵심 기능 (MVP)
- 6개 감정 × 3개 전략 (총 18개 ASD 특화 전략)
- 감정 체크인 플로우: 감정 선택 → 트리거 태그 → Intensity 측정 → 전략 활동 → 재측정
- Trophy 시스템 (Guardian이 목표 설정, 포인트 기반 보상)
- Daily Routine 체크리스트 (morning/evening)
- Journey (개인 감정 타임라인 + 크리에이티브 콘텐츠)
- Guardian Dashboard (차트, AI 인사이트, 알림 에스컬레이션)
- Emergency Mode (🆘 원탭 위기 대응)
- Crisis Resources (988, Crisis Text Line, Guardian 연결)
- Clinical Report (주간/월간 보고서, Independence Score)
- Trigger Mapping (트리거 패턴 분석)

### 기술 스택
- Frontend: Vanilla JS (app.js, ui.js, activities_v2_9_5.js), HTML, CSS
- Backend: AWS Lambda + API Gateway
- 데이터: localStorage + AWS (sync)

### 현재 개발 상태
- 기본 체크인, 18개 전략, XP 시스템, Daily Routine, Guardian 기본 대시보드 구현 완료
- PRD 대비 ~55% 완성
- 8단계 Antigravity 프롬프트로 나머지 MVP 기능 개발 중 (Phase A: Prompt 1-4 진행 중)

---

## 2. Pre-Seed 펀딩 가능성 분석

### 투자자 체크리스트 vs FeelFlow

| 투자자 체크리스트 | FeelFlow 현재 상태 | 판정 |
|-----------------|------------------|------|
| Founder-Problem Fit | ASD 아들(Jason, 14세)과 함께 만드는 아버지 | ✅ 최강 |
| Founder Capability | 20년+ 기술 리더십, 0-to-1 제품 3개, MS CS, FDA 플랫폼 경험 | ✅ 강함 |
| Working MVP | Phase A 완료 후 기능적 앱 존재 | ✅ 있음 |
| Problem Validation | ASD 감정 조절 어려움은 문서화된 임상 과제 | ✅ 명확 |
| User Validation | 현재 Jason 1명만 사용 | 🔴 부족 |
| Market Size | ASD 치료 시장 $2.16B (2024), 디지털 ASD 앱 시장 $235M, CAGR 13.8% | ✅ 충분 |
| Willingness to Pay | 아직 검증 안 됨 | 🔴 부족 |
| Differentiation | ASD 전용 감정 조절 앱 거의 없음 | ✅ 강함 |
| Go-to-Market 계획 | Regional Center B2B 모델 수립 | ✅ 수립 |

### 결론
MVP만으로 Pre-Seed 미팅은 잡을 수 있지만 투자 확정은 어려움. MVP + 2개월 Beta 데이터가 전제 조건.

---

## 3. 2개월 Beta 데이터 기대값 — 투자자를 움직이는 구체적 숫자

### Tier 1: 반드시 있어야 하는 지표

| 지표 | "괜찮네" 기준 | "이거 된다" 기준 | 측정법 |
|------|------------|--------------|-------|
| Beta 유저 수 | 15-20가정 | 30+가정 | 가입 수 |
| Day 7 Retention | 40% | 60%+ | 설치 7일 후 체크인한 유저 비율 |
| Day 30 Retention | 25% | 40%+ | 30일 후 여전히 주 3회+ 사용 |
| DAU/MAU Ratio | 20% | 30%+ | 매일 쓰는 유저 / 월간 유저 |
| NPS | 40 | 60+ | "이 앱을 추천하시겠습니까?" (0-10) |

**핵심**: Day 30 Retention 40%가 킬러 넘버. 헬스앱 평균 30일 retention은 7.9%에 불과 — FeelFlow가 40% 달성하면 **평균의 5배**.

### Tier 2: ASD 특화 차별화 지표 (임상 효능 데이터)

| 지표 | 기대값 | 투자자에게 의미 |
|------|-------|--------------|
| 평균 Intensity 감소 | ≥2.0 point drop (before→after) | "앱이 실제로 감정 조절에 효과 있다" |
| 전략 완료율 | ≥60% | "아이들이 끝까지 한다" |
| 주간 Intensity 추세 | Week 1: 6.5 → Week 8: 5.0 (↓1.5) | "시간이 지나면 개선된다" |
| Emergency Mode 빈도 감소 | 주 2회 → 주 0.5회 | "위기 상황이 줄어든다" |
| 감정 어휘 다양성 증가 | 2-3 감정 편중 → 4-5 감정 분산 | "자기 인식이 넓어진다" |

이 데이터가 왜 킬러인가: 앱 메트릭이 아니라 **임상 효능 데이터**. FDA Digital Therapeutics 경로의 첫 신호.

### Tier 3: 비즈니스 가능성 시그널

| 지표 | 기대값 | 측정법 |
|------|-------|-------|
| Willingness to Pay | 15명 중 10명+ "유료로 쓰겠다" | "월 $9.99에 계속 쓰시겠습니까?" |
| Guardian 참여율 | 70%+ 주 1회 이상 대시보드 접속 | Guardian 로그인 빈도 |
| 치료사 추천 의향 | 3명 이상 LOI | "환자에게 추천하시겠습니까?" |
| Organic Referral | 20%+ 다른 가정 소개 | 추적 |

### 투자자를 움직이는 데이터 공식
> **30일 retention 40% + intensity 감소 2.0+ + WTP 70% + 치료사 LOI 3건**

이 네 가지가 있으면 $250K-500K Pre-Seed는 충분히 현실적.

### 2개월 타임라인 데이터 곡선

- Week 1-2: 온보딩 (15-30가정, Day 1 ret 80%+, Day 7 ret 50%+)
- Week 3-4: 습관 형성 (DAU/MAU 20%+ 안정화, 체크인 1.2회/일, 전략 완료율 55%+)
- Week 5-6: 효과 검증 (Day 30 ret 측정, intensity 감소 통계적 유의성, Emergency 빈도↓)
- Week 7-8: 수확 (종료 설문 NPS/WTP, 치료사 인터뷰, 유저 스토리 수집)

---

## 4. Regional Center B2B 모델 — $30/인/월

### California Regional Center 시스템 개요
- CA DDS: ~380,000 consumers + ~60,000 영유아 (developmental disabilities)
- 21개 비영리 Regional Center가 IPP(Individual Program Plan) 기반 서비스 구매
- Lanterman Act: 자격 조건 해당 개인에 대한 서비스 법적 권리 보장 (예산 삭감에도 의무 유지)
- 자격 조건: 자폐증, 지적 장애, 뇌성마비, 간질 등 (18세 전 발병, 소득 무관)
- Vendorization: 서비스 제공자 승인 절차 → vendor number + service code → RC로부터 요금 상환

### FeelFlow 진입 경로

| 단계 | 접근법 | 설명 |
|------|--------|------|
| Phase 0 (지금) | Service Code 024 | 가장 빠른 진입. IPP에 포함 → RC가 024로 구매. Vendorization 불필요 (가족 직접 구매 후 환급) |
| Phase 1 (6개월 후) | Vendorization 신청 | SARC (Santa Clara 관할)에 정식 vendor 신청 → vendor number + service code + 합의 요금 |
| Phase 2 (12개월 후) | 다른 RC 확장 | 한 RC에서 vendored되면 다른 RC에서도 이용 가능. 21개 RC 전체 확장 |

### $30/인/월 가격 타당성

| 비교 서비스 | RC 월 요금 | FeelFlow $30 비교 |
|-----------|----------|-----------------|
| Financial Management Services (FEA, Code 490) | $160/인/월 | 1/5 수준 |
| Financial Management Services (Co-Employer, Code 491) | $265/인/월 | 1/9 수준 |
| ABA 치료 세션 | $50-150/시간 | ABA 1시간의 1/2~1/5 |
| 행동 지원 서비스 | $200-500+/월 | 보조 도구 수준 |

**$30/월은 RC 입장에서 "거의 공짜" 수준**. Cost-effectiveness 논쟁 불필요.

### 비즈니스 모델 숫자

```
California RC System TAM:
- ASD consumers: ~150,000-190,000명
- ASD 청소년 (13-18): ~40,000-55,000명
- TAM: 55,000 × $30/월 × 12 = $19.8M/년 (CA only)

현실적 목표:
Phase 0: SARC만 → 150명 × $30 × 12 = $54K ARR
Phase 1: Bay Area 5개 RC → 500명 × $30 × 12 = $180K ARR
Phase 2: CA 전체 21개 RC → 1,500명 × $30 × 12 = $540K ARR
Phase 3: 타주 확장 (TX, NY, FL) → $2-5M ARR 목표
```

### 투자자에게 매력적인 이유

1. **Payer가 확실**: 정부 자금이 결제자. Lanterman Act가 서비스 구매 의무 보장
2. **CAC ~$0**: Service Coordinator가 IPP 미팅에서 추천 → 마케팅 비용 없음. 영업 대상 = 21개 RC
3. **Retention 구조적으로 높음**: IPP는 1-3년 주기 갱신. 한 번 포함되면 최소 1년 보장
4. **데이터가 IPP 보고서로 직접 연결**: Clinical Report가 IPP 갱신 근거가 됨
5. **확장 경로 명확**: 1개 RC vendor → 21개 RC 자동 확장 가능

### 핵심 차별점: Jason이 SARC Consumer

Jason은 이미 SARC(San Andreas Regional Center, Santa Clara County 관할) consumer일 가능성 높음.
- Jason의 Service Coordinator = 첫 번째 채널 파트너
- Jason의 IPP에 FeelFlow 포함 = 첫 번째 paying customer 즉시 생성
- "우리 아들이 실제로 쓰고 있고, 효과가 있고, RC가 비용을 지불합니다" = Pre-Seed 피치 핵심 문장

### Pre-Seed 피치 슬라이드 (RC 모델)

> **"Government-Funded B2B: $30/consumer/month"**
>
> 💰 Payer: California Regional Centers (Lanterman Act 보장)
> 📊 TAM: 55,000 ASD teens in CA × $30/mo = $19.8M/yr (CA만)
> 🏥 Channel: Service Coordinators → IPP 포함 → 자동 배포
> 📈 Unit Economics: CAC ~$0 / LTV ~$360 (1년 보장)
> 🔒 Moat: IPP 통합 → 전환비용 높음 → NRR 110%+

---

## 5. FeelFlow의 3가지 투자자 어필 각도

### 1. "Clinical Data Platform" 스토리
단순 앱이 아닌 ASD 감정 데이터 플랫폼. 체크인 + 트리거 매핑 + 전략 효과 데이터 = ASD 연구자/제약사가 원하는 real-world evidence. TAM이 앱 구독료에서 데이터 라이센싱까지 확장.

### 2. "Built WITH ASD, not FOR ASD" 스토리
Jason(ASD 당사자)이 공동 창업자. 매일 사용하면서 만든 앱. DEI + neurodiversity 중시 투자자에게 강한 시그널.

### 3. B2B2C 확장 경로
학교 → 치료센터 → 보험사. 미국 학교 IEP(개별교육계획)의 감정 조절 목표 추적 도구로 활용 가능 → B2B SaaS 모델 전환.

---

## 6. 실행 타임라인 (RC 모델 기반)

```
Month 1-2: MVP 완성 + Jason 데이터 (현재 진행 중)
Month 3: SARC 접근
  - Jason의 Service Coordinator에게 FeelFlow 데모
  - "이 앱을 IPP에 포함시킬 수 있을까?" 대화
  - SARC Resource Development 팀 미팅 요청
  - Service Code 024 구매 가능 여부 확인
Month 4-5: Pilot (SARC 10-20가정)
  - Service Coordinator가 consumer에게 추천
  - 2개월 사용 데이터 수집
  - IPP 보고서 형태로 효과 데이터 패키징
Month 6: Vendorization 신청 + Pre-Seed 피치
  - SARC 정식 vendorization 신청
  - Pilot 데이터 기반 Pitch Deck 완성
  - Target: $300-500K Pre-Seed
```

---

## 7. 타겟 투자자 유형

| 투자자 유형 | 왜 FeelFlow에 관심 | 예시 |
|-----------|-----------------|------|
| ASD/Disability 전문 Angel | 개인적 경험 + 시장 이해 | ASD 가족 고소득 부모, 특수교육 전문가 |
| Health Tech Micro VC | 디지털 치료제 트렌드 | Hustle Fund, Precursor Ventures |
| Impact/DEI 펀드 | Neurodiversity + 사회적 임팩트 | City Light Capital, Unreasonable Group |
| Korean-American VC | 한인 창업자 네트워크 | Formation 8 alumni, Korean-American angel networks |
| Accelerator | 구조화된 멘토링 + $150K | Y Combinator, Techstars Health, MATTER |

---

## 8. 경쟁 환경 참고

- **Elemy**: 디지털 자폐 케어 유니콘 ($219M Series B, $1.15B 총 투자). 소아 행동 텔레헬스.
- **Cognoa**: FDA 승인 AI 기반 자폐 스크리닝 플랫폼 (18개월부터 조기 진단)
- **Finni Health**: 가정 기반 ABA 치료 (Series A)
- **Mightier**: 소아 바이오피드백 비디오 게임 (NIH $2M 연구비 — 감정 조절 ADHD 아동)
- **KeepCalm**: 학교 기반 ASD 감정 조절 앱 (연구 단계, Penn 대학 — 웨어러블 바이오센서 연동)

**FeelFlow 차별점**: 위 경쟁사 중 ASD 청소년 전용 감정 자기조절 + Guardian 임상 데이터 파트너십 + RC B2B 모델을 결합한 제품은 없음.

---

## 9. Founder 프로필 (투자자용)

**Joo** — Co-founder & CEO
- 20년+ 기술 리더십 (Samsung 16년, LVIS, SK Telecom Americas)
- 0-to-1 제품 3개 (Mopria Alliance — 2B+ 디바이스 채택, LVIS FDA 510(k) 클리어런스, Aster AI NPS -18→+20)
- MS Computer Science, Georgia Tech Visiting Researcher (HCI)
- AI/ML 전문성: 100+ EU 스타트업 기술 평가 (Samsung UK), tier-1 AI 파트너십 (Anthropic, OpenAI, Google, Microsoft)

**Jason** — Co-founder
- 14세, ASD Level 1, 9th grade
- FeelFlow의 첫 번째 사용자이자 제품 공동 설계자
- "Built WITH ASD" 스토리의 핵심

---

*이 문서는 새 대화에서 "이 문서의 맥락을 기반으로 FeelFlow 사업 전략을 계속 논의하자"로 시작하면 됩니다.*
