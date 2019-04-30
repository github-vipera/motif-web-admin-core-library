import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';

@Injectable({
    providedIn: 'root',
})
export class MotifACLService {

    private _permissions: Array<string> = [
        "pippo", "pluto", "paperino", "minnie"
    ];

    constructor() { 
        this.reloadPermissions();
    }

    public reloadPermissions(): Observable<any> {
        return new Observable((observer) => {
            //TODO!!
            observer.next();
            observer.complete();
        });
    }

    public getPermissions(): Array<string> {
        return this._permissions;
    }

    public isAuthorized(action: string): boolean {
        return _.isEqual(_.intersection(this._permissions, [action]), [action]);
    }

    public isAuthorizedForList(actions: Array<string>): boolean {
        return _.isEqual(_.intersection(this._permissions, actions), actions);
    }


}