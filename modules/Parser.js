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

    async getImg(imgUrl) {
        const img = await this.page(imgUrl, true);
        const result = {
            data: img,
            extension: imgUrl.split('.').pop(),
        };
        return result;
    }

    async $(html) {
        return await cheerio.load(html);
    }

    async _sleep(ms) {
        return new Promise((resolve, reject) => setTimeout(resolve, ms));
    }
}
