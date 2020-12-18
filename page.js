const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const writeFile = promisify(fs.writeFile);

const CACHE_DIR = path.resolve(__dirname, '_cache');


getPageContent();

async function getPageContent() {
    const browser = await puppeteer.launch({
        headless: false,
      });
      let page = await browser.newPage();
      await page.goto('http://www.cuhumane.org/Adoption/SearchforAdoptablePets.aspx#/', {
          waitUntil: 'networkidle0',
          timeout: 3e6
      });
      const pageContent = await page.content();

      console.log(pageContent);
      await page.waitForNavigation();
      await initCache();
      await writeFileCache('cache', pageContent);
      return pageContent;
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