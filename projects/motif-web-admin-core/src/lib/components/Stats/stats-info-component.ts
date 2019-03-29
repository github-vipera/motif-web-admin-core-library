import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[WCStatsInfoComponent]';

export interface WCStatsInfoItem {
    label: string;
    value: string;
    hidden?: boolean;
    cssClass?: string;
    color?: string;
}

export interface WCStatsInfoModel {
    items: Array<WCStatsInfoItem>;
}

@Component({
    selector: 'wc-stats-info-component',
    styleUrls: [ './stats-info-component.scss' ],
    templateUrl: './stats-info-component.html'
})
export class WCStatsInfoComponent implements OnInit {

    @Input('model')
    public model:WCStatsInfoModel = { items: [] };

    constructor(private logger: NGXLogger
        ) {}

    ngOnInit(): void {
    }


}
