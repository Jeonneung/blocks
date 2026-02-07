# TODO

## 1. 코드 블록 타입 추가

- [x] 코드 블록 타입 정의
- [x] 코드 블록 렌더링 구현
- [x] 구문 강조(Syntax Highlighting) 지원
- [x] 마크다운 단축키(``` / ₩₩₩) → 코드 블록 자동 변환
- [x] Tab/Shift+Tab 들여쓰기
- [x] Shift+Enter로 코드 블록 탈출 (새 본문 블록 생성)

## 2. 마크다운/.docs/.ipynb 문서 import 추가

- [ ] 마크다운 파일 파싱 기능 구현
- [ ] .docs 문서 import 기능 구현
- [ ] .ipynb(Jupyter Notebook) import 기능 구현
- [ ] 블록 변환 로직 추가

## 3. 사용자 입력 시 마크다운 기호 인식 및 블록 변환

- [x] 사용자 입력에서 마크다운 기호 감지 (예: `#`, `-`, `1.` 등)
- [x] 감지된 기호에 따라 적절한 블록 타입으로 자동 변환 (h1~h6, 리스트 등)
- [x] 외부 마크다운 붙여넣기와 동일한 변환 로직이 사용자 직접 입력에도 적용되도록 통합
- [x] 각 단축키의 활성/비활성 설정
- [x] 모든 writable 블록 타입에서 마크다운 단축키 동작 (paragraph 외 heading, quote, list 등)

## 4. 블록 에디터 UX 개선

- [x] Tailwind CSS v4 설치 및 demo 앱 연동
- [x] 블록 컨트롤(+, 삭제, 드래그) 레이아웃을 absolute/hover에서 inline flex/focus 기반으로 변경
- [x] 순서 목록 자동 번호 매기기 (연속된 ordered list 블록에 1, 2, 3... 표시)
- [x] 빈 비-paragraph 블록에서 Delete/Backspace 시 삭제 대신 paragraph로 전환

## 5. Cmd+A 이후 후속 동작 재정의

- [x] Cmd+A 에스컬레이팅 선택 (첫 번째: 블록 내 전체 선택, 두 번째: 전체 블록 선택)
- [x] Cmd+A 선택 상태에서 Delete/Backspace 키 동작을 전체 블록 삭제로 정의
- [x] Cmd+A 선택 상태에서 Cmd+X 동작을 전체 블록 잘라내기로 정의
- [x] Cmd+A 선택 상태에서 Cmd+C 동작을 전체 블록 복사로 정의
- [x] Cmd+A 이후 문자 입력 시 전체 교체, Enter 시 삭제 후 빈 블록 생성
- [x] 삭제 후 첫 번째 블록에 자동 포커스

## 6. 블록 뷰어 제공

- [ ] 읽기 전용 `BlockViewer` 컴포넌트 구현 (contentEditable 없이 블록 데이터를 렌더링)
- [ ] 모든 블록 타입에 대한 뷰어 렌더러 구현 (paragraph, heading, image, list, quote, divider 등)
- [ ] 에디터 전용 UI 제거 (드래그 핸들, +/삭제 버튼, 블록 메뉴 등)
- [ ] `BlockViewer`를 라이브러리 public API로 export
