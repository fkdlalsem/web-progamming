$(document).ready(function(){
    //메뉴 효과
    $("ul.gnb>li").mouseover(function(){
        $("ul.sub").stop().slideDown();
    });
    $("ul.gnb>li").mouseout(function(){
        $("ul.sub").stop().slideUp();
    });

    //슬라이드 애니메이션
    var slide = $(".slide li");
    var sno = 0;
    var lastno = slide.length-1;
    function playSlide(){
        $(slide[sno]).animate({"top":"300px"},1000,function(){
            $(this).css({"top":"-300px"});
        });
        sno++;
        if(sno>lastno) sno = 0;
        $(slide[sno]).animate({"top":"0"},1000);
    }
    var timer = setInterval(function(){
        playSlide();
    },2000);
    
    //공지사항,갤러리 탭
    $(".notice_gal h3").click(function(){
        $(".notice_gal h3, .notice_gal ul").removeClass("on");
        $(this).addClass("on");
        $(this).next("ul").addClass("on");
    });

    //레이어 팝업창
    //공지사항 첫번째 클릭시 팝업창 보이기
    $("ul.notice li").eq(0).click(function(){
        $(".modal").show();
    });
    //닫기 버튼 클릭 시 팝업창 숨기기
    $(".btn").click(function(){
        $(".modal").hide();
    });

}); //ready end
