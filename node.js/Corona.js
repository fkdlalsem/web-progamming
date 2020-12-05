const request = require('request');
const cheerio = require('cheerio');

function Corona(){
    return new Promise( (resolve, reject)=>{
        const url = "http://ncov.mohw.go.kr/bdBoardList_Real.do";
        request(url, (err, res, body)=>{
            let $ = cheerio.load(body);
            let total = $(".caseTable .ca_value").eq(0).text();
            total = total.split("").filter(x => x != ",").join("") * 1;
            let block = $(".caseTable .ca_value ul .inner_value");
            let inc = parseInt(block.eq(0).text().substring(1));

            let data = {total,inc,incIn:parseInt(block.eq(1).text()),incOut:parseInt(block.eq(2).text())};
            resolve(data);
        });
    });
    
}

module.exports.Corona = Corona;

Corona().then(data => {
    console.log(data);
});
// let p = new Promise((resolve, reject)=>{
//     setTimeout(()=>{
//         console.log("안녕하세요1");
//         resolve("넘겨주는 데이터");
//     }, 2000);
// });

// p.then( result => {
//     console.log(result);
//     console.log("안녕하세요2");
// });
