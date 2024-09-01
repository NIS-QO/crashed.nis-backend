import { Subject } from "./types/types";
import Schedule, { ITimetable } from "./schedule-models/Schedule";
import mongoose from "mongoose";
import Timetable, { ISaveTimeTable } from "./timetable-models/Timetable";
import { promises as fs } from 'fs';
import axios from "axios"
import * as cheerio from 'cheerio';
const COOKIES_PATH = 'cookies.json';

export class ScrapperService{

    // sync saveAsSheets(url: string, page: Page){
    //     try {
    //         const cookiesString = await fs.readFile(COOKIES_PATH);
    //         const cookies = JSON.parse(cookiesString.toString());
    //         await page.setCookie(...cookies);
    //         console.log('Session has been loaded');
    //       } catch (error) {
    //         console.log('No cookies found, starting new session');
    //       }
    //     a
    //       await page.goto('https://accounts.google.com');
        
    //       await page.waitForNavigation();
        
    //       // Save cookies after login
    //       try {
    //         const cookies = await page.cookies();
    //         await fs.writeFile(COOKIES_PATH, JSON.stringify(cookies));
    //         console.log('Session has been saved');
    //       } catch (error) {
    //         console.error('Failed to save cookies:', error);
    //       }
        
    //       // You can now interact with your logged-in Google account
    //       await page.goto(url);
    // }

    async GetScheduleViaAxios(url: string, Class: number){
        try{
            const resp = await axios.get(url)
            const $ = cheerio.load(resp.data);
            const scheduleData: Subject[][][] = []
            $('.waffle tbody tr').each((index, element) => {
                let softmergeText = $(element).find('.softmerge-inner').text().trim();
                const ltrTexts: string[] = [];
                if (!softmergeText){
                    switch (Class){
                        case 7:
                            softmergeText = $(element).find('.s17').text().trim();
                        case 8:
                            softmergeText = $(element).find('.s18').text().trim();
                        case 9:
                            softmergeText = $(element).find('.s17').text().trim();
                        case 10:
                            softmergeText = $(element).find('.s19').text().trim();
                        case 11:
                            softmergeText = $(element).find('.s3').text().trim();
                        case 12:
                            softmergeText = $(element).find('.s3').text().trim();
                    }
                }
                if (Class > 10){
                    return 
                }
                if (!softmergeText){
                    softmergeText = $(element).find('.s17').text().trim();
                }
                if (!softmergeText){
                    softmergeText = $(element).find('.s19').text().trim();
                }

                const tdArray = [];
                let prev_s14 = 0
                let prev_class = ""
                
                $(element).find('td').each((i, el) => {
                    if ($(el).attr('class') === 's14'){
                        if (prev_class === 's14' || (prev_s14 === 0 && prev_class === "")){
                            const lastElementIndex = scheduleData[prev_s14].length - 1;
                            for (let i=0;i<scheduleData[prev_s14][lastElementIndex].length; i++){
                                const changed = Object.assign({}, scheduleData[prev_s14][lastElementIndex][i]);;
                                if (changed.count !== changed.index){
                                    if (changed) {
                                        const [startTime, endTime] = softmergeText.split('-');
                                        changed.start_time = startTime.trim();
                                        changed.end_time = endTime ? endTime.trim() : "";
                                        changed.index += 1
                                        scheduleData[prev_s14].push([changed]);                                   
                                    } else {
                                        console.log(changed)
                                        console.error(`Error: The element at scheduleData[${prev_s14}][${lastElementIndex}] is undefined.`);
                                    }
                                }
                            }
                            
                        }
                        prev_class = 's14'
                        
                        prev_s14 ++
                    }else{
                        if ($(el).attr('dir') === 'ltr'){
                            const cellText = $(el).text();
                            const countClassname = $(el).attr('rowspan')
                            let count: number = 1
                            if (countClassname) {
                                count = parseInt(countClassname, 10); 
                              
                                if (isNaN(count)) {
                                  count = 1; 
                                }
                              }
                            const currentSubject = this.getSubjectInformation(cellText, softmergeText, count)
                            if (currentSubject.teacher.length > 20 || firstOneIsInt(currentSubject.teacher)){
                                return 
                            }
                            if (!scheduleData[prev_s14]){
                                scheduleData[prev_s14] = []
                            }

                            if (Class > 10){
                                scheduleData[prev_s14].push([currentSubject])
                            }else{

                            if (prev_class === "ltr"){
                                scheduleData[prev_s14][scheduleData[prev_s14].length-1].push(currentSubject)
                            }else{
                                scheduleData[prev_s14].push([currentSubject])
                            }
                        }
                            prev_class = "ltr"                            
                        }
                    }
                    tdArray.push($(el).text().trim());
                });
    
                // $(element).find('[dir="ltr"]').each((i, el) => {
                //     const cellText = $(el).text();
                //     ltrTexts.push(cellText);
                //     const currentSubject = this.getSubjectInformation(cellText, softmergeText)
                //     if (currentSubject.teacher.length > 20 || firstOneIsInt(currentSubject.teacher)){
                //         return 
                //     }
                //     if (!scheduleData[i]){
                //         scheduleData[i] = []
                //     }
                //     scheduleData[i].push(currentSubject)
                // });

            });
            console.log(JSON.stringify(scheduleData, null, 2));


        }catch(err: any){
            console.error(err)
        }
    }

    // // TODO: make google sheets.
    // async GetSchedule(url: string,page: Page) { 
    //     await this.retryRequest(page, url, 0, 3);

    //     this.timetable = await this.getTimetable() || {}

    //     const elements = await page.$$('.goog-inline-block.docs-sheet-tab.docs-material');
    //     console.log(elements.length)
    
    //     for (const element of elements) {
    //         await sleep(2000)
    //         const Class = await element.evaluate(el => el.textContent?.trim() || '');
    //         const schedule = []
    //         let diapozons = []
    //         const min_index = 2
    //         const max_index = 12
    //         if (Class.toLowerCase().includes("s")){
    //             continue
    //         }
    //         if (Class.startsWith("7")){
    //             diapozons = [["C"],["E"],["G"],["I"],["K"]]
    //         }
    //         else{
    //             if (Class.startsWith("11") || Class.startsWith("12")){
    //                 break 
    //             }
    //             else{
    //                 diapozons = [["C","D"],["F","G"],["I","J"],["L","M"],["O","P"]]
    //             }
    //         }
    //         await element.click();
            
    //         for (const diapozon of diapozons){
    //             await sleep(1000)
    //             const day = []
    //             const first = diapozon[0]
    //             let second 
    //             if (diapozon.length > 1){
    //                 second = diapozon[1]
    //             }

    //             for (let i = min_index; i <=max_index; i++){
    //                 await sleep(2000)
    //                 await page.waitForSelector('#t-name-box');
    //                 await page.evaluate(() => {
    //                     const input = document.querySelector('#t-name-box') as HTMLInputElement;
    //                     if (input) {
    //                         input.value = '';
    //                     }
    //                 });

    //                 await page.focus('#t-name-box');
    //                 await page.keyboard.type(first + i.toString());
    //                 await page.keyboard.press('Enter');

    //                 await sleep(500);
                    
    //                 await page.waitForSelector('.cell-input');
    //                 const textFirst = await this.getElementText(page, '.cell-input');
    //                 const firstGropsSubject = this.getSubjectInformation(textFirst, i-min_index)
                    
                    
    //                 if (second){
    //                     await page.waitForSelector('#t-name-box');
    //                     await page.evaluate(() => {
    //                         const input = document.querySelector('#t-name-box') as HTMLInputElement;
    //                         if (input) {
    //                             input.value = '';
    //                         }
    //                     });

    //                     await page.focus('#t-name-box');
    //                     await page.keyboard.type(first + i.toString());
    //                     await page.keyboard.press('Enter');

    //                     await sleep(500);
                        
    //                     await page.waitForSelector('.cell-input');
    //                     const textSecond = await this.getElementText(page, '.cell-input');
    //                     const secondGropsSubject = this.getSubjectInformation(textSecond, i-min_index)

    //                     if (areObjectsEqual(firstGropsSubject, secondGropsSubject)) {
    //                         day.push([firstGropsSubject]);
    //                     } else {
    //                         day.push([firstGropsSubject, secondGropsSubject]);
    //                     }
    //                 }else{
    //                     day.push([firstGropsSubject])
    //                 }
    //             }
    //             console.log(day)
    //             schedule.push(day)
    //         }
    //         console.log(schedule)
    //         break 
    //     }
    // }
    
    // private async getElementText(page: Page, selector: string): Promise<string> {
    //     return page.evaluate((selector) => {
    //         const element = document.querySelector(selector);
    //         return element ? element.textContent?.trim() || '' : '';
    //     }, selector);
    // }

    private timetable: { [key: number]: string } = {}

//     async GetTimeTable(url: string, page: Page, tryCount: number, maximumTries: number) {
//         if (tryCount >= maximumTries){
//             return 
//         }
//         await this.retryRequest(page, url, 0, 3);
    
//         const values = ['B', 'C', 'D', 'E','F','G','H','I','J','K','L','M','N','O','P','Q','R'];

//         const getElementText = async (page: any, selector: string): Promise<string> => {
//             return page.evaluate((selector: string) => {
//                 const element = document.querySelector(selector);
//                 return element ? element.textContent || '' : '';
//             }, selector);
//         };

//         const result: { [key: number]: string } = {};
        
//         let k = 1
//         for (let i = 0; i < values.length; i++) {
//             const currentLetter = values[i];
            
//             await page.waitForSelector('#t-name-box');
//             await page.evaluate(() => {
//                 const input = document.querySelector('#t-name-box') as HTMLInputElement;
//                 if (input) {
//                     input.value = '';
//                 }
//             });

//             await page.focus('#t-name-box');
//             await page.keyboard.type(currentLetter + "6");
//             await page.keyboard.press('Enter');

//             await sleep(500);
            
//             await page.waitForSelector('.cell-input');
//             const textCurrent = await getElementText(page, '.cell-input');
//             if (!firstOneIsInt(textCurrent)){
//                 console.log(textCurrent[0])
//                 continue
//             }
            
//             await page.evaluate(() => {
//                 (document.querySelector('#t-name-box') as HTMLInputElement).value = '';
//             });

//             await page.focus('#t-name-box');
//             await page.keyboard.type(currentLetter + "7");
//             await page.keyboard.press('Enter');

//             await sleep(500);
            
//             await page.waitForSelector('.cell-input');
//             const textNext = await getElementText(page, '.cell-input');
            
//             result[k] = textNext;
//             k++
//         }
    
//         console.log(result);
//         if (Object.keys(result).length !== 11){
//             await page.reload()
//             await this.GetTimeTable(url, page, tryCount+1, maximumTries)
//         }else{
//             this.timetable = result 
//         }
//         await this.SaveTimetable(result)
//         // await this.GetSchedule(page)
// }
    
//     async GetGroups(){

//     }
//     async GetCabinetChanges(){

//     }
//     async retryRequest(page: Page, url: string, attempt: number, maxRetries: number): Promise<void> {
//         attempt++;
//         console.log(`Attempt ${attempt}: Navigating to ${url}`);
//         const response = await page.goto(url, {timeout: 0});
//         if (response && response.status() !== 200) {
//             console.warn(`Attempt ${attempt}: Received non-200 status code (${response.status()}). Retrying...`);
//             if (attempt < maxRetries) {
//                 await this.retryRequest(page, url, attempt, maxRetries);
//             } else {
//                 throw new Error(`Failed to load the page after ${maxRetries} attempts.`);
//             }
//         } else {
//             console.log(`Attempt ${attempt}: Page loaded successfully with status ${response?.status()}`);
//         }
//     };

    getSubjectInformation(str: string, time: string, count: number):Subject{
        let subject: Subject = {
            name: "",
            teacher: "",
            cabinet: "",
            start_time: "",
            end_time: "",
            count: count,
            index: 1,
            is_choosen: false 
        }
        const [startTime, endTime] = time.split('-');
        subject.start_time = startTime.trim()
        subject.end_time = endTime ? endTime.trim() : ""
        for (const subjectName of allSubjects){
            if (str.startsWith(subjectName)){
                if (subjectName[subjectName.length-1] === "№"){
                    subject.name = subjectName + str[subjectName.length]
                    subject.is_choosen = true
                }else{
                    subject.name = subjectName
                }
                break 
            }
        }
        if (lastThreeAreInts(str)){
            subject.cabinet = str.slice(-3)
        }else{
            if (str.endsWith("Оранжерея")){
                subject.cabinet = "Оранжерея"
            }
        }
        const startIdx = subject.name.length;
        const endIdx = subject.cabinet.length ? -subject.cabinet.length : undefined;

        subject.teacher = str.slice(startIdx, endIdx);
        return subject
    }

    async SaveTimetable(result: { [key: number]: string }){
        try {  
            await Timetable.findOneAndUpdate(
                {}, 
                { timetable: result }, 
                { upsert: true, new: true } 
            );
    
            console.log("Timetable saved or updated successfully!");
        } catch (error) {
            console.error("Error saving or updating timetable:", error);
        }
    }
    async getTimetable(): Promise<{ [key: number]: string } | null> {
        try {
            const timetableDoc: ISaveTimeTable | null = await Timetable.findOne().exec();
    
            if (timetableDoc) {
                return timetableDoc.timetable;
            } else {
                console.log("No timetable found.");
                return null;
            }
        } catch (error) {
            console.error("Error retrieving timetable:", error);
            return null;
        }
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function lastThreeAreInts(str: string) {
    const lastThree = str.slice(-3);
    
    return /^\d{3}$/.test(lastThree);
}

function firstOneIsInt(str: string): boolean {
    const firstOne = str[0];
    return /^\d$/.test(firstOne); 
}


const allSubjects = [
    "Physics №",
    "Computer science №",
    "Maths №",
    "Graphics and design №",
    "Biology №",
    "Chemistry №",
    "Geography №",
    "Physics",
    "Chemistry",
    "Physical education",
    "Kazakh history",
    "Biology",
    "Kazakh",
    "World history",
    "English",
    "Maths",
    "Музыка",
    "Curatorial hour",
    "Geography",
    "Russian language",
    "Art",
    "Computer science",
    "Human rights",
    "GPPW",
    "Programming",
    "CWP"
]

function areObjectsEqual(obj1: Subject, obj2: Subject): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

