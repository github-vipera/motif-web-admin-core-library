import { BundlesService, BundleStatus } from '@wa-motif-open-api/web-content-service';
import { EventEmitter }  from '@angular/core';
import { interval } from "rxjs/internal/observable/interval";
import { startWith, switchMap, takeUntil, takeWhile } from "rxjs/operators";
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription, Subject } from "rxjs";
import { BundleUtils, PublishingStatus } from '../BundleUtils';

const LOG_TAG = '[UpdatePoller]';

export enum UpdatePollerEventStatus {
    Complete = "Complete",
    Stopped = "Stopped",
    Error = "Error"
}

export interface UpdatePollerEvent {
    source: UpdatePoller; 
    status: UpdatePollerEventStatus,
    bundleStatus: BundleStatus
}

export class UpdatePoller {

    private _userData:any;

    private _bundleStatus: BundleStatus;
    private _interval: Observable<any>;
    private _pollCount = 0;
    private _pollTime = 0;
    private _currentPollCount = 0;
    
    constructor(public readonly bundleName:string, 
        public readonly bundleVersion: string, 
        private webContentService: BundlesService,
        private logger: NGXLogger){}


    public start(pollcount: number, polltime:number, userData: any) : Observable<UpdatePollerEvent> {

        this._userData = userData;
        this._pollCount = pollcount;
        this._pollTime = polltime;

        return new Observable((observer)=>{
            this._interval = interval(polltime)
            .pipe(
                takeWhile(it => this._currentPollCount < this._pollCount),
                startWith(0),
                switchMap(() => this.webContentService.getBundle(this.bundleName, this.bundleVersion) )
            );
            this._interval.subscribe( (res:BundleStatus) => { 
                this.logger.debug(LOG_TAG , 'Poll event: ', res);
                this._bundleStatus = res; 
                let pubStatus:PublishingStatus = BundleUtils.buildSyntheticStatus(res);
                if ((pubStatus === PublishingStatus.Published) || (pubStatus === PublishingStatus.Error)){
                    this.stop();
                    observer.next({ source: this, status: UpdatePollerEventStatus.Complete, bundleStatus: this._bundleStatus });
                    observer.complete();
                    return;
                } else {
                    this._currentPollCount++;
                }
                if (this._currentPollCount >= this._pollCount){
                    observer.next({ source: this, status: UpdatePollerEventStatus.Stopped, bundleStatus: this._bundleStatus });
                    observer.complete();
                }
            } );
        });

    } 

    public stop(){
        this.logger.debug(LOG_TAG , 'Stop called');
        this._currentPollCount = this._pollCount + 1;
    }

    public get userData():any {
        return this._userData;
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