var count = 0;
var randomNumber = Math.floor(Math.random()*100)+1;
//컴퓨터 무작위 수(1~100) 생성

document.querySelector("#try").onkeypress =function(e){ //keypress 이벤트가 발생했을 때(텍스트 필드에서 어떤 키를 눌렀을 때) 함수 실행
if(e.keyCode == 13 || e.which == 13){//눌린 키의 키코드 값이 13이라면(눌린 키가 Enter키라면)
finding(); //finding 함수 실행
return false; //keypress 이벤트가 발생했을 때 브라우저가 기본으로 하는 동작 취소 
}
}

function finding()
{
var userNumber = document.querySelector("#try").value; //사용자가 입력한 숫자 가져오기
if(userNumber >=1 && userNumber <= 100){ //사용자가 입력한 숫자가 1~100일 경우 실행
if(randomNumber > userNumber){ //컴퓨터 숫자가 클 경우
document.querySelector("#display").innerHTML ="UP!"; //#display 영역에 UP! 표시
}
else if(randomNumber < userNumber){//컴퓨터 숫자가 작을 경우
document.querySelector("#display").innerHTML = "DOWN!"; //#display 영역에 DOWN! 표시
}
else{ //컴퓨터 숫자를 맞혔을 경우
document.querySelector("#display").innerHTML = "<span style='color:red'>맞혔습니다!</span>"; //#display 영역에 빨간색으로 맞혔습니다! 표시
}

document.querySelector("#try").value=""; //사용자가 다시 숫자를 입력할 수 있도록 텍스트 필드 지우기
count++; //시도 횟수 카운트
document.querySelector("#counter").innerHTML = "시도 횟수 : " + count + "회"; //#counter 영역에 시도 횟수 표시
}
else //사용자가 입력한 숫자가 1~100이 아닐 경우
alert("1과 100 사이의 숫자를 입력하세요."); //알림창으로 에러 메시지 표시
}