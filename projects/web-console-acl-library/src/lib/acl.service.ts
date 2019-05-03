import { NGXLogger } from 'ngx-logger';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MyselfService, Action } from '@wa-motif-open-api/auth-access-control-service'
//import { NGXLogger, EventBusService } from 'web-console-core';
import * as _ from 'lodash';

const LOG_TAG = '[MotifACLService]';

@Injectable({
    providedIn: 'root',
})
export class MotifACLService {

    private _actions: Array<Action>;
    private _permissions: Array<string> = [];

    constructor(private logger: NGXLogger, 
        private myselfService:MyselfService) { 
        /*
        this.eventBus.on('AuthService:LoginEvent').subscribe( (message) => {
            this.logger.debug("on AuthService:LoginEvent: ", message);
            this.reloadPermissions().subscribe();
        })
        */
        //this.reloadPermissions().subscribe();
    }

    /**
     * Remove all cached permissions
     */
    public flushPermissions():void{
        this._actions = [];
        this._permissions = [];
    }

    public reloadPermissions(): Observable<any> {
        this.logger.debug(LOG_TAG, 'reloadPermissions called.');
        return new Observable((observer) => {
            this.myselfService.getMyselfActions().subscribe( (actions:Array<Action>) => {
                this.logger.debug(LOG_TAG, 'reloadPermissions results: ', actions);
                this._permissions = [];
                actions.forEach(action => {
                    this._permissions.push(action.name);
                });
                observer.next();
                observer.complete();
            }, (error) => {
                this.logger.error(LOG_TAG, 'reloadPermissions error: ', error);
                observer.error(error);
            });
        });
    }

    public getPermissions(): Array<string> {
        return this._permissions;
    }

    private isAuthorized(action: string): boolean {
        return _.isEqual(_.intersection(this._permissions, [action]), [action]);
    }

    private isAuthorizedForList(actions: Array<string>): boolean {
        return _.isEqual(_.intersection(this._permissions, actions), actions);
    }

    /**
     * Does current user have permission to do something?
     * 
     * @param permission 
     */
    public can(action:string|string[]):boolean {
        if (typeof action==='string'){
            return this.isAuthorized(action);
        } else {
            return this.isAuthorizedForList(action);
        }
    }


}