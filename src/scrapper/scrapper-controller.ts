import puppeteer from "puppeteer";
import { ScrapperService } from "./scrapper-service";
import { ClassUrl, ScheduleStructure, Subject } from "./types/types";
import { sheets } from "googleapis/build/src/apis/sheets";
export class ScrapperController {
    private scrapperService: ScrapperService;


    constructor(scrapperService: ScrapperService) {
        this.scrapperService = scrapperService;
    }

    async initializeBrowser() {
        
    }

    async closeBrowser() {
       
    }

    async loadClassUrls(){
        try{
            const url = "https://docs.google.com/spreadsheets/d/1r8qzFN-ijQhbQ9Ctj0wGHC-JTKCZZxJ-/edit?gid=625439253#gid=625439253"
            const browser = await puppeteer.launch({headless: false})
            const page = await browser.newPage()
            await this.scrapperService.GetSchedule(url, page)
            await browser.close()
        }catch(err){
            console.error(err)
        }
    }

    async loadSchedule() {
        try {
            const classUrls: ClassUrl[] | null = await this.scrapperService.GetCLassicUrls();
            if (!classUrls) {
                return;
            }
    
            for (const classUrl of classUrls) {
                console.log("Loading schedule...");
    
                const trimmedStr = classUrl.class.slice(1, -1);
                const result = parseInt(trimmedStr, 10);
    
                if (isNaN(result)) {
                    return;
                }

                console.log(result, classUrl.class)
    
                let schedule: any;
                let attempt = 0;
                let success = false;
    
                while (attempt < 3 && !success) {
                    try {
                        attempt++;
                        schedule = await this.scrapperService.GetScheduleViaAxios(classUrl.url, result, classUrl.class.slice(1));
                        console.log("Schedule loaded successfully");
                        success = true;
                    } catch (error) {
                        console.error(`Attempt ${attempt} failed: ${error}`);
                        if (attempt === 3) {
                            console.error("Max retries reached. Moving to the next classUrl.");
                        }
                    }
                }

                await this.scrapperService.deleteAllSubjects()
    
                if (success) {    
                    const res: ScheduleStructure = {
                        class: classUrl.class.slice(1),
                        schedule: schedule,
                    };
    
                    await this.scrapperService.saveSchedule(res);

                    if (!schedule){
                        continue
                    }
                    for (let i = 0; i < schedule.length; i++){
                        if (!schedule[i]){
                            continue 
                        }
                        for (let j = 0;j < schedule[i].length; j++){
                            if (!schedule[i][j]){
                                continue
                            }
                            for (let k = 0; k < schedule[i][j].length; k++){
                                await this.scrapperService.saveSubjectData(schedule[i][j][k])
                            }
                        }
                    }
                
                }
    
                // Continue with the next classUrl
            }
        } catch (error) {
            console.error(`Failed to load schedule: ${error}`);
        }
    }
    

    async loadTimetable() {
        try {
            const url = "https://docs.google.com/spreadsheets/d/1r8qzFN-ijQhbQ9Ctj0wGHC-JTKCZZxJ-/edit?gid=1891230558#gid=1891230558"
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
