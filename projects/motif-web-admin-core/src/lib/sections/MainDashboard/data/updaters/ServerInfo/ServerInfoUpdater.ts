import { EventEmitter } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { InfoService, ServerInfo } from '@wa-motif-open-api/info-service'
import { Subscription, interval } from 'rxjs';

const LOG_TAG = '[ServerInfoUpdater]';

export class ServerInfoUpdater {

    private _interval:number;
    private _intervalTimer:any;
    private _intervalSubscription:Subscription;
    private _data:ServerInfo;
    private _dataReady:EventEmitter<ServerInfo>;
    private _dataError:EventEmitter<any>;

    constructor(private logger: NGXLogger,
        private infoService: InfoService){
            this._dataReady = new EventEmitter();
            this._dataError = new EventEmitter();
    }

    start(intervalTime){
        this.logger.debug(LOG_TAG , 'start called with interval: ', intervalTime);
        try {
            this._interval = intervalTime;
            this._intervalTimer = interval(intervalTime);
            this._intervalSubscription = this._intervalTimer.subscribe(val => { 
                this.reloadData();
            });
        } catch (error){
            this.logger.error(LOG_TAG , 'start error: ', error);
        }
        this.reloadData();
    }

    stop(){
        if (this._intervalSubscription){
            this._intervalSubscription.unsubscribe();
            this._intervalSubscription = null;
            this._intervalTimer = null;
        }
    }

    public get interval():number {
        return this._interval;
    } 

    public get isRunning(): boolean {
        return (this._intervalSubscription!=null);
    }

    public reloadData(){
        this.logger.debug(LOG_TAG , 'reloadData called');
        this.infoService.getServerInfo().subscribe((results:ServerInfo)=>{
            this.logger.debug(LOG_TAG , 'getServerInfo results: ', results);
            this._data = results;
            this._dataReady.emit(this._data);
        }, (error)=>{
            this.logger.error(LOG_TAG , 'getServerInfo error: ', error);
            this._dataError.emit(error);
        });
    }

    public get data():ServerInfo {
        return this._data;
    }


}