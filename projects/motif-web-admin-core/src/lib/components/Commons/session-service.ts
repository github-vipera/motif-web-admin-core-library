import { AuthService } from 'web-console-core';
import { Injectable, OnInit } from '@angular/core';
import * as _ from 'lodash'
import { NGXLogger } from 'ngx-logger';
import { AdminsService, AdminUser } from '@wa-motif-open-api/platform-service';

const LOG_TAG = '[SessionService]';

export interface CurrentUserInfo {
    userName: string;
    userAbbr: string;
    lastAccess: Date;
    details?:any;
}

@Injectable()
export class SessionService  {

    private _currentUser : CurrentUserInfo;

    constructor(private logger: NGXLogger,
        private authService:AuthService,
        private adminsService: AdminsService) {
            this.logger.debug(LOG_TAG, 'ctor');
            this.init();
        }

    private init(){
        this.logger.debug(LOG_TAG, 'init invoked', this.authService.logonInfo);
        const abbr = this.buildAbbr(this.authService.currentUserName);
        this._currentUser = {
            userName: this.authService.currentUserName,
            userAbbr: abbr,
            lastAccess: this.authService.logonInfo.accessTime
        }
        this.loadCurrentUserInformations();
    }
    
    private loadCurrentUserInformations(){
        this.logger.debug(LOG_TAG, 'loadCurrentUserInformations invoked');
        this.adminsService.getAdminUser('Default', this._currentUser.userName).subscribe( (data: AdminUser) => {
            this._currentUser.details = data;
        }, (error) => {
            this.logger.error(LOG_TAG, 'loadCurrentUserInformations error:', error);
        });
    }

    public get currentUserName(): string {
        return this.authService.currentUserName;
    }

    public get currentUser(): CurrentUserInfo {
        return this._currentUser;
    }

    private buildAbbr(userName: string): string {
        try {
            return this.authService.currentUserName.substring(0,2).toUpperCase();
        } catch(err){
            this.logger.error(LOG_TAG, 'buildAbbr error: ', err);
            return 'N.A.';
        }
    }


}
