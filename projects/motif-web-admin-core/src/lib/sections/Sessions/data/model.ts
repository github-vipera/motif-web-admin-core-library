export class SessionRow {
    public clientIp: string;
    public user: string;
    public secure:boolean = false;
    public shared:boolean = false;
    public domain: string;
    public application: string;
    public service: string;
    public channel: string;
    public lastAccess: Date;
    public lastRequestID: string;
    public expiry: string;
}
