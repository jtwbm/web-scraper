const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function scrapeList(page) {
    const pageURL = 'https://www.ozon.ru/category/igrushki-i-igry-7108';
    await page.goto(pageURL);

    const html = await page.content();
    const $ = await cheerio.load(html);

    const result = await $('.tile-wrapper').map((index, link) => {
        const cartUrl = $(link).attr('href');
        return pageURL + $(link).attr('href');
    }).get();

    console.log('scrapeList done!');

    return result;
}

async function scrapeCart(page, list) {
    let result = [];
    for(let i = 0; i < list.length; i++) {
        const url = list[i];
        await page.goto(url);
        const html = await page.content();
        const $ = await cheerio.load(html);

        result.push({
            url: url,
            title: $('.detail h1 span').text()
        });

        await sleep(300);
    }

    console.log('scrapeCart done!');

    return result;
}

async function sleep(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

async function main() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const list = await scrapeList(page);
    const carts = await scrapeCart(page, list);

    console.table(carts);
}

main();