# Hackathon Execution Tips

## 시간 배분 (3.5시간)
- Phase 0: 프로젝트 세팅 (10분) - Builder 모드
- Phase 1: 에이전트 코어 (60분) - Builder 모드
- Phase 2: UI 구현 (60분) - Chat 모드
- Phase 3: 연결 + 부가기능 (50분) - Chat 모드
- Phase 4: 데모 준비 (30분)

## TRAE 모드 전환 전략
- Builder 모드: 새 파일 생성, 프로젝트 구조 세팅, 멀티파일 작업
- Chat 모드: 기존 파일 수정, 디버깅, 스타일 조정, 작은 변경
- 규칙: 큰 작업은 Builder, 세밀한 작업은 Chat

## 컨텍스트 전달
- #File docs/PROMPTS.md → 에이전트 프롬프트 참조
- #File docs/GUIDE.md → Phase별 구현 가이드 참조
- #File src/types/agent.ts → 타입 정의 참조
- #Folder src/lib → 전체 로직 파일 참조

## 비상 계획
- API 키 없음 → mockAgent.ts가 자동 활성화
- Phase 2까지만 완료 → Mock 데이터로 정적 데모
- Phase 1만 완료 → 콘솔 데모 + README 아키텍처 발표

## 디버깅 빠른 해결
- CORS 에러 → Vite proxy 설정 또는 직접 API 호출
- TypeScript 에러 → 타입 정의 확인 (#File src/types/agent.ts)
- 빈 화면 → 브라우저 콘솔 확인, import 경로 확인
- API 응답 파싱 에러 → function_call.arguments JSON.parse 확인

## 모델 사용 전략 (무료 티어)
- 핵심 로직 (agents.ts, orchestrator.ts): Claude 4 Sonnet 또는 GPT-4o (Fast)
- UI 컴포넌트: DeepSeek R1 (Slow, 1000회 무료)
- 디버깅: Gemini 2.5 Pro (Slow, 1000회 무료)
- Fast 요청은 아껴서 사용 (총 20회)
