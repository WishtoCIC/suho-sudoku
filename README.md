# 수호의 스도쿠 놀이터 🧩

초등학교 1학년 수호를 위한 어린이 스도쿠(보드게임 방식) 웹앱. 단일 HTML 파일, 빌드 없음.

- 사용 기기: 갤럭시 탭 S7(+S펜), 갤럭시 S25+ 휴대폰
- 배포: **https://suho-sudoku.vercel.app** (Vercel, main 푸시 시 자동 배포) / 오프라인: `index.html` 파일을 탭에 넣어 삼성 인터넷으로 실행
- 이어하기: Supabase (`supabase/schema.sql`)

## 기능 (v1.4)
- 말 종류: 동물 / 과일 / 탈것 / 색깔 / 숫자
- 6단계: 아기(4×4, 빈칸5) · 쑥쑥(8) · 척척(11) · 도전(6×6, 빈칸12) · 용사(18) · 박사(24) — 앞 단계를 깨야 열림
- 문제 자동 생성(답이 하나뿐인 문제만), 힌트 3회, 되돌리기, 도우미(같은 말 강조·틀린 칸 표시), 별 1~3개
- S펜 숫자 쓰기: 숫자 말일 때 빈칸에 직접 쓰면 인식($P 포인트클라우드, 1~9). 애매하면 후보 고르기, 손바닥 무시, 손가락 쓰기 토글
- ✍️ 펜 연습장: 수호 글씨를 숫자별 최대 6개 저장 → 인식 정확도 향상
- 반응형: 탭 가로·세로, 휴대폰 가로·세로
- ☁️ 이어하기: 가족 코드(`SUHO-XXXX-XXXX`)를 여러 기기에 넣으면 별·단계·펜 글씨를 병합 동기화. 인터넷이 없으면 기기에만 저장

## 이어하기 설정 (적용 완료)
- Supabase 프로젝트: **WishtoCIC's Project** (`bxigtnsdelbbiamtqwrp`, ap-southeast-2) — 테이블 `sudoku_progress`, 함수 `sudoku_load`/`sudoku_save` (마이그레이션 `suho_sudoku_progress`)
- `index.html` 에 Project URL + publishable 키 입력 완료
- 보안 경고(anon이 SECURITY DEFINER 함수 실행 가능)는 의도된 설계: 테이블 직접 접근은 막고 두 함수로만 읽고 씀

처음부터 다시 설정할 때:
1. Supabase SQL Editor 에서 `supabase/schema.sql` 실행
2. `index.html` 의 `CLOUD_URL`(Project URL), `CLOUD_KEY`(anon / publishable 키) 채우기
   - 테이블은 RLS로 잠겨 있고 `sudoku_load` / `sudoku_save` 함수로만 접근 → anon 키가 공개돼도 다른 데이터에는 접근 불가
3. 첫 기기에서 ☁️ 이어하기 → 새 코드 만들기, 다른 기기에서 그 코드 입력

## 진행 기록
- 2026-11-08 v1.0 첫 버전 (그림 스도쿠 4×4/6×6, 6단계)
- v1.1 S펜 숫자 인식, 펜 연습장, 탭 최적화
- v1.2~1.3 휴대폰(S25+) 화면 배치, 말 줄 잘림 수정, 버전 표시
- v1.4 Supabase 이어하기, GitHub 저장소 이전, Vercel 배포(suho-sudoku.vercel.app), 실제 Supabase 저장/불러오기 확인

## 확인 못 한 것 / 다음 할 일
- 참고하려던 네이버 블로그(m.blog.naver.com/ssbb-11/224457196019)는 열지 못해 일반적인 어린이 스도쿠 방식으로 구현
- 펜 인식은 합성 손글씨로만 테스트 → 수호 실제 글씨로 확인·보정 필요
- 아이디어: 9×9 숫자 스도쿠 단계, 홈 화면 아이콘(PWA)
