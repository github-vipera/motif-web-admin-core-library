import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, forwardRef, ViewChild } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { ApplicationsService, ApplicationsList, Application } from '@wa-motif-open-api/platform-service';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { WCSubscriptionHandler } from '../../Commons/wc-subscription-handler';

const LOG_TAG = '[ApplicationSelectorComboBoxComponent]';

export const WC_APPLICATION_SELECTOR_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ApplicationSelectorComboBoxComponent),
    multi: true
};

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wc-application-selector-combobox',
    styles: [
    ],
    template: `
    <kendo-combobox #combo style="width:100%;" [data]="data"   [filterable]="true" (filterChange)="handleFilter($event)"
    [allowCustom]="false" [valueField]="'name'" [textField]="'name'" [popupSettings]="{ 'popupClass' : 'wa-combobox-popup' }"
    [(ngModel)]="selectedApplication"></kendo-combobox>
    `,
    providers: [WC_APPLICATION_SELECTOR_CONTROL_VALUE_ACCESSOR]
})
export class ApplicationSelectorComboBoxComponent implements OnInit, OnDestroy {

    public data: ApplicationsList = [];
    public applicationsList: ApplicationsList = [];
    public _selectedApplication: Application;
    private _domain: string = null;
    @Output() applicationSelected: EventEmitter<Application> = new EventEmitter();
    @Output() selectionCancelled: EventEmitter<any> = new EventEmitter();
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    @ViewChild('combo') combo: ComboBoxComponent;

    constructor(private logger: NGXLogger,
        private applicationService: ApplicationsService,
        private notificationCenter: WCNotificationCenter) {
            this.logger.debug(LOG_TAG, 'Creating...');
    }

        /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
        this.refreshApplicationList();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.data = null;
        this.applicationsList = null;
        this._selectedApplication = null;
        this._domain = null;
        this.applicationSelected = null;
        this.selectionCancelled = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    /**
     * Get the list of the available Domains
     */
    public refreshApplicationList(): void {
        this.logger.debug(LOG_TAG, 'refreshApplicationList domain=', this._domain);
        if (this._domain) {
            this._subHandler.add(this.applicationService.getApplications(this._domain).subscribe(data => {
                this.applicationsList = data;
                this.data = this.applicationsList;
                }, error => {
                    this.logger.debug(LOG_TAG , 'refreshApplicationList error:', error);
                    this.notificationCenter.post({
                        name: 'RefreshApplicationsListError',
                        title: 'Load Applications',
                        message: 'Error loading applications:',
                        type: NotificationType.Error,
                        error: error,
                        closable: true
                    });
                }));
        } else {
            this.applicationsList = [];
        }
        this._selectedApplication = null;
        this.propagateChange(null);
    }

    @Input() set domain(domain: string) {
        this._domain = domain;
        this.refreshApplicationList();
    }

    get domain(): string {
        return this._domain;
    }

    public reset(): void {
        if (this.combo){
            this.combo.reset();
        }
    }

    /**
     * Set the selcted application
     */
    @Input('application')
    public set selectedApplication(application: Application) {
        this._selectedApplication = application;
        if (this._selectedApplication) {
            this.logger.debug(LOG_TAG, 'selectedApplication application=', this._selectedApplication);
            this.applicationSelected.emit(this._selectedApplication);
            this.propagateChange(application);
        } else {
            this.combo.reset();
            this.logger.debug(LOG_TAG, 'selectedDomain domain=no selection');
            this.selectionCancelled.emit();
            this.propagateChange(null);
        }
    }

    public get selectedApplication(): Application {
        return this._selectedApplication;
    }

    propagateChange: any = () => {};

    writeValue(value: any) {
        if ( value ) {
         this._selectedApplication = value;
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: () => void): void { }

    handleFilter(value) {
        if (value.length >= 3) {
            this.data = this.applicationsList.filter((s) => s.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
        } else {
            if (value.length===0){
                this.data = this.applicationsList;
            }
            this.combo.toggle(false);
        }
    }

}
