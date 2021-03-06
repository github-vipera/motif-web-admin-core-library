import { UsersInfoUpdater } from './../data/updaters/UsersInfoUpdater';
import { Subscription } from 'rxjs';
import { DashboardModel } from './../data/dashboard-model';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';
import { Gridster } from 'web-console-ui-kit'
import { SecurityService, Session } from '@wa-motif-open-api/security-service'
import { interval } from 'rxjs';
import { InfoService, ServerInfo, ServerStatus, UsersInfo, OAuth2Info } from '@wa-motif-open-api/info-service'
import { ServerStatusUpdater } from '../data/updaters/ServerInfo/ServerStatusUpdater';
import { ServerInfoUpdater } from '../data/updaters/ServerInfo/ServerInfoUpdater';
import { OAuth2InfoUpdater } from '../data/updaters/OAuth2InfoUpdater';

const LOG_TAG = '[MainDashboardSectionComponent]';


@Component({
    selector: 'main-dashboard-section',
    styleUrls: [ './main-dashboard-section-component.scss' ],
    templateUrl: './main-dashboard-section-component.html'
  })
  @PluginView('Dashboard', {
    iconName: 'wa-ico-dashboard',
    index: 10,
    userData: {
        acl: {
            permissions: ['com.vipera.osgi.foundation.scheduler.api.rest.InfoApiServiceRestApi:READ:getUsersInfo',
                          'com.vipera.osgi.foundation.scheduler.api.rest.InfoApiServiceRestApi:READ:getSessionsInfo',
                          'com.vipera.osgi.foundation.scheduler.api.rest.InfoApiServiceRestApi:READ:getServerStatus',
                          'com.vipera.osgi.foundation.scheduler.api.rest.InfoApiServiceRestApi:READ:getServerInfo',
                          'com.vipera.osgi.foundation.scheduler.api.rest.InfoApiServiceRestApi:READ:getOAuth2Info',
                          'com.vipera.osgi.foundation.scheduler.api.rest.InfoApiServiceRestApi:READ:getChannelInfo']
        }
    }
})
export class MainDashboardSectionComponent implements OnInit, OnDestroy {

    model: DashboardModel;

    options: Gridster.GridsterConfig;

    private statusUpdater:ServerStatusUpdater;
    private infoUpdater:ServerInfoUpdater;
    private usersInfoUpdater: UsersInfoUpdater;
    private oauth2InfoUpdater: OAuth2InfoUpdater;

    private refreshInterval: any;
    
    constructor(private logger: NGXLogger,
        private securityService: SecurityService,
        private infoService: InfoService
        ) {
        this.logger.debug(LOG_TAG , 'Opening...');
        
        
        this.options = {
            itemChangeCallback: this.itemChange,
            itemResizeCallback: this.itemResize,
            gridType: Gridster.GridType.Fixed,
            compactType: Gridster.CompactType.None,
            draggable: {
              enabled: true
            },
            resizable: {
              enabled: true,
            },
            displayGrid: 'onDrag&Resize',
            minCols: 3,
            maxCols: 100,
            minRows: 3,
            maxRows: 100,
            maxItemCols: 100,
            minItemCols: 1,
            maxItemRows: 100,
            minItemRows: 1,
            maxItemArea: 2500,
            minItemArea: 1,
            defaultItemCols: 1,
            defaultItemRows: 1,
            fixedColWidth: 70,
            fixedRowHeight: 70
          };
    }

    motifServerInstanceNameItem:Gridster.GridsterItem = {cols: 8, rows: 2, y: 0, x: 0};
    motifServerInstanceItem:Gridster.GridsterItem = {cols: 8, rows: 3, y: 2, x: 0};
    processLoadGaugeItem:Gridster.GridsterItem = {cols: 3, rows: 3, y: 0, x: 8};
    cpuLoadGaugeItem:Gridster.GridsterItem = {cols: 3, rows: 3, y: 0, x: 11};
    memoryInfoGaugeItem:Gridster.GridsterItem = {cols: 3, rows: 3, y: 2, x: 8 };
    memoryInfoItem:Gridster.GridsterItem = {cols: 3, rows: 2, y: 2, x: 8 };
    usersInfoItem:Gridster.GridsterItem = {cols: 3, rows: 5, y: 0, x: 14 };
    oauth2InfoItem:Gridster.GridsterItem = {cols: 3, rows: 2, y: 0, x: 0 };
    diskInfoGaugeItem:Gridster.GridsterItem = {cols: 3, rows: 3, y: 2, x: 8 };
    
    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
        this.statusUpdater = new ServerStatusUpdater(this.logger, this.infoService);
        this.statusUpdater.start(4 * 1000);

        this.infoUpdater = new ServerInfoUpdater(this.logger, this.infoService);
        this.infoUpdater.start(60 * 1000);

        this.usersInfoUpdater =  new UsersInfoUpdater(this.logger, this.infoService);
        this.usersInfoUpdater.start(30 * 1000);

        this.oauth2InfoUpdater = new OAuth2InfoUpdater(this.logger, this.infoService);
        this.oauth2InfoUpdater.start(5 * 1000);
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.statusUpdater.stop();
        this.infoUpdater.stop();
        this.usersInfoUpdater.stop();
        this.oauth2InfoUpdater.stop();
      }


    private itemChange(item, itemComponent) {
        console.info('itemChanged', item, itemComponent);
    }

    private itemResize(item, itemComponent) {
        console.info('itemResized', item, itemComponent);
    }

    public get serverStatus(): any {
      return this.statusUpdater.data;
    }

    public get serverInfo(): any {
      return this.infoUpdater.data;
    }

    public get usersInfo(): UsersInfo {
      return this.usersInfoUpdater.data;
    }

    public get oauth2Info(): OAuth2Info {
      return this.oauth2InfoUpdater.data;
    } 

}
