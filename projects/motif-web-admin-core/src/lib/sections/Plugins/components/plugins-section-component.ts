import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';
import { RegistryService, Plugin } from '@wa-motif-open-api/plugin-registry-service';
import { SafeStyle } from '@angular/platform-browser';
import { process, State } from '@progress/kendo-data-query';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';
import * as _ from 'lodash'



import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

import {
    GridDataResult
} from '@progress/kendo-angular-grid';

import { WCStatsInfoModel } from '../../../components/Stats/stats-info-component';
import { UninstallConfirmationDialogComponent, UninstallDialogResult } from '../dialogs/uninstall-confirmation-dialog-component';

const LOG_TAG = '[PluginsSection]';

@Component({
    selector: 'app-plugins-section',
    styleUrls: [ './plugins-section-component.scss' ],
    templateUrl: './plugins-section-component.html'
  })
  @PluginView('Plugins', {
    iconName: 'wa-ico-plugins'
})
export class PluginsSectionComponent implements OnInit, OnDestroy {

    public data: Array<Plugin>;
    public gridData: GridDataResult; // = process(sampleProducts, this.state);
    public loading: boolean;
    private filterValue: string;
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    @ViewChild('uninstallConfirmationDialog') _uninstallConfirmationDialog: UninstallConfirmationDialogComponent;

    statsModel: WCStatsInfoModel = { items: [] };

    public state: State = {
    };

    constructor(private logger: NGXLogger,
        private registryService: RegistryService) {
        this.logger.debug(LOG_TAG , 'Opening...');

    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
        this.refreshData();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.data = null;
        this.gridData = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    public onRefreshClicked(): void {
        this.logger.debug(LOG_TAG , 'Refresh clicked');
        this.refreshData();
    }

    public refreshData() {
        this.logger.debug(LOG_TAG , 'refreshData called.');
        this.loading = true;
        this._subHandler.add(this.registryService.getPlugins(true, 'REGISTERED').subscribe((data: Array<Plugin>) => {
            this.data = data;
            this.displayData();
            this.rebuildStatsInfo();
            this.loading = false;
            // console.log("refreshData: ", data);
        }, (error) => {
            // console.error("refreshData error: ", error);
            this.gridData = process([], this.state);
            this.loading = false;
        }));
    }

    private rebuildStatsInfo(){
        const active = _.sumBy(
            this.data,
            ({ status }) => Number(status === "ACTIVE")
        );
        const inactive = _.sumBy(
            this.data,
            ({ status }) => Number(status === "RESOLVED")
        );
        const inError = _.sumBy(
            this.data,
            ({ status }) => Number(status === "INSTALLED")
        );
        this.statsModel = { //cssClass:"green-stats-info"
            items: [
                { label: "active", value: active, color:"#84a4d8" },
                { label: "inactive", value: inactive, cssClass:"gray-stats-info" },
                { label: "in error", value: inError, cssClass:"red-stats-info" }
            ]
        } 
    }

    public statusColorCode(plugin: Plugin): SafeStyle {
        if (plugin.status === 'ACTIVE') {
            return '#1ab31a';
        } else {
            return 'inherit';
        }
    }

    public onFilterChange(event: Event) {
        this.filterValue = event.srcElement['value'];
        this.displayData();
    }

    private displayData(): void {
        this.logger.debug(LOG_TAG , 'displayData called.');
        let filteredData;
        if (this.filterValue) {
            filteredData = _.filter(this.data, (o) => {
                const matcher = this.buildRegExp(this.filterValue);
                return matcher.test(o.name);
            });
        } else {
            filteredData = this.data;
        }
        this.gridData = process(filteredData, this.state);
    }

    private buildRegExp(filter: string) {
        const wildcarded = '*' + filter + '*';
        return new RegExp('^' + wildcarded.split('*').join('.*') + '$');
    }

    onUninstallOKPressed(event){
        this.logger.debug(LOG_TAG , 'onUninstallOKPressed pressed for: ', event);
        let pluginName = event.name;
        let version = event.version;
        this._uninstallConfirmationDialog.show(pluginName, version);
    }

    public doUninstallPlugin(pluginName:string, deleteConfig:boolean) {
        this.logger.debug(LOG_TAG , 'doUninstallPlugin called for:', pluginName);
        this.loading = true;
        this._subHandler.add(this.registryService.uninstallPlugin(pluginName, { removeConfig: true }).subscribe((results) => {
            this.displayData();
            this.rebuildStatsInfo();
            this.loading = false;            // console.log("refreshData: ", data);
        }, (error) => {
            this.gridData = process([], this.state);
            this.loading = false;
        }));
    }

    onUninstallConfirmed(event: UninstallDialogResult){
        this.doUninstallPlugin(event.pluginName, event.deleteConfig);
    }
}
