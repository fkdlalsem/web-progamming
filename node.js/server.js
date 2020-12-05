const express = require('express'); //웹 서버 프레임워크
const http = require('http');
const fs = require('fs'); //fileSystem의 약자 
const path = require('path'); // 경로 합성 모듈
const socket = require('socket.io'); //소켓 통신을 위해 소켓io를 추가한다.
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const {Pager} = require('./Pager');
const {Corona} = require('./Corona');
//프로토타입 정의
Date.prototype.fDate = function(){
    return `${this.getFullYear()}-${this.getMonth() + 1}-${this.getDate()}`;
};

const connectionInfo = {
    user:'yy_40111',
    password:'1234',
    host:'gondr.asuscomm.com',
    database:'yy_40111'
};
//지정된 정보로 데이터베이스에 연결한다.
const con = mysql.createConnection(connectionInfo);


const app = express(); //익스프레스를 만들어준다.
const server = http.createServer(app); //웹서버에 익스프레스를 탑재한다.
const io = socket(server); //소켓을 서버에 묶어준다.


//지금 소켓 설치후 5번과 9번줄만 쳤어
//localhost:52000/socket.io/socket.io.js
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');
//정적인 파일들을 서비스할 폴더로 public 폴더를 지정한다.
app.use(express.static(path.join(__dirname, 'public')));

//post로 넘어온 데이터를 json형태로 파싱해서 가져온다.
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//세션 설정
app.use(session({
    resave:false,   //요청이 변경이 안되었어도 세션정보를 저장할것인가?
    saveUninitialized:false, //초기화 되어있지 않은 세션도 저장할거냐?
    secret:'secretstring-swjh'  //쿠키에 암호화할 것인가?
}));

//미들웨어 설정
app.use((req, res, next)=>{
    if(req.session.isLogin !== undefined){
        //ejs에서 사용할 user변수에 session에 담긴 유저 정보를 넣는다.
        res.locals.user = req.session.isLogin;
    }

    if(req.session.flashMsg !== undefined){
        res.locals.flashMsg = req.session.flashMsg;
        req.session.flashMsg = undefined; //옮긴 후 플래시메시지 삭제
    }

    next();
});

app.get('/Corona', (req, res)=>{
    Corona().then(data =>{
        res.render('Corona',data);
    });
});

app.get('/', (req, res)=>{
    res.render('main');
});
app.get('/register', (req, res)=>{
    res.render('register');
});
app.post('/register', (req, res)=>{
    
    let sql = "INSERT INTO users (id, name, password) "
                + "VALUES (?, ?, PASSWORD(?))";
    const {userid, username, password, passwordc} = req.body;
    //id, 이름, 비번이 비어있는 값이거나, 비번과 비번확인이 틀리다면
    //회원가입을 하지 않는다.
    let data = [userid, username, password];
    con.query(sql, data, (err, result)=>{
        if(!err){
            console.log("성공적으로 회원가입되었습니다.");
            res.redirect('/login');
        }else {
            console.log(err);
            res.redirect('/register');
        }
    });
});

app.get('/login', (req, res)=>{
    res.render('login');
});
//로그인 처리 라우터
app.post('/login', (req, res)=>{
    const {id, pw} = req.body;
    const sql = "SELECT * FROM users WHERE id = ? AND password = PASSWORD(?)";
    //sql, 데이터, 콜백함수
    con.query(sql, [id, pw], (err, result)=>{
        if(result.length === 1) {
            req.session.isLogin = result[0];
            //세션에 isLogin이란 이름의 변수를 만들고 거기에 DB에서 가져온 유저를 넣는다.
            req.session.flashMsg = {c:'alert-primary', msg:'로그인 성공'};
            if(req.session.target !== undefined){
                res.redirect(req.session.target);
                req.session.target = undefined;
            }else{
                res.redirect('/'); //로그인 성공시 /로 이동시킨다.
            }
        }else{
            //로그인 실패
            req.session.flashMsg = {c:'alert-danger', msg:'로그인 실패 - 아이디와 비번 확인'};
            res.redirect('/login');
        }
    });
//gondr.asuscomm.com/phpmyadmin
});

app.get('/logout', (req, res)=>{
    req.session.isLogin = undefined;
    req.session.flashMsg = {c:'alert-primary', msg:'로그아웃되었습니다.'};
    res.redirect('/');
});

app.get('/chatroom', (req, res)=>{
    res.render('chatroom');
});

app.use('/board/write',(req, res, next)=>{
    if(req.session.isLogin !== undefined){
        next();
    }else{
        req.session.target = req.url;
        req.session.flashMsg = {c:'alert-danger', msg:'로그인 후 글쓰기 가능'};
        res.redirect("/login");
    }
});

app.get('/board', (req, res) => {
    let page = req.query.p === undefined ? 1 : req.query.p;
    if(isNaN(page))
        page = 1;
    
    
    const cntSQL = "SELECT COUNT(id) AS cnt FROM boards";
    con.query(cntSQL,[], (err, result)=>{
        let totalCnt = result[0].cnt;
        let pager = Pager(page, totalCnt);
        const sql = `SELECT * FROM boards ORDER BY id DESC LIMIT ${(page-1)*10}, 10`; 
        //이렇게하면 모든 글이 다 가져와져
        con.query(sql, [], (err, result)=>{
            res.render('board/list', {list:result, pager});
        });    
    });
    
});
// board/view/5
app.get('/board/view/:id', (req, res)=>{
    const id = req.params.id;
    const sql = `SELECT b.*, u.name FROM users AS u, boards AS b 
                 WHERE u.id = b.writer AND b.id = ?`;
    //해당 글이 존재하는가를 따지고
    con.query(sql, [id], (err, result)=>{
        if(result.length === 1){
            // 존재하는 글이라면 조회수를 1증가시켜서 보내주고
            result[0].view_cnt++; //조회수 1증가시켜주고

            let myArticle = false; //내 글인지 여부
            if(req.session.isLogin !== undefined){ //로그인이 되어 있다면
                let user = req.session.isLogin;
                myArticle = result[0].writer == user.id;
            }

            res.render('board/view', {viewData:result[0], myArticle});
            //이렇게만 하면 DB는 증가 없이 화면에서만 증가한다. 

            const updateSQL = "UPDATE boards SET view_cnt = ? WHERE id = ?";
            // SELECT b.*, u.name FROM users AS u, boards AS b WHERE u.id = b.writer
            con.query(updateSQL, [result[0].view_cnt, id], (err, result)=>{
                //아무것도 하지 않는다.
            });
        }else{
            req.session.flashMsg = {c:'alert-danger', msg:'존재하지 않는 글입니다.'};
            res.redirect('/board');
        }
    });
    
});

app.get('/board/write', (req, res)=>{
    res.render('board/write');
});

app.post('/board/write', (req, res) => {
    const {title, content} = req.body; //보내준 title과 content뽑아오고
    const {id} = req.session.isLogin; //로그인한 사용자의 id 뽑아오고
    const sql = "INSERT INTO boards (title, content, date, writer) " 
                                + " VALUES (?, ?, NOW(), ?)";
    con.query(sql, [title, content, id], (err, result)=>{
        //회원가입쪽을 참조해서 이 부분을 완성시켜 보세요.
        if(!err){
            req.session.flashMsg = {c:'alert-primary', msg:'성공적으로 글 작성'};
            res.redirect('/board'); //이부분 아직 구현안되어서 에러가 날꺼
        }else{
            req.session.flashMsg = {c:'alert-danger', msg:'글작성 실패'};
            res.redirect('/board/write');
        }
    });
});

app.get('/board/delete/:id',(req,res) => {
    let id = req.params.id;
    if(req.session.isLogin === undefined){
        req.session.flashMsg = {c:'alert-danger', msg:'권한이 없습니다.'};
        res.redirect('/board');
        return;
    }

    let user = req.session.isLogin;
    const sql = "SELECT * FROM boards WHERE id = ? AND writer = ?";
    con.query(sql,[id, user.id],(err, result)=>{
        if(result.length < 1){
        req.session.flashMsg = {c:'alert-danger', msg:'권한이 없습니다.'};
        res.redirect('/board');
        return;
        }
        const delSQL = "DELETE FROM boards WHERE id = ?";
        con.query(delSQL, [id], (err, result)=>{
        req.session.flashMsg = {c:'alert-success', msg:'성공적으로 삭제되었습니다.'};
        res.redirect('/board');
        return;
        });
    });
});

app.get('/board/mod/:id', (resq,res)=>{
    let id = req.params.id;
    if(req.session.isLogin === undefined){
        req.session.flashMsg = {c:'alert-danger', msg:'권한이 없습니다.'};
        res.redirect('/board');
        return;
    }

    let user = req.session.isLogin;
    const sql = "SELECT * FROM boards WHERE id = ? AND writer = ?";
    con.query(sql, [id, user.id], (err, result)=>{
        if(result.length < 1){
        req.session.flashMsg = {c:'alert-danger', msg:'권한이 없습니다.'};
        res.redirect('/board');
        return;
        }
        res.render('board/mod', {viewData:result[0]});
    });
});

// INSERT INTO boards (title, content, date, writer, view_cnt) (SELECT title, content, date, writer, view_cnt FROM boards)
//실제 글수정 루틴
app.post('/board/mod', (req, res)=>{
    // let id = req.params.id; //글번호를 저장해두고
    const {id, title, content} = req.body; //post로 넘겨준  title,content를 받아온다.
    if(req.session.isLogin === undefined) {
        req.session.flashMsg = {c:'alert-danger', msg:'권한이 없습니다.'};
        res.redirect('/board');
        return;
    }

    let user = req.session.isLogin; //로그인된 사람의 정보를 가져온다.
    const sql = "SELECT * FROM boards WHERE id = ? AND writer = ?";
    con.query(sql, [id, user.id], (err, result)=>{
        if(result.length < 1){
            req.session.flashMsg = {c:'alert-danger', msg:'권한이 없습니다.'};
            res.redirect('/board');
            return;
        }
        const updateSQL = "UPDATE boards SET title = ?, content = ? WHERE id = ?";
        
        con.query(updateSQL, [title, content, id], (err, result)=>{
            req.session.flashMsg = {c:'alert-primary', msg:'성공적으로 수정되었습니다.'};
            res.redirect(`/board/view/${id}`);
            return;
        });
    });
});
//소켓 전송 규칙 작성
let userList = []; //접속한 유저들을 관리하는 배열
io.on("connect", socket => {
    console.log(socket.id + "님이 접속");
    // const ip = socket.handshake.address;
    // console.log(ip);
    socket.on("disconnect", ()=>{
        let idx = userList.findIndex(x => x.id === socket.id);
        userList.splice(idx, 1); //해당 유저를 잘라낸다.
        io.emit("another", {list:userList});
        console.log(socket.id + "님이 로그아웃했습니다.");
    });

    socket.on("msg", data => {
        const {msg} = data; //구조분해 할당을 통해 msg만을 뽑는다.
        io.emit("chat", {msg:msg, sender:socket.id});
    });

    socket.on("send-nickname", data => {
        if(socket.isLogin) return;

        const {nick} = data;
        userList.push({id:socket.id, nick});
        socket.isLogin = true;

        //로그인한 녀석에게는 login-ok를 보내주고
        socket.emit("login-ok", {nick});
        //모든 유저에게는 another를 보내준다.
        io.emit("another", {list:userList});
    });
});
//저장하고 ctrl+c를 눌러서 서버를 끄고 재시작해라.

server.listen(52000, function () {
    console.log("서버가 52000 포트에서 실행중입니다.");
}); 
//10.114.52.99:9090