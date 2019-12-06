const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// const scrapingResults = {
// 	{
// 		title: 'Customer Service Manager - Call Center',
// 		datePosted: new Date('20190-12-03 00:44:00'),
// 		neighborhood: '(St. Petersburg, FL)',
// 		url: 'https://stpetersburg.craigslist.org/csr/d/customer-service-manager-call-center/7030972798.html?lang=en&cc=us',
// 		jobDescription: 'The Customer Service Manager is responsible for overseeing the daily activities of the program and for meeting or exceeding the personal performance measures established for the service team. The manager provides the foundation for success by contributing the needed resources, guidance and feedback. The company is looking for someone who has a strong background in managing and overseeing call centers and customer service representatives.',
// 		compensation: 'Depending on Experience'
// 	}
// };

async function main() {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto('https://stpetersburg.craigslist.org/d/jobs/search/jjj?lang=en&cc=us');

	const html = await page.content();
	const $ = await cheerio.load(html);

	$('.result-title').each((index, item) => {
		console.log($(item).text());
	});
}

main();