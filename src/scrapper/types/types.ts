export interface Subject{
    class: string;
    name: string;
    teacher: string;
    cabinet: string;
    start_time: string;
    end_time: string;
    count: number;
    index: number
    is_choosen: boolean;
    internal_index: number,
    parallel: number,
    day_of_week: number,
}

export interface ScheduleStructure{
    schedule: Subject[][][], 
    class: string 
}

export interface ClassUrl{
    class: string;
    url: string;
}