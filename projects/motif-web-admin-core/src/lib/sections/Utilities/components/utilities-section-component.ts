import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { PluginView } from 'web-console-core';

const LOG_TAG = '[UtilitiesSection]';

@Component({
    selector: 'wa-utilities-section',
    styleUrls: ['./utilities-section.component.scss'],
    templateUrl: './utilities-section.component.html'
})
@PluginView('Utilities', {
    iconName: 'wa-ico-toolbox-big'
})
export class UtilitiesSectionComponent implements OnInit {

    constructor(private logger: NGXLogger) {}

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

}
