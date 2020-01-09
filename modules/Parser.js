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

    async getData(html, options = []) {
        // сделать один общий коллбек для страницы в конфиге
        const $ = await this.$(html);
        const result = [];

        await options.forEach(async config => {
            const data = await $(config.el).map((index, link) => {
                return config.callback.call(null, link, $);
            }).get();

            result.push(data);
        });

        return result;
    }

    async getCartData(html) {
        // добавить конфиг
        const $ = await this.$(html);

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
