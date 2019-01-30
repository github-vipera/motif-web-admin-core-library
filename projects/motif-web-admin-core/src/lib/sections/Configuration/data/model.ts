export class ConfigurationRow {
    public name: string;
    public type: string = 'java.lang.String';
    public dynamic:boolean = false;
    public crypted:boolean = false;
    public value: any;
    public dirty: boolean = false;
    public isNew: boolean = false;
}

export interface MotifService {
    name:string;
}

export interface MotifServicesList extends Array<MotifService> {
}

