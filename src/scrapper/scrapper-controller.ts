import puppeteer, { Browser, Page } from "puppeteer-core";
import { ScrapperService } from "./scrapper-service";

export class ScrapperController {
    private scrapperService: ScrapperService;
    private browser: Browser | null = null;
    private page: Page | null = null;

    constructor(scrapperService: ScrapperService) {
        this.scrapperService = scrapperService;
    }

    async initializeBrowser() {
        this.browser = await puppeteer.launch({
            headless: false, 
        });
        if (this.browser) {
            this.page = await this.browser.newPage();
        }else{
            console.error("no browser")
        }
    }

    async closeBrowser() {
        if (this.page) {
            await this.page.close();
        }
        if (this.browser) {
            await this.browser.close();
        }
    }

    async loadSchedule() {
        try {
            console.log("Loading schedule...");
        } catch (error) {
            console.error(`Failed to load schedule: ${error}`);
        }
    }

    async loadTimetable() {
        if (!this.page) {
            throw new Error("Page is not initialized");
        }
        try {
            const url = "https://docs.google.com/spreadsheets/d/1r8qzFN-ijQhbQ9Ctj0wGHC-JTKCZZxJ-/edit?gid=1891230558#gid=1891230558"
            await this.scrapperService.GetTimeTable(url, this.page);
            console.log("Timetable loaded successfully.");
        } catch (error) {
            console.error(`Failed to load timetable: ${error}`);
        }
    }

    async loadGroups() {
        try {
            console.log("Loading groups...");
        } catch (error) {
            console.error(`Failed to load groups: ${error}`);
        }
    }

    async loadCabinetChanges() {
        try {
            console.log("Loading cabinet changes...");
        } catch (error) {
            console.error(`Failed to load cabinet changes: ${error}`);
        }
    }
}
