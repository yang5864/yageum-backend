# yageum-backend

야금(Ya-Geum) 프로젝트의 백엔드 서버입니다.  
`json-server`를 기반으로 구동되며, Railway에 배포되어 있습니다.

---

## 기술 스택

- **Runtime:** Node.js
- **API 서버:** json-server 0.17.x
- **DB:** db.json (파일 기반)
- **배포:** Railway
- **데이터 영속성:** Railway Volume (`/data` 마운트)

---

## 로컬 실행

```bash
npm install
npm start
# → http://localhost:3000
```

---

## API 엔드포인트

json-server가 `db.json`의 최상위 키를 자동으로 REST 엔드포인트로 노출합니다.

| 리소스 | 엔드포인트 |
|---|---|
| 유저 | `/users` |
| 거래 내역 | `/transactions` |
| 월별 챌린지 | `/monthlyChallenge` |
| 챌린지 참여 현황 | `/challenges` |
| 챌린지 리더보드 | `/challengeLeaderboard` |
| 챌린지 히스토리 | `/challengeHistory` |

### 보안 패치 (비밀번호 마스킹)

`/users` 엔드포인트로 데이터를 응답할 때, 서버에서 `password` 필드를 `"비공개"`로 치환한 뒤 반환합니다.  
실제 비밀번호는 절대 클라이언트로 전송되지 않습니다.

---

## Railway 배포 구조

### 왜 Railway Volume을 마운트했나?

Railway는 서버를 재우지 않지만, **GitHub에 코드를 Push하면 재배포(Redeploy)가 트리거됩니다.**  
이때 기존 컨테이너는 삭제되고 GitHub 저장소의 `db.json`을 기준으로 새 컨테이너가 올라오기 때문에, 재배포 이전에 가입한 유저 데이터가 모두 초기화되는 문제가 있습니다.

이를 방지하기 위해 **Railway Volume**을 `/data` 경로에 마운트하고, 실제 DB 파일을 `/data/db.json`에 저장합니다.  
Volume은 컨테이너 라이프사이클과 독립적으로 유지되므로 재배포해도 데이터가 사라지지 않습니다.

### 최초 배포 시 데이터 초기화 흐름

```
배포 시작
  └─ /data/db.json 존재하는가?
       ├─ YES → 기존 데이터 그대로 사용
       └─ NO  → 저장소의 db.json을 /data/db.json으로 복사 (최초 1회)
```

### 환경별 DB 경로

| 환경 | DB 파일 경로 |
|---|---|
| 로컬 (`NODE_ENV` 미설정) | `./db.json` |
| Railway (`NODE_ENV=production`) | `/data/db.json` |

Railway 환경 변수에 `NODE_ENV=production`이 설정되어 있어야 합니다.

---

## 환경 변수

Railway 대시보드의 Variables 탭에서 아래 값을 설정합니다.

| 변수명 | 값 | 설명 |
|---|---|---|
| `NODE_ENV` | `production` | 영구 저장소 경로 활성화 |
| `PORT` | (자동) | Railway가 자동 주입 |
