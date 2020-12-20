const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const fetch = require('node-fetch');

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

const CACHE_DIR = path.resolve(__dirname, '_cache');

main();

async function main() {
    const animalDetails = await getAdoptableCats();
}

/*TODO:
- can't have restrictions of 'no other animals' or 'no other cats'
- age restriction
- pics
*/

async function getPageContent() {
    const browser = await puppeteer.launch({
        headless: false,
      });
      let page = await browser.newPage();
      await page.goto('http://www.cuhumane.org/Adoption/SearchforAdoptablePets.aspx#/', {
          waitUntil: 'networkidle0',
          timeout: 3e6
      });
      await page.click('__cp-finder-checkbox'); //doesn't work
      const pageContent = await page.content();
      await initCache();
      await writeFileCache('cache', pageContent);
      return pageContent;
}

async function getAdoptableCats() {
    const bodyData = {
        "animalType": "Cat",
        "shelterId": "45200245-f870-e911-b49e-00155dff1f99",
        "siteId": ""
    };
    const response = await fetch('https://apishelter-prod-webapp.azurewebsites.net/CompanionConnect.asmx/GetFullAnimalDetails', {
        method: 'POST',
        body: JSON.stringify(bodyData),
        headers: {
            'Content-Type': 'application/json',  
        },
    });
    const fullResponseData = await response.json();
    const parsedResponse = JSON.parse(fullResponseData.d);
    return parsedResponse;
}

async function initCache() {
    let cacheStats;
    cacheStats = await fs.existsSync(CACHE_DIR);
    if (cacheStats && !cacheStats.isDirectory()) {
        await unlink(CACHE_DIR);
        cacheStats = false;
    }
    if(!cacheStats) {
        await mkdir(CACHE_DIR);
    }
}
async function writeFileCache(fileName, data) {
    let filePath;
    filePath = path.resolve(CACHE_DIR, fileName);
    await writeFile(filePath, data);
}