const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require("fs");
const rimraf = require("rimraf");
const File = require('./File.js');
const cliProgress = require('cli-progress');

module.exports = class Scraper {
    constructor() {
        this.file = new File();
    }

    async init(config) {
        let consoleBar;
        let result = [];

        if(config.beforeFn) await config.beforeFn();

        if(config.progressBar) {
            consoleBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
            consoleBar.start(config.urls.length, 0);
        }

        const fn = async (index) => {
            const html = await this.page(config.urls[index]);
            await this._sleep(1000);
            
            await this.getData(html, async ($) => {
                let itemData = {};

                await asyncForEach(config.items, async (item) => {
                    if(item.key) {
                        itemData[item.key] = $(item.el).text() || null;
                        if(item.value) itemData[item.key] = item.value;
                        if(item.callback) itemData[item.key] = await item.callback(item.el, $, index);
                    } else {
                        itemData = $(item.el).text() || null;
                        if(item.value) itemData = item.value;
                        if(item.callback) itemData = await item.callback(item.el, $, index);
                    }
                });
                result.push(itemData);

                async function asyncForEach(array, callback) {
                      for (let index = 0; index < array.length; index++) {
                        await callback(array[index], index, array);
                      }
                }


            });

            if(index + 1 < config.urls.length) {
                if(config.progressBar) consoleBar.update(index + 1);
                await fn(index + 1);
            } else {
                if(config.progressBar) {
                    consoleBar.update(index + 1);
                    consoleBar.stop();
                }
                if(config.afterFn) await config.afterFn(result);
            }
        }

        await fn(0);
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
        if(!imgUrl) return false;

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
