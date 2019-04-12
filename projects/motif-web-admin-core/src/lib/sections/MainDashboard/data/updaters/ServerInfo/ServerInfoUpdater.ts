import { EventEmitter } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { InfoService, ServerInfo } from '@wa-motif-open-api/info-service'
import { Subscription, interval } from 'rxjs';

const LOG_TAG = '[ServerInfoUpdater]';

export class ServerInfoUpdater {

    private _interval:number;
    private _intervalTimer:any;
    private _intervalSubscription:Subscription;
    private _data:Array<ServerInfo>;
    private _dataReady:EventEmitter<Array<ServerInfo>>;
    private _dataError:EventEmitter<any>;

    constructor(private logger: NGXLogger,
        private infoService: InfoService){
            this._dataReady = new EventEmitter();
            this._dataError = new EventEmitter();
    }

    start(interval){
        this._interval = interval;
        this._intervalTimer = interval(interval);
        this._intervalSubscription = this._intervalTimer.subscribe(val => { 
            this.reloadData();
        });
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
        this.infoService.getServerInfo().subscribe((results:Array<ServerInfo>)=>{
            this.logger.debug(LOG_TAG , 'getServerInfo results: ', results);
            this._data = results;
            this._dataReady.emit(this._data);
        }, (error)=>{
            this.logger.error(LOG_TAG , 'getServerInfo error: ', error);
            this._dataError.emit(error);
        });
    }

    public get data():Array<ServerInfo> {
        return this._data;
    }


}