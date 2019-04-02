import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, forwardRef, ViewChild } from '@angular/core';
import { DomainsService, Domain } from '@wa-motif-open-api/platform-service';
import { NGXLogger} from 'web-console-core';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { WCSubscriptionHandler } from '../../Commons/wc-subscription-handler';
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { dom } from '@fortawesome/fontawesome-svg-core';

const LOG_TAG = '[DomainSelectorComboBoxComponent]';

export const WC_DOMAIN_SELECTOR_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DomainSelectorComboBoxComponent),
    multi: true
};

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wc-domain-selector-combobox',
    styles: [
    ],
    template: `
    <kendo-combobox #combo style="width:100%;" [data]="data"   [filterable]="true" (filterChange)="handleFilter($event)"
    [allowCustom]="false" 
    [valueField]="'name'"  
    [popupSettings]="{ 'popupClass' : 'wa-kui-combobox-popup', 'animate' : false  }"
    [textField]="'name'" 
    [(ngModel)]="selectedDomain"></kendo-combobox>
    `,
    providers: [WC_DOMAIN_SELECTOR_CONTROL_VALUE_ACCESSOR]
})
export class DomainSelectorComboBoxComponent implements OnInit, OnDestroy {

    public data: Array<Domain> = [];
    public domainList: Array<Domain> = [];
    public _selectedDomain: Domain; // combo box selection
    @Output() domainSelected: EventEmitter<Domain> = new EventEmitter();
    @Output() selectionCancelled: EventEmitter<any> = new EventEmitter();
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    @ViewChild('combo') combo: ComboBoxComponent;

    constructor(private logger: NGXLogger,
        private domainsService: DomainsService,
        private notificationCenter: WCNotificationCenter) {
            this.logger.debug(LOG_TAG, 'Creating...');
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
        this.refreshDomainList();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.data = null;
        this.domainList = null;
        this._selectedDomain = null;
        this.domainSelected = null;
        this.selectionCancelled = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    /**
     * Get the list of the available Domains
     */
    public refreshDomainList(): void {
        this._subHandler.add(this.domainsService.getDomains().subscribe( data => {
           this.domainList = data;
           this.data = this.domainList;
        }, error => {
            this.logger.debug(LOG_TAG, 'refreshDomainList error:', error);
            this.notificationCenter.post({
                name: 'RefreshDomainListError',
                title: 'Load Domains',
                message: 'Error loading domains:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }

    public findDomainByName(domainName: string): Domain {
        if (this.domainList){
            for (let i=0;i<this.domainList.length;i++){
                let domain = this.domainList[i];
                if (domain.name === domainName){
                    return domain;
                }
            }            
        }
        return null;
    }

    /**
     * Set the selcted domain
     */
    @Input()
    public set selectedDomain(domain: Domain) {
        this._selectedDomain = domain;
        if (this._selectedDomain){
            this.logger.debug(LOG_TAG, 'selectedDomain domain=', this._selectedDomain.name);
            this.domainSelected.emit(this._selectedDomain);
            this.propagateChange(domain);
        } else {
            this.combo.reset();
            this.logger.debug(LOG_TAG, 'selectedDomain domain=no selection');
            this.selectionCancelled.emit();
            this.propagateChange(null);
        }
    }

    @Input()
    public set selectedDomainName(domainName: string){
        this.selectedDomain = this.findDomainByName(domainName);
    }

    public get selectedDomain(): Domain {
        return this._selectedDomain;
    }

    propagateChange: any = () => {};

    writeValue(value: any) {
        if ( value ) {
         this._selectedDomain = value;
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: () => void): void { }

    handleFilter(value) {
        if (value.length >= 3) {
            this.data = this.domainList.filter((s) => s.name.toLowerCase().indexOf(value.toLowerCase()) !== -1);
        } else {
            if (value.length===0){
                this.data = this.domainList;
            }
            this.combo.toggle(false);
        }
    }
}
