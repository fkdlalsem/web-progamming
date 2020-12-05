function Pager(currentPage, totalCnt, pn = 10, cn = 5){
    let returnData = {
        prev:false,
        next:true,
        start:1,
        end:10,
        currentPage
    };

    let totalPage = Math.ceil(totalCnt / pn); 
    //전체 글의 개수를 페이지당 글의 개수로 나눠준다.
    //이를 통해 총 페이지수를 구한다.

    let endPage = Math.ceil(currentPage / cn ) * cn;
    returnData.start = endPage - cn + 1; //시작페이지
    //totalPage와 endPage중 작은 값으로 넣어준다
    if(returnData.start != 1){ //시작페이지가 1이 아니면 이전이 존재
        returnData.prev = true;
    }

    returnData.end = endPage <= totalPage ? endPage : totalPage;
    if(endPage >= totalPage){
        returnData.next = false;
    }

    return returnData;
}

module.exports.Pager = Pager;  //Pager라는 이름으로 Pager함수를 내보낸다.