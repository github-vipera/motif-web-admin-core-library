import { Component, OnInit, ViewChild, Input, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core'
import { NGXLogger } from 'web-console-core'
import { SecurityService } from '@wa-motif-open-api/security-service'
import { SessionRow } from '../data/model'
import { GridComponent, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor, GroupDescriptor, DataResult } from '@progress/kendo-data-query';
import { MotifQuerySort, MotifQueryResults } from 'web-console-core';
import { Domain, ApplicationsService, ApplicationsList, Application } from '@wa-motif-open-api/platform-service'
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import * as _ from 'lodash';
import { DomainSelectorComboBoxComponent } from '../../../components/UI/selectors/domain-selector-combobox-component'
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit'
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';


const LOG_TAG = '[SessionsSection]';

@Component({
    selector: 'wa-sessions-section',
    styleUrls: ['./sessions-section.component.scss'],
    templateUrl: './sessions-section.component.html'
})
@PluginView('Sessions', {
    iconName: 'ico-sessions'
})
export class SessionsSectionComponent implements OnInit, OnDestroy {

    @ViewChild(GridComponent) _grid: GridComponent;
    @ViewChild('applicationsCombo') _appComboBox: ComboBoxComponent;
    @ViewChild('domainSelector') domainSelector: DomainSelectorComboBoxComponent;

    // Grid Options
    public sort: SortDescriptor[] = [];
    public groups: GroupDescriptor[] = [];
    public gridView: DataResult;
    public type: 'numeric' | 'input' = 'numeric';
    public pageSize = 15;
    public skip = 0;
    public currentPage = 1;
    public totalPages = 0;
    public totalRecords = 0;
    public isFieldSortable = false;

    public applicationsList: ApplicationsList = [];
    public _selectedApplication: Application; // combo box selection
    @Input() public selectedDomain: Domain;
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    public loading = false;

    private _sessionRows: SessionRow[] = [];

    constructor(private logger: NGXLogger,
        private securityService: SecurityService,
        private notificationCenter: WCNotificationCenter,
        private applicationsService: ApplicationsService) {
        this.logger.debug(LOG_TAG, 'Opening...');
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.sort = null;
        this.groups = null;
        this.gridView = null;
        this.applicationsList = null;
        this._selectedApplication = null;
        this._sessionRows = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    private loadData(domain: Domain, application: Application, pageIndex: number, pageSize: number) {
        // tslint:disable-next-line:max-line-length
        this.logger.debug(LOG_TAG, 'loadData domain=\'' + domain + '\' application=\'' + application + '\' pageIndex=', pageIndex, ' pageSize=', pageSize);

        this.loading = true;

        const sort: MotifQuerySort = this.buildQuerySort();

        const domainName = (domain ? domain.name : null);
        const applicationName = (application ? application.name : null);

        this._subHandler.add(this.securityService.getSessions(null, null, domainName, 
            applicationName, null, null, pageIndex, pageSize, 'response').subscribe((response) => {

            const results: MotifQueryResults = MotifQueryResults.fromHttpResponse(response);

            this.logger.debug(LOG_TAG, 'Get session list query results:', results);

            this._sessionRows = _.forEach(results.data, function (element) {
                element.lastAccess = new Date(element.lastAccess);
            });

            this.totalPages = results.totalPages;
            this.totalRecords = results.totalRecords;
            this.currentPage = results.pageIndex;
            this.gridView = {
                data: this._sessionRows,
                total: results.totalRecords
            };

            this.loading = false;

        }, error => {
            this.logger.error(LOG_TAG, 'Get session list failed: ', error);
            this.loading = false;

            this.notificationCenter.post({
                name: 'LoadSessionsError',
                title: 'Load Sessions',
                message: 'Error loading Sessions:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    public pageChange({ skip, take }: PageChangeEvent): void {
        this.logger.debug(LOG_TAG, 'pageChange skip=', skip, ' take=', take);
        this.skip = skip;
        this.pageSize = take;
        const newPageIndex = this.calculatePageIndex(skip, take);
        this.loadData(this.domainSelector.selectedDomain, this._selectedApplication, newPageIndex, this.pageSize);
    }

    private calculatePageIndex(skip: number, take: number): number {
        return (skip / take) + 1;
    }

    private buildQuerySort(): MotifQuerySort {
        this.logger.debug(LOG_TAG, 'buildQuerySort: ', this.sort);
        const querySort = new MotifQuerySort();
        if (this.sort) {
            for (let i = 0; i < this.sort.length; i++) {
                const sortInfo = this.sort[i];
                if (sortInfo.dir && sortInfo.dir === 'asc') {
                    querySort.orderAscendingBy(sortInfo.field);
                } else if (sortInfo.dir && sortInfo.dir === 'desc') {
                    querySort.orderDescendingBy(sortInfo.field);
                }
            }
        }
        return querySort;
    }


    /**
    * Set the selcted application
    */
    @Input()
    public set selectedApplication(application: Application) {
        this._selectedApplication = application;
        this.loadData(this.domainSelector.selectedDomain, this._selectedApplication, 1, this.pageSize);
    }

    /**
     * Reload the list of the current sessions
     */
    public refreshData(): void {
        this.loadData(this.selectedDomain, this._selectedApplication, this.currentPage, this.pageSize);
    }


    onDeleteOKPressed(dataItem: any): void {
        this.logger.debug(LOG_TAG, 'onDeleteOKPressed dataItem=', dataItem);
        this._subHandler.add(this.securityService.closeSession(dataItem.id).subscribe((data) => {
            this.logger.debug(LOG_TAG, 'onDeleteOKPressed OK:', data);
            this.refreshData();


            this.notificationCenter.post({
                name: 'CloseSessionSuccess',
                title: 'Close Session',
                message: 'Session closed successfully.',
                type: NotificationType.Success
            });

        }, (error) => {
            this.logger.error(LOG_TAG, 'onDeleteOKPressed error:', error);

            this.notificationCenter.post({
                name: 'CloseSessionError',
                title: 'Close Session',
                message: 'Error closing session:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    public onRefreshClicked(): void {
        this.refreshData();
    }


}
