import { Page } from "puppeteer-core";

export class ScrapperService{
    async GetSchedule(){

    }
    private async getElementText(page: Page, selector: string): Promise<string> {
        return page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent?.trim() || '' : '';
        }, selector);
    }

    async GetTimeTable(url: string, page: Page){
            await this.retryRequest(page, url, 0, 3)
            const values = ['B6', 'B7', 'C6', 'C7', '',];
            const result: { [key: string]: string } = {};
    
            for (const value of values) {
                await page.focus('#t-name-box');
                await page.keyboard.type(value);
                const text = await this.getElementText(page, '.cell-input');
    
                if (value.endsWith('6')) {
                    result[value] = text; 
                } else if (value.endsWith('7')) {
                    result[value] = text; 
                }
            }
    
            return result;
    }
    async GetGroups(){

    }
    async GetCabinetChanges(){

    }
    private readonly UserAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36"
    ];
    async retryRequest(page: Page, url: string, attempt: number, maxRetries: number): Promise<void> {
        attempt++;
        const userAgent = this.UserAgents[attempt % this.UserAgents.length];
        console.log(`Attempt ${attempt}: Setting user-agent to ${userAgent}`);
        await page.setUserAgent(userAgent);
        console.log(`Attempt ${attempt}: Navigating to ${url}`);
        const response = await page.goto(url);
        if (response && response.status() !== 200) {
            console.warn(`Attempt ${attempt}: Received non-200 status code (${response.status()}). Retrying...`);
            if (attempt < maxRetries) {
                await this.retryRequest(page, url, attempt, maxRetries);
            } else {
                throw new Error(`Failed to load the page after ${maxRetries} attempts.`);
            }
        } else {
            console.log(`Attempt ${attempt}: Page loaded successfully with status ${response?.status()}`);
        }
    };
}