import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ServiceCatalogSelectorComponent, ServiceCatalogNode } from './service-catalog-selector-component';
export { ServiceCatalogNode } from './service-catalog-selector-component';
import { DataFilter } from './data/model';
export { DataFilter, CatalogEntry } from './data/model';

export interface SelectionEvent {
    catalogEntry: ServiceCatalogNode;
    userData?: any;
}

@Component({
    selector: 'wc-service-catalog-selector-dialog',
    styles: [
      'input[type=text] { width: 100%; }'
    ],
    template: `
    <p-dialog
        [(visible)]="opened"
        [modal]="true"
        [resizable]="true"
        [responsive]="true"
        [baseZIndex]="10000"
        [closeOnEscape]="true"
        [contentStyle]="{ 'width': '800px', 'max-with': '800px', 'min-width': '800px', 'height': '500px', 'min-height':'500px','max-height': '500px', 
        'overflow': 'hidden' }" 
        >
            <p-header>{{title}}</p-header>
                <div style="height:500px;">
                    <wa-service-catalog-selector #serviceSelector [dataFilter]="dataFilter"></wa-service-catalog-selector>
                </div>
            <p-footer>
            <kendo-buttongroup look="flat">
              <button kendoButton [toggleable]="false" (click)="onCancel();">Cancel</button>
              <button kendoButton [toggleable]="false" [primary]="true" (click)="onConfirmSelection();" [disabled]="!canSelect">Select</button>
            </kendo-buttongroup>
          </p-footer>
        </p-dialog>

    `
})
export class ServiceCatalogSelectorDialogComponent {

    @ViewChild('serviceSelector') _serviceSelector: ServiceCatalogSelectorComponent;
    public opened = false;
    @Input() title = 'Select Service Catalog Item';
    @Input() message = '';
    @Input() cancelText = 'Cancel';
    @Input() confirmText = 'Select';
    @Input() dataFilter: DataFilter;
    userData:any;

    @Output() cancel: EventEmitter<any> = new EventEmitter();
    @Output() select: EventEmitter<SelectionEvent> = new EventEmitter();

    
    public onConfirmSelection(): void {
        this.opened = false;
        const selectedNode: ServiceCatalogNode = this._serviceSelector.selectedServiceCatalogEntry;
        this.select.emit({
            catalogEntry: selectedNode,
            userData: this.userData
        });
        this._serviceSelector.clear();
    }

    public onCancel(): void {
        this.opened = false;
        this.cancel.emit();
        this._serviceSelector.clear();
    }

    public open(title: string, userData?: any) {
        this.title = title;
        this.userData = userData;
        this.opened = true;
        this._serviceSelector.reloadData();
    }

    get canSelect(): boolean {
        return (this._serviceSelector.selectedNode != null);
    }


} 