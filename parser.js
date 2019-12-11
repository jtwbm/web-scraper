const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const fs = require("fs");
const Listing = require('./model/Listing');

export function add(a, b) {
    return a + b;
}


async function connectToMongoDB() {
    await mongoose.connect('mongodb+srv://scraper-admin:<pass>@scraper-cluster-orbiu.mongodb.net/toys?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('connect to mongoDB');
}

async function scrapeList(page) {
    const pageURL = 'https://www.ozon.ru/category/igrushki-i-igry-7108';
    await page.goto(pageURL);

    await sleep(3000);

    const html = await page.content();
    const $ = await cheerio.load(html);

    const result = await $('.widget-search-result-container a').map((index, link) => {
        const cartUrl = $(link).attr('href');
        return 'https://www.ozon.ru' + $(link).attr('href');
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

        await sleep(1000);

        const $ = await cheerio.load(html);

        let optResult = [];
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

        const price = Number($('.top-sale-block > div > div:first-child > div:first-child > div > div:first-child > div > div > div > span:first-child').text().replace(/[ \s₽]/gi, '').trim());

        const toy = {
            title: $('.detail h1 span').text().trim(),
            description: $('#section-description > div > div > div > div').text().trim(),
            category: 'toys',
            img: await getImg($('.magnifier-image img').attr('src'), 'toys', page),
            price: price,
            options: optResult,
        };

        // const listingModel = new Listing(toy);
        // listingModel.save();

        result.push(toy);
    }

    console.log('scrapeCart done!');

    return result;
}

async function getImg(imgUrl, category, page) {
    const imgView = await page.goto(imgUrl);
    const imgName = Math.round(Math.random() * 1000000) + '.' + imgUrl.split('.').pop();
    const imgPath = `./media/${ category }/${ imgName }`;
    if (!fs.existsSync(`./media/${ category }/`)){
        fs.mkdirSync(`./media/${ category }/`);
    }
    fs.writeFile(imgPath, await imgView.buffer(), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    return imgPath;
}

async function sleep(ms) {
    return new Promise((resolve, reject) => setTimeout(resolve, ms));
}

async function main() {
    // await connectToMongoDB();
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const list = await scrapeList(page);
    const carts = await scrapeCart(page, list);

    browser.close();

    const json = JSON.stringify(carts);
    fs.writeFile('jsons/toys.json', json, 'utf8', err => {
        if(err) console.error(err);
    });
}

main();
