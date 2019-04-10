import { Subscription } from 'rxjs';
import { DashboardModel } from './../data/dashboard-model';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';
import { Gridster } from 'web-console-ui-kit'
import { SecurityService, Session } from '@wa-motif-open-api/security-service'
import { interval } from 'rxjs';

const LOG_TAG = '[MainDashboardSectionComponent]';


@Component({
    selector: 'main-dashboard-section',
    styleUrls: [ './main-dashboard-section-component.scss' ],
    templateUrl: './main-dashboard-section-component.html'
  })
  @PluginView('Dashboard', {
    iconName: 'wa-ico-dashboard'
})
export class MainDashboardSectionComponent implements OnInit, OnDestroy {

    model: DashboardModel;

    options: Gridster.GridsterConfig;

    private refreshInterval: any;
    private intervalSubscription: Subscription;

    constructor(private logger: NGXLogger,
        private securityService: SecurityService,
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

    currentMotifInstanceVersion:Gridster.GridsterItem = {cols: 3, rows: 2, y: 0, x: 0};
    sessionCountItem:Gridster.GridsterItem = {cols: 3, rows: 2, y: 0, x: 3};

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
        this.initModel();
        this.loadData();
        this.refreshInterval = interval(4000);
        this.intervalSubscription = this.refreshInterval.subscribe((tick)=>{
            this.loadData();
        })
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.intervalSubscription.unsubscribe();
    }

    private initModel(){
        this.model = {
            security: {
                sessions: {
                    activeCount: '...'
                },
                oauth2: {
                    activeTokens: 'Loading...'
                }
            },
            serverInstance: {
                nodeRunning: "Loading...",
                version: "Loading..."
            }
        }
    }

    private itemChange(item, itemComponent) {
        console.info('itemChanged', item, itemComponent);
    }

    private itemResize(item, itemComponent) {
        console.info('itemResized', item, itemComponent);
    }

    private loadData(){
        this.securityService.getSessions().subscribe((results:Array<Session>)=>{
            this.model.security.sessions.activeCount = "" + results.length;
        }, (error)=>{
            alert(JSON.stringify(error));
        });
    }

}
