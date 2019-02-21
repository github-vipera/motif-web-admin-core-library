import { LogLevel } from '@wa-motif-open-api/log-service';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, forwardRef, ViewChild } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { WCSubscriptionHandler } from '../../Commons/wc-subscription-handler';
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { SettingsService, Service } from '@wa-motif-open-api/configuration-service';

const LOG_TAG = '[ServicesSelectorComboBoxComponent]';

export const WC_SERVICES_SELECTOR_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ServicesSelectorComboBoxComponent),
    multi: true
};

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wc-services-selector-combobox',
    styles: [
    ],
    template: `
    <kendo-combobox #combo style="width:100%;" [data]="data"   [filterable]="true" (filterChange)="handleFilter($event)" [popupSettings]="{ 'popupClass' : 'wa-kui-combobox-popup', 'animate' : false  }"
    [allowCustom]="false" [valueField]="'name'" 
    [textField]="'name'" [(ngModel)]="selectedService"></kendo-combobox>
    `,
    providers: [WC_SERVICES_SELECTOR_CONTROL_VALUE_ACCESSOR]
})
export class ServicesSelectorComboBoxComponent implements OnInit, OnDestroy {

    public data: Array<Service> = [];
    public servicesList: Array<Service> = [];
    public _selectedService: Service; // combo box selection
    @Output() serviceSelected: EventEmitter<Service> = new EventEmitter();
    @Output() selectionCancelled: EventEmitter<any> = new EventEmitter();
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    @ViewChild('combo') combo: ComboBoxComponent;

    constructor(private logger: NGXLogger,
        private settingsService: SettingsService,
        private notificationCenter: WCNotificationCenter) {
            this.logger.debug(LOG_TAG, 'Creating...');
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
        this.refreshServiceList();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.data = null;
        this.servicesList = null;
        this._selectedService = null;
        this.serviceSelected = null;
        this.selectionCancelled = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    /**
     * Get the list of the available Domains
     */
    public refreshServiceList(): void {
        this._subHandler.add(this.settingsService.getServices().subscribe( (data: Array<Service>) => {
           this.servicesList = data;
           this.data = this.servicesList;
        }, error => {
            this.logger.debug(LOG_TAG, 'refreshServiceList error:', error);
            this.notificationCenter.post({
                name: 'RefreshServiceListError',
                title: 'Load Services',
                message: 'Error loading services:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }

    /**
     * Set the selcted domain
     */
    @Input()
    public set selectedService(service: Service) {
        this._selectedService = service;
        if (this._selectedService){
            this.logger.debug(LOG_TAG, 'selectedService service=', this._selectedService.name);
            this.serviceSelected.emit(this._selectedService);
            this.propagateChange(service);
        } else {
            this.logger.debug(LOG_TAG, 'selectedService service=no selection');
            this.selectionCancelled.emit();
            this.propagateChange(null);
        }
    }

    public get selectedService(): Service {
        return this._selectedService;
    }

    propagateChange: any = () => {};

    writeValue(value: any) {
        if ( value ) {
         this._selectedService = value;
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: () => void): void { }

    handleFilter(value) {
        if (value.length >= 3) {
            this.data = this.servicesList.filter((s) => s.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
        } else {
            if (value.length===0){
                this.data = this.servicesList;
            }
            this.combo.toggle(false);
        }
    }
}
