import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';

const LOG_TAG = '[MainDashboardSectionComponent]';


@Component({
    selector: 'main-dashboard-section',
    styleUrls: [ './main-dashboard-section-component.scss' ],
    templateUrl: './main-dashboard-section-component.html'
  })
  @PluginView('Dashboard', {
    iconName: 'wa-ico-plugins'
})
export class MainDashboardSectionComponent implements OnInit, OnDestroy {

    constructor(private logger: NGXLogger) {
        this.logger.debug(LOG_TAG , 'Opening...');

    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
    }


}
