import { Component, OnInit, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';

import {
    GridDataResult
} from '@progress/kendo-angular-grid';
import * as _ from 'lodash';

const LOG_TAG = '[FooCSection]';

@Component({
    selector: 'foo-c-section-component',
    styleUrls: [ './foo-c-section-component.scss' ],
    templateUrl: './foo-c-section-component.html'
  })
  @PluginView('FooC', {
    iconName: 'ico-plugins'
})
export class FooCSectionComponent implements OnInit, OnDestroy {

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
    }

}
