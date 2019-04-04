import { PKGINFO } from './../pkginfo';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'web-console-core';

@Injectable()
export class WebAdminCoreInfoService  {

    private env:any;

    constructor(private logger: NGXLogger){
    }

    public currentLibraryVersion():String {
        return PKGINFO.version;
    }

    public buildTimestamp():Number {
        return PKGINFO.timestamp;
    }

}
