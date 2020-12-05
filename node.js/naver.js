const {Builder, By, Key, until} = require('selenium-webdriver');
//구조분해 할당

//async는 비동기 함수야.
async function test(){
    const driver = await new Builder().forBrowser('chrome').build();

    try {
        await driver.get('https://www.naver.com');
        await driver.findElement(By.css("#query"))
                    .sendKeys("안녕하세요", Key.RETURN);

        await driver.wait(until.titleIs('안녕하세요 : 네이버 통합검색'), 1000);
        //.title_area .title
        let titleBtn = await driver.findElement(By.css(".title_area .title"));

        titleBtn.click();
    } finally {
        console.log("종료");
    }
}

test();