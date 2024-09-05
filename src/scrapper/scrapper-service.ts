import { ClassUrl, ScheduleStructure, Subject } from "./types/types";
import Schedule, { ITimetable } from "./schedule-models/Schedule";
import mongoose from "mongoose";
import Timetable, { ISaveTimeTable } from "./timetable-models/Timetable";
import ClassUrlDb, { IClassUrl } from "./class-models/CLass";
import Subjects from "./subject-models/Subject"

import { promises as fs } from 'fs';
import axios from "axios"
import * as cheerio from 'cheerio';
import { Page } from "puppeteer";
import CLass from "./class-models/CLass";
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

    async GetScheduleViaAxios(url: string, Class: number, FullClass: string): Promise<Subject[][][]>{
        const scheduleData: Subject[][][] = []

        const times = ["08.20-09.00","09.15-09.55","10.05-10.45","10.50-11.30","11.55-12.35","13.00-13.40",
            "13.45-14.25","14.40-15.20","15.50-16.30","16.35-17.15"
        ]

        try{
            const resp = await axios.get(url)
            const $ = cheerio.load(resp.data);
            let dayOfWeekString = ""

                const days_of_week: { [key: string]: number } = {
                    "Понедельник": 1,  
                    "Вторник": 2,       
                    "Среда": 3,         
                    "Четверг": 4,       
                    "Пятница": 5,       
                    "Суббота": 6,       
                    "Воскресенье": 7    
                };
                
                let dayOfWeek: number = 0;
                const classIndextoString: string[] = []
                
                if (Class > 10) {
                    $(".s0").each((i, el) => {
                        const dayOfWeekString: string = $(el).text().trim();
                        if (dayOfWeekString && days_of_week.hasOwnProperty(dayOfWeekString)) {
                            dayOfWeek = days_of_week[dayOfWeekString];
                        }
                    });
                    $(".s1").each((i,el) => {
                        const ClassHeader = $(el).text().trim()
                        classIndextoString.push(ClassHeader)
                        if ($(el).attr("colspan") === "2"){
                            classIndextoString.push(ClassHeader)
                        }
                    })
                    console.log(dayOfWeek)
                }
                let customIndex = 0
            $('.waffle tbody tr').each((index, element) => {
               
                let softmergeText = $(element).find('.softmerge-inner').text().trim();
                const ltrTexts: string[] = [];
                if (!softmergeText) {
                    switch (Class) {
                        case 7:
                            softmergeText = $(element).find('.s17').text().trim();
                            break;
                        case 8:
                            softmergeText = $(element).find('.s18').text().trim();
                            break;
                        case 9:
                            softmergeText = $(element).find('.s17').text().trim();
                            break;
                        case 10:
                            softmergeText = $(element).find('.s19').text().trim();
                            break;
                        case 11:
                            softmergeText = $(element).find('.s3').text().trim();
                            break;
                        case 12:
                            softmergeText = $(element).find('.s3').text().trim();
                            break;
                    }
                }
                
                let prev_s14 = 0
                let prev_class = ""
                let ind = 0                
                $(element).find('td').each((i, el) => {
                    if ($(el).attr('class') === 's14'){
                        if ((prev_class === 's14' || (prev_s14 === 0 && prev_class === "")) && Class < 11){
                            const lastElementIndex = scheduleData[prev_s14].length - 1;
                            for (let i=0;i<scheduleData[prev_s14][lastElementIndex].length; i++){
                                const changed = Object.assign({}, scheduleData[prev_s14][lastElementIndex][i]);;
                                if (changed.count !== changed.internal_index){
                                    if (changed) {
                                        const [startTime, endTime] = softmergeText.split('-');
                                        changed.start_time = startTime.trim();
                                        changed.end_time = endTime ? endTime.trim() : "";
                                        changed.internal_index += 1
                                        const anotherSave = async () => {
                                            await this.saveSubjectData(changed)
                                        }
                                        anotherSave()
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
                        if ($(el).attr('dir') === 'ltr' || $(el).attr('class') === 's13' || $(el).attr('class') === 's6'){
                            const cellText = $(el).text();
                            let countClassname = $(el).attr('rowspan')
                            let count: number = 1
                            if (countClassname) {
                                count = parseInt(countClassname, 10); 
                              
                                if (isNaN(count)) {
                                  count = 1; 
                                }
                              }
                            const letters = ['A','B','C','D','E','F','G','H','I','J','K','L']
                            const currentSubject = this.getSubjectInformation(cellText, softmergeText, count, ind, Class <= 10 ? FullClass : classIndextoString[i-3], Class, Class <= 10 ? prev_s14+1 : dayOfWeek)
                            if (currentSubject.teacher.length > 20 || firstOneIsInt(currentSubject.teacher)){
                                return 
                            }

                            
                            // const save = async (subjectData: Subject) => {
                            //     await this.saveSubjectData(subjectData)
                            // }
                            // if (Class > 10){
                            //     for (let inl = 0; inl < count; inl ++){
                            //         const timeRange = times[customIndex + inl];
                            //         let start_time, end_time
                            //         try{
                            //             [start_time, end_time] = timeRange.split('-');
                            //         }catch(err){
                            //             console.log(count, customIndex)
                            //             throw err 
                            //         }
                                    
                            //         currentSubject.start_time = start_time;
                            //         currentSubject.end_time = end_time;
                            //         save(currentSubject)
                            //     }
                            // }else{
                            //     save(currentSubject)
                            // }
                            
                            if (!scheduleData[prev_s14]){
                                scheduleData[prev_s14] = []
                            }

                            const countColClassname = $(el).attr('colspan')
                            let colcount = 1
                            if (countColClassname){
                                colcount = parseInt(countColClassname, 10); 
                              
                                if (isNaN(colcount)) {
                                    colcount = 1; 
                                }
                            }

                            if (Class > 10){
                                if (!scheduleData[index]){
                                    scheduleData[index] = []
                                }
                                for (let i=0;i<colcount;i++){
                                    scheduleData[index].push([currentSubject])
                                }
                            }else{

                            if (prev_class === "ltr"){
                                scheduleData[prev_s14][scheduleData[prev_s14].length-1].push(currentSubject)
                            }else{
                                scheduleData[prev_s14].push([currentSubject])
                            }
                            customIndex++ 
                        }
                            prev_class = "ltr"                            
                        }
                    }
                    ind++
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


        }catch(err: any){
            console.error(err)
        }
        return scheduleData
    }

    async GetScheduleClassesUrlViaAxios(url: string){
        // actually axios can't get them because it's an event based thing.
    }

    // puppeteer is too unstable for production so will not use it.
    // TODO: make google sheets.
    async GetSchedule(url: string,page: Page) { 
        await this.retryRequest(page, url, 0, 3);

        const elements = await page.$$('.goog-inline-block.docs-sheet-tab.docs-material');
        console.log(elements.length)

        const urls: ClassUrl[] = []
    
        for (const element of elements) {
            await sleep(2000)
            const Class = await element.evaluate(el => el.textContent?.trim() || '');
            if (Class === "Кружки" || Class === "Электив" || Class === "schedule"){
                continue
            }
            await element.click();    
            const temp: ClassUrl = {class: Class, url: page.url()}
            urls.push(temp)
        }
        await this.SaveClassesUrls(urls)

    }
    
    private async getElementText(page: Page, selector: string): Promise<string> {
        return page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent?.trim() || '' : '';
        }, selector);
    }

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
    async retryRequest(page: Page, url: string, attempt: number, maxRetries: number): Promise<void> {
        attempt++;
        console.log(`Attempt ${attempt}: Navigating to ${url}`);
        const response = await page.goto(url, {timeout: 0});
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

    getSubjectInformation(str: string, time: string, count: number, index: number, Class: string, parallel: number, day: number):Subject{
        let subject: Subject = {
            parallel: parallel,
            class: Class,
            name: "",
            teacher: "",
            cabinet: "",
            start_time: "",
            end_time: "",
            count: count,
            internal_index: 1,
            is_choosen: false ,
            index: index,
            day_of_week: day
        }
        const [startTime, endTime] = time.split('-');
        subject.start_time = startTime.trim()
        subject.end_time = endTime ? endTime.trim() : ""
        for (const subjectName of allSubjects){
            if (str.toLowerCase().startsWith(subjectName.toLowerCase())){
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

    async SaveClassesUrls(data: ClassUrl[]){
        try{
            await ClassUrlDb.insertMany(data)
        }catch(err){
            console.error(err)
        }
    }

    async GetCLassicUrls():Promise<ClassUrl[] | null>{
        try{
            const resp = await ClassUrlDb.find({})
            return resp 
        }catch(err){
            console.error(err)
            return null 
        }
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

    transformHighSchoolSchedule(schedule: Subject[][][]): Subject[][][] {
        const result: Subject[][][] = [];

        for (let row = 0; row < schedule.length; row++) {
            if (!schedule[row]){
                continue
            }
            for (let Class = 0; Class < schedule[row].length; Class++){
                if (!result[Class]){
                    result[Class] = []
                }
                result[Class].push([schedule[row][Class][0]])
            }
        }
    
        return result;
    }

    async saveSchedule(data: ScheduleStructure){
        try{
            // await Schedule.insertMany(data)
            await Schedule.findOneAndUpdate({class: data.class},data)
        }catch(err){
            console.error(err)
        }
    }

    async saveSubjectData(data: Subject){
        try{
            await Subjects.findOneAndReplace(
                {
                    parallel: data.parallel,
                    class: data.class,
                    day_of_week: data.day_of_week,
                    start_time: data.start_time,
                    end_time: data.end_time
                },
                data ,
                { upsert: true }
            )
        }catch(err){

        }
    }

    async deleteAllSubjects(): Promise<void> {
        try {
            await Subjects.deleteMany({});
            console.log('All subjects have been deleted.');
        } catch (err) {
            console.error('Error deleting subjects:', err);
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

