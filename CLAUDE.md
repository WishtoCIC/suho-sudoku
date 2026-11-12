# CLAUDE.md — 수호의 스도쿠 놀이터

초등학교 1학년 수호(김수호)와 가족이 쓰는 스도쿠 웹앱. 아빠(WishtoCIC / Ongdoll_Papa)가 요청하고 확인한다.
대화·커밋 메시지·UI 문구는 **한국어**. 아이용 문구는 쉽고 다정하게(반말 OK: "~해 봐!"), 어른 모드 문구는 짧고 담백하게.

## 구조
- `index.html` — 앱 전체(HTML+CSS+JS 한 파일, 빌드 없음, 외부 라이브러리 없음. 글꼴만 Google Fonts Jua)
- `supabase/schema.sql` — 이어하기용 테이블·함수
- `tests/engine-check.mjs` — 퍼즐 생성기 검사(`node tests/engine-check.mjs`)
- `README.md` — 기능 목록과 버전별 진행 기록 (기능 바꾸면 같이 갱신)

## 배포·서비스
- 서비스: https://suho-sudoku.vercel.app — **main에 push하면 Vercel이 자동 배포**(빌드 설정 없음, 정적 사이트)
- Vercel 팀 'ongdoll'. Claude의 Vercel MCP 연결엔 이 팀 권한이 없어 상태 조회 불가 → 배포 확인은 브라우저로 사이트를 열어 첫 화면 아래 "버전 x.x" 표시로 한다
- 오프라인 사용: `index.html` 파일을 탭에 넣어 삼성 인터넷으로 열기도 함 → 상대경로 파일 추가 금지, 계속 **한 파일**로 유지

## Supabase (이어하기)
- 프로젝트: WishtoCIC's Project (`bxigtnsdelbbiamtqwrp`, ap-southeast-2). 같은 프로젝트에 `public.trips`(다른 앱) 있음 — 건드리지 말 것
- 테이블 `sudoku_progress(sync_code, data jsonb, updated_at)` — RLS on, 정책 없음, anon 직접 접근 불가
- 함수 `sudoku_load(p_code)`, `sudoku_save(p_code, p_data)` (SECURITY DEFINER, anon 실행 허용 — 의도된 설계, advisor 경고 무시)
- `index.html`의 `CLOUD_URL` / `CLOUD_KEY`(publishable 키, 공개돼도 됨). service_role 키는 절대 넣지 말 것
- 가족 코드 `SUHO-XXXX-XXXX`, 클라이언트에서 병합: 별=최대, 최고기록=최소, 푼 횟수=최대, 펜 샘플=id 합집합(숫자별 최근 6개, resetAt 이후)
- localStorage 키 접두어 `suhoSudoku_` (progress, samples, resetAt, syncCode, theme, homeMode, adultV, adultD, sound, fingerWrite, seenHow)
  → **키 이름·데이터 모양 바꾸지 말 것**(가족 기기에 저장된 별·기록이 사라짐). 바꿔야 하면 마이그레이션 코드 추가

## 사용 기기 (화면 깨짐 주의)
- 갤럭시 탭 S7 + S펜 (CSS 약 1280×800 / 800×1280) — 주 사용
- 갤럭시 S25+ 휴대폰 세로 (약 384×832) / 가로
- 아이패드 Air M3 + Apple Pencil Pro (크롬)
- 화면 바꾼 뒤엔 위 크기들(가로·세로)에서 `#game` 안 요소가 화면 밖으로 넘치지 않는지 확인. 이전에 말 줄 잘림·버튼 넘침 문제가 있었음

## 코드 지도 (index.html `<script>`)
- `REC` — 손글씨 숫자 인식($P 포인트클라우드, 1~9). 사용자 샘플은 `REC.init(userSamples)`
- `THEMES`, `LEVELS`(어린이 6단계), `VARIANTS`(classic/x/win/mini), `DIFFS`(easy/medium/hard/expert)
- 엔진: `makeShape`(행·열·상자 + 대각선/윈도쿠 추가 영역, peers) · `solveCount`(답 개수) · `solveSingles`(기본 기술 풀이 → 난이도 판정) · `carve` · `makePuzzle`(어린이) · `makeAdult`(어른)
- 상태 `G`: mode('kid'|'adult'), L{n,br,bc,S}, sol/puz/cur(2차원), notes(비트마스크), focus, history(스냅샷), memo, done
- 입력 규칙(아빠 요청 v1.6, 유지할 것): **빈칸을 먼저 누르고 → 아래 숫자 선택으로 채움. 채운 뒤 아래 숫자 선택은 남지 않음.** 칸 없이 숫자를 누르면 안내만. (`onCell`, `trayPick`, `place`)
- 오답 표시(아빠 요청 v1.7): 답(`G.sol`)과 다른 숫자를 놓으면 즉시 빨간 칸 — 겹침(`conflict`)이 아니라 `wrong(r,c,v)` 기준. 퍼즐은 답이 하나뿐(`solveCount===1`)이라 가능. `helper`(도우미) 꺼지면 표시 안 함
- 어린이: 칸 채우면 focus 해제 / 어른: focus 유지, 메모 모드, 같은 줄 메모 자동 정리
- 펜: `bwrap` pointer 이벤트 → `finishInk` → 애매하면 `showPicker`. 숫자 모드(`numMode()`)일 때만 쓰기
- `layout()` — 판·트레이 크기 계산(가로/세로, phone 여부). `renderGame()`이 매번 판을 다시 그림
- `Cloud` — Supabase 동기화 (merge/apply/sync)

## 작업 습관
- 기능 바꾸면: 첫 화면 아래 `버전 x.x · 날짜` 올리기 + README 진행 기록 한 줄 추가
- 확인: `node tests/engine-check.mjs`, 그리고 headless 브라우저로 위 기기 크기에서 화면·입력 확인(Playwright 등)
- 커밋 후 push → 1~2분 뒤 사이트에서 버전 표시 확인
- 펜 인식은 합성 손글씨로만 시험함 — 실제 수호 글씨 피드백이 오면 `REC` 기본 모양(BASE) 보정

## 다음 할 일 후보
- 킬러 스도쿠·직소(불규칙 블록), 오늘의 퍼즐(가족이 같은 문제로 기록 겨루기), PWA 홈 화면 아이콘, 수호 실제 글씨로 인식 보정
