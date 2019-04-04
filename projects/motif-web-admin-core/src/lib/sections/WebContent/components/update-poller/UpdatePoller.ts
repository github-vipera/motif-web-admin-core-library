import { BundlesService, BundleStatus } from '@wa-motif-open-api/web-content-service';
import { EventEmitter }  from '@angular/core';
import { interval } from "rxjs/internal/observable/interval";
import { startWith, switchMap, takeUntil, takeWhile } from "rxjs/operators";
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription, Subject } from "rxjs";

const LOG_TAG = '[UpdatePoller]';

export enum UpdatePollerEventStatus {
    Finished = "Finished",
    Error = "Error",
    Stopped = "Stopped"
}

export interface UpdatePollerEvent {
    source: UpdatePoller; 
    status: UpdatePollerEventStatus
}

export class UpdatePoller {

    private _userData:any;

    private _bundleStatus: BundleStatus;
    private _interval: Observable<any>;
    private _stopNotifier: Subject<UpdatePollerEventStatus>;
    private _onPoll:EventEmitter<UpdatePollerEvent> = new EventEmitter<UpdatePollerEvent>();
    private _pollCount = 0;
    private _pollTime = 0;
    private _currentPollCount = 0;
    
    constructor(public readonly bundleName:string, 
        public readonly bundleVersion: string, 
        private webContentService: BundlesService,
        private logger: NGXLogger){}


    public start(pollcount: number, polltime:number, userData: any){

        this._userData = userData;
        this._pollCount = pollcount;
        this._pollTime = polltime;

        this._stopNotifier = Subject.create();

        this._interval = interval(polltime)
        .pipe(
            takeWhile(it => this._currentPollCount < this._pollCount),
            startWith(0),
            switchMap(() => this.webContentService.getBundle(this.bundleName, this.bundleVersion) )
        );
        this._interval.subscribe(res => { 
            this.logger.debug(LOG_TAG , 'Poll event: ', res);
            this._bundleStatus = res; 
            this._currentPollCount++;
        } );
    } 

    public stop(){
        this.logger.debug(LOG_TAG , 'Stop called');
        this._currentPollCount = this._pollCount + 1;
    }

    public get userData():any {
        return this._userData;
    }

    public onPoll():EventEmitter<UpdatePollerEvent> {
        return this._onPoll;
    }

    private notifyEvent(status:UpdatePollerEventStatus){
        this._onPoll.emit({ source: this, status: status });
    }

    public get pollCount():number{
        return this._pollCount;
    }

    public get pollTime():number {
        return this._pollTime;
    }

    public get currentPollCount():number{
        return this._currentPollCount;
    }

}