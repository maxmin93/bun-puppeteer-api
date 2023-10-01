import puppeteer, { Browser, TimeoutError } from 'puppeteer';
import { sleep } from 'bun';

export const launchBrowser = async () => {
  return await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox'], // (도커) root 실행 아니더라도 필요하다
    executablePath:
      './chrome/mac_arm-117.0.5938.92/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  });
};

export const searchPlaces = async (browser: Browser, q: string) => {
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(10000); // 10 sec

  let result: string[] = [];
  try {
    // console.log('1. navigate the page to a URL');
    await page.goto('https://naver.com/', {
      waitUntil: 'load',
      timeout: 6000, // 6 sec
    });
    // Set screen size
    await page.setViewport({ width: 1280, height: 1024 });

    // console.log('2. focus search_input_box');
    const searchInputSelector = '.search_input_box > input';
    await page.waitForSelector(searchInputSelector);
    await page.focus(searchInputSelector);

    // console.log('3. Type into search box');
    await page.type(searchInputSelector, q);

    // Wait and click search Button
    const searchButtonSelector = '.btn_search';
    await page.waitForSelector(searchButtonSelector);
    await page.click(searchButtonSelector);

    // deprecated: await page.waitForTimeout(1000)
    // await new Promise((r) => setTimeout(r, 1000));
    await sleep(100);

    // console.log('4. Wait and click on first result');
    const searchResultSelector = '.place-app-root .api_subject_bx ul';
    const placesSection = await page.waitForSelector(searchResultSelector);

    const placeHandles = await placesSection?.$$('li');
    const titles = placeHandles?.map(async (handle) => {
      const titleSelector = await handle.$('.place_bluelink');
      return await titleSelector?.evaluate((el) => el.textContent);
    });
    result = (await Promise.all<string>(titles ?? [])) as string[];
  } catch (e) {
    if (e instanceof TimeoutError) {
      console.log('** TimeoutError:', e);
    } else {
      console.log('** Other Errors:', e);
    }
  } finally {
    await page.close();
  }
  console.log('places =', result);
  return result;
};
