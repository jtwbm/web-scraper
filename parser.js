const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require("fs");
// const mongoose = require('mongoose');
// const Listing = require('./model/Listing');

const cartConfig = {
    listUrl: 'https://www.ozon.ru/category/nastolnye-igry-dlya-detey-7172/',
    cartUrl: 'https://www.ozon.ru/context/detail/id/163337167/',
    imgUrl: 'https://cdn1.ozone.ru/multimedia/c1200/1026585512.jpeg'
};

function renderJSON(obj, folder, fileName) {
    const json = JSON.stringify(obj);
    fs.writeFile(`${ folder }/${ fileName }.json`, json, 'utf8', err => {
        if(err) console.error(err);
    });
}

async function getCarts(cartUrls) {
    const result = [];
    cartUrls.each(async (cartUrl) => {
        const cartHTML = await getHTML(cartUrl);
        const cartData = await getCartData(cartHTML);
        result.push(cartData);
    });
    return result;
}

async function getUrlList(html) {
    const $ = await cheerio.load(html);

    const result = await $('.widget-search-result-container a').map((index, link) => {
        const cartUrl = $(link).attr('href');
        return 'https://www.ozon.ru' + $(link).attr('href').trim();
    }).get();

    return result;
}

async function getCartData(html) {
    await _sleep(3000);

    const $ = await cheerio.load(html);

    const price = Number($('.top-sale-block > div > div:first-child > div:first-child > div > div:first-child > div > div > div > span:first-child').text().replace(/[ \s₽]/gi, '').trim());

    const optResult = [];
    $('#section-characteristics dl').each((index, item) => {
        const titles = $(item).find('dt span').map((index, item) => {
            return $(item).text();
        }).get();
        const values = $(item).find('dd > div > *').map((index, item) => {
            return $(item).text();
        }).get();

        titles.forEach((item, index) => {
            optResult.push({
                title: item,
                value: values[index]
            })
        });
    });

    const result = {
        title: $('.detail h1 span').text().trim(),
        description: $('#section-description > div > div > div > div').text().trim(),
        category: 'toys',
        price,
        options: optResult,
        img: await getImg($('.magnifier-image img').attr('src'), 'toys', 'media')
    };

    return result;
}

async function getImg(imgUrl, category, mediaFolder) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    const imgView = await page.goto(imgUrl);
    const imgName = Math.round(Math.random() * 1000000) + '.' + imgUrl.split('.').pop();
    const imgPath = `./${ mediaFolder }/${ category }/${ imgName }`;

    mkDir(`./${ mediaFolder }/${ category }/`);

    fs.writeFile(imgPath, await imgView.buffer(), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    browser.close();

    return imgPath;
}

async function getHTML(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    browser.close();

    return html;
}

async function renderTestData() {
    try {
        const list = await getHTML(cartConfig.listUrl);
        const cart = await getHTML(cartConfig.cartUrl);

        fs.writeFile('__tests__/list.html', list, 'utf8', (err) => {});
        fs.writeFile('__tests__/cart.html', cart, 'utf8', (err) => {});
    } catch(err) {
        console.log(err);
    }
}

async function mkDir(path) {
    const dirList = path.split('/').filter(str => str.length);
    let currentPath = '';
    dirList.forEach(dirName => {
        currentPath += `${ dirName }/`;
        if(!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
        }
    });
}

async function rmDir(path) {
    const dirList = path.split('/').filter(str => str.length);

    rm(dirList);
    
    function rm(arPath) {
        if(arPath.length) {
            fs.rmdirSync(arPath.join('/'));
            arPath.splice(arPath.length - 1, 1);
            rm(arPath);
        }
    }
}

async function _sleep(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

module.exports = {
    cartConfig,
    getCartData,
    getHTML,
    renderTestData,
    getUrlList,
    getImg,
    renderJSON,
    mkDir,
    rmDir
};

// async function connectToMongoDB() {
//     await mongoose.connect('mongodb+srv://scraper-admin:<pass>@scraper-cluster-orbiu.mongodb.net/toys?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
//     console.log('connect to mongoDB');
// }

// async function main() {
//     // await connectToMongoDB();
//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     const list = await scrapeList(page);
//     const carts = await scrapeCart(page, list);

//     browser.close();

//     const json = JSON.stringify(carts);
//     fs.writeFile('jsons/toys.json', json, 'utf8', err => {
//         if(err) console.error(err);
//     });
// }

// main();
