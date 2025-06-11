import puppeteer, { Browser, Page } from 'puppeteer';

describe('Browser Tests with Puppeteer', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true, // Set to false to see the browser
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    // Set viewport size
    await page.setViewport({ width: 1280, height: 720 });
  });

  test('should load Google homepage', async () => {
    // Navigate to Google
    await page.goto('https://www.google.com');

    // Wait for the page to load
    await page.waitForSelector('input[name="q"]');

    // Check the title
    const title = await page.title();
    expect(title).toContain('Google');

    // Check for search input
    const searchInput = await page.$('input[name="q"]');
    expect(searchInput).toBeTruthy();
  });

  test('should handle JavaScript interactions', async () => {
    // Create a simple HTML page with JavaScript
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><title>Test Page</title></head>
      <body>
        <button id="testBtn">Click me</button>
        <div id="result">Not clicked</div>
        <script>
          document.getElementById('testBtn').addEventListener('click', function() {
            document.getElementById('result').textContent = 'Clicked!';
          });
        </script>
      </body>
      </html>
    `;

    await page.setContent(htmlContent);

    // Wait for button to be available
    await page.waitForSelector('#testBtn');

    // Check initial state
    const initialText = await page.$eval('#result', el => el.textContent);
    expect(initialText).toBe('Not clicked');

    // Click the button
    await page.click('#testBtn');

    // Check updated state
    const updatedText = await page.$eval('#result', el => el.textContent);
    expect(updatedText).toBe('Clicked!');
  });

  test('should take a screenshot', async () => {
    await page.goto('https://www.example.com');
    
    // Take a screenshot (this will be saved if you provide a path)
    const screenshot = await page.screenshot({ type: 'png' });
    
    // Verify screenshot was taken (buffer should have content)
    expect(screenshot).toBeDefined();
    expect(screenshot.length).toBeGreaterThan(0);
  });
});
