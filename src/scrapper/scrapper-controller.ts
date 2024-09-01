import { ScrapperService } from "./scrapper-service";
export class ScrapperController {
    private scrapperService: ScrapperService;


    constructor(scrapperService: ScrapperService) {
        this.scrapperService = scrapperService;
    }

    async initializeBrowser() {
        
    }

    async closeBrowser() {
       
    }

    async loadSchedule() {
        try {
            console.log("Loading schedule...");
            const url = "https://docs.google.com/spreadsheets/d/1r8qzFN-ijQhbQ9Ctj0wGHC-JTKCZZxJ-/edit?gid=625439253#gid=625439253"
            
            await this.scrapperService.GetScheduleViaAxios(url, 10)
            console.log("Schedule loaded successfully")
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
