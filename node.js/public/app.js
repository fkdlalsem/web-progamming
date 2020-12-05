window.onload = function(){

    const socket = new io();

    const chatList = document.querySelector("#chatList");
    chatList.innerHTML = "";
    //채팅방의 내용을 깨끗하게 지워준다.

    const chatInput = document.querySelector("#msgText");
    const sendBtn = document.querySelector("#sendBtn");

    chatInput.addEventListener("input", e => {
        if(e.target.value.trim() !== "") {
            sendBtn.classList.add("on");
        }else{
            sendBtn.classList.remove("on");
        }
    });

    sendBtn.addEventListener("click", e => {
        let msg = chatInput.value; //input 타입의 값을 가져온다.
        socket.emit("msg", {msg});
    });

    socket.on("chat", data => {
        const {msg, sender} = data; 
        //메시지로부터 메시지와 보낸이를 분리해서 저장한다.
        const msgLi = document.createElement("div");
        let str = sender === socket.id ? "msg my" : "msg";
        msgLi.innerHTML = `<li class="${str}">${msg}</li>`;
        chatList.appendChild(msgLi.firstChild);

        const c = chatList;
        c.scrollTop = c.scrollHeight - c.clientHeight;
    });
    
    let myNickname = ""; //닉네임을 저장할 변수
    const userDiv = document.querySelector("#userList");
    userDiv.innerHTML = "";
    socket.on("another", data => {
        const {list} = data;
        userDiv.innerHTML = "";
        list.forEach(x => {
            const div = document.createElement("div");
            let str = x.nick === myNickname ? "user my" : "user";
            div.innerHTML = `<div class="${str}">${x.nick}</div>`;
            userDiv.appendChild(div.firstChild);
        });
    });
    
    socket.on("login-ok", data => {
        myNickname = data.nick; //승인받은 닉네임을 내 변수에 저장
        const popup = document.querySelector("#popup");
        popup.style.display = "none";
    });

    const loginBtn = document.querySelector("#loginBtn");
    const nicknameInput = document.querySelector("#nickname");

    loginBtn.addEventListener("click", e => {
        const nick = nicknameInput.value;
        if(nick.trim() === ""){
            alert("공백은 쓸 수 없습니다.");
            return;
        }
        socket.emit("send-nickname",{nick}); //JS 구조 단순화
    });


    //서버를 끄고 재시작 한뒤에 텍스트에 무엇인가 입력후 센드 버튼을 눌러봐라
    //페이지도 한번 새로고침 해야한다.
    //10.114.52.99:9090
}