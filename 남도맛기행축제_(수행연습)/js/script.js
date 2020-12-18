$(document).ready(function () {
    //메뉴 효과
    $("ul.gnb>li").mouseover(function () {
        $(this).find("ul.sub").stop().slideDown();
    });
    $("ul.gnb>li").mouseout(function () {
        $(this).find("ul.sub").stop().slideUp();
    });
    //슬라이드 애니메이션 효과
    var slide = $(".slide li");
    var sno = 0;
    var lastno = slide.length - 1;
    function playSlide() {
        $(slide[sno]).animate({
            "left": "800px"
        }, 1000, function () {
            $(this).css({ "left": "-800px" });
        });
        sno++;
        if (sno > lastno) sno = 0;
        $(slide[sno]).animate({
            "left": "0"
        }, 1000);
    }
    var timer = setInterval(function () {
        playSlide();
    }, 2000);
    //레이어 팝업
    $(".notice li").eq(0).click(function () {
        $(".modal").show();
    });
    $(".btn").click(function () {
        $(".modal").hide();
    });
});