const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require("fs");
const rimraf = require("rimraf");
const File = require('./File.js');

module.exports = class Parser {
    constructor(config = {}) {
        this.file = new File();
    }
    
    async page(url = '', isFile = false) {
        const browser = await puppeteer.launch({ headless: true });
        let page = await browser.newPage();

        if(url.length) {
            const view = await page.goto(url, {waitUntil: 'load', timeout: 0});

            if(isFile) {
                const file = await view.buffer();
                browser.close();
                return file;
            }

            await this._sleep(1000);
            page = await page.content();
        }

        browser.close();

        return page;
    }

    async getData(html, callback) {
        const $ = await this.$(html);
        return await callback.call(null, $);
    }

    async getImg(imgUrl, category, mediaFolder) {
        // разбить получение картинки и запись в ФС
        const data = await this.page(imgUrl, true);
        const imgName = Math.round(Math.random() * 1000000) + '.' + imgUrl.split('.').pop();
        const imgPath = `./${ mediaFolder }/${ category }/${ imgName }`;

        await this.file.mkDir(`./${ mediaFolder }/${ category }/`);

        fs.writeFileSync(imgPath, data, function (err) {
            if (err) {
                return console.log(err);
            }
        });

        return imgPath;
    }

    async $(html) {
        return await cheerio.load(html);
    }

    async _sleep(ms) {
        return new Promise((resolve, reject) => setTimeout(resolve, ms));
    }
}
