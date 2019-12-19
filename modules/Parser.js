const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require("fs");
const rimraf = require("rimraf");
const File = require('./File.js');
// const mongoose = require('mongoose');
// const Listing = require('./model/Listing');


module.exports = class Parser {
    constructor(config = {}) {
        this.file = new File();
    }

    async renderData() {
        // await connectToMongoDB();
        const page = await this.page();
        const list = await scrapeList(page);
        const carts = await scrapeCart(page, list);

        const json = JSON.stringify(carts);
        fs.writeFile('jsons/toys.json', json, 'utf8', err => {
            if(err) console.error(err);
        });
    }

    async page(url = '') {
        const browser = await puppeteer.launch({ headless: true });
        let page = await browser.newPage();

        if(url.length) {
            page = await page.goto(url);
            return { browser, page };
        }

        browser.close();

        return page;
    }

    async getHTML(url) {
        const page = await this.page(url);
        const html = await page.content();

        return html;
    }

    async getUrlList(html) {
        const $ = await cheerio.load(html);

        const result = await $('.widget-search-result-container a').map((index, link) => {
            const cartUrl = $(link).attr('href');
            return 'https://www.ozon.ru' + $(link).attr('href').trim();
        }).get();

        return result;
    }

    async getCartData(html) {
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
            img: await this.getImg($('.magnifier-image img').attr('src'), 'toys', 'media')
        };

        return result;
    }

    async getImg(imgUrl, category, mediaFolder) {

        const imgView = await this.page(imgUrl);
        const imgName = Math.round(Math.random() * 1000000) + '.' + imgUrl.split('.').pop();
        const imgPath = `./${ mediaFolder }/${ category }/${ imgName }`;

        this.file.mkDir(`./${ mediaFolder }/${ category }/`);

        fs.writeFile(imgPath, await imgView.page.buffer(), function (err) {
            if (err) {
                return console.log(err);
            }
        });

        imgView.browser.close();

        return imgPath;
    }

    // async connectToMongoDB() {
    //     await mongoose.connect('mongodb+srv://scraper-admin:<pass>@scraper-cluster-orbiu.mongodb.net/toys?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });
    //     console.log('connected to mongoDB');
    // }
}
