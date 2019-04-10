import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';
import { Gridster } from 'web-console-ui-kit'

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

    options: Gridster.GridsterConfig;

    constructor(private logger: NGXLogger) {
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

    private itemChange(item, itemComponent) {
        console.info('itemChanged', item, itemComponent);
    }

    private itemResize(item, itemComponent) {
        console.info('itemResized', item, itemComponent);
    }


}
