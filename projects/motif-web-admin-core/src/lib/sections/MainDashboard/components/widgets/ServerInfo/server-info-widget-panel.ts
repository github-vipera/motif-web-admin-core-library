import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { InfoService, ServerInfo } from '@wa-motif-open-api/info-service'
import { ServerInfoUpdater } from '../../../data/updaters/ServerInfo/ServerInfoUpdater';

const LOG_TAG = '[ServerInfoWidgetPanelComponent]';

@Component({
    selector: 'wa-server-info-widget-panel',
    styleUrls: [ './server-info-widget-panel.scss' ],
    templateUrl: './server-info-widget-panel.html'
})
export class ServerInfoWidgetPanelComponent implements OnInit, OnDestroy {

    private _dataUpdater: ServerInfoUpdater;

    private loadingModel:ServerInfo = {
        instanceName: "Loading...",
        ip: "",
        jdkInfo: "",
        motifVersion: "",
        os: "",
        startTime: null
    }

    constructor(private logger: NGXLogger,
        private infoService: InfoService
        ) {
        this.logger.debug(LOG_TAG , 'Opening...');
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
        this._dataUpdater = new ServerInfoUpdater(this.logger, this.infoService);
        this._dataUpdater.start(60 * 1000);
    }

    ngOnDestroy() {
        if (this._dataUpdater){
            this._dataUpdater.stop();   
        }
    }

    public get model():ServerInfo {
        if (!this._dataUpdater || (this._dataUpdater.data==null)){
            return this.loadingModel;
        } else {
            return this._dataUpdater.data;
        }
    }


}
