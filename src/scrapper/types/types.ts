export interface Subject{
    name: string;
    teacher: string;
    cabinet: string;
    start_time: string;
    end_time: string;
    count: number;
    index: number
    is_choosen: boolean;
}

export interface ScheduleStructure{
    schedule: Subject[][][], 
    class: string 
}

export interface ClassUrl{
    class: string;
    url: string;
}