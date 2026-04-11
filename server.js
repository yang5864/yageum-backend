const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

// 영구 저장소 경로 설정 (로컬에서는 그냥 db.json, Railway에서는 /data/db.json)
const dbPath =
    process.env.NODE_ENV === 'production' ? '/data/db.json' : 'db.json';

// Railway 환경이고, 영구 저장소에 아직 db.json이 없다면 최초 1회 복사해줌
if (process.env.NODE_ENV === 'production' && !fs.existsSync(dbPath)) {
    fs.copyFileSync(path.join(__dirname, 'db.json'), dbPath);
}

const server = jsonServer.create();
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 3000;

server.use(middlewares);

// [보안 패치] 클라이언트에게 데이터를 보내기 전에 가로채기
router.render = (req, res) => {
    let data = res.locals.data;

    // 비밀번호를 가리는 함수
    const maskPassword = (obj) => {
        if (obj && obj.password) {
            obj.password = '비공개'; // 아예 삭제하려면 delete obj.password; 사용
        }
        return obj;
    };

    // 데이터가 배열일 때 (예: 랭킹 목록 조회)
    if (Array.isArray(data)) {
        data = data.map((item) => maskPassword({ ...item }));
    }
    // 데이터가 단일 객체일 때 (예: 내 정보 조회)
    else if (data && typeof data === 'object') {
        data = maskPassword({ ...data });
    }

    // 가려진 데이터를 클라이언트로 응답
    res.jsonp(data);
};

server.use(router);

server.listen(port, () => {
    console.log(`JSON Server is running on port ${port}`);
});
