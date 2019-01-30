import { CountersAndThresholdUtils } from '../../../commons/CountersAndThresholdUtils';
import { Component, OnInit, EventEmitter, Output, ViewChild } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { ServiceCatalogSelectorDialogComponent, SelectionEvent } from 'src/app/components/UI/selectors/service-catalog-selector/service-catalog-selector-dialog';

const LOG_TAG = '[NewCounterInfoDialogComponent]';

export enum EditType {
    New,
    Update
}

export interface CounterInfoDialogResult {
    name: string;
    description: string;
    enabled: boolean;
    pattern: string;
    fn: string;
    fnParams: string;
    editType: EditType;
    channel?: string;
    domain?: string;
    application?: string;
    service?: string;
    operation?: string;
}


@Component({
    selector: 'wa-counters-thresholds-counterinfo-edit-dialog',
    styleUrls: ['./counter-info-edit-dialog-component.scss'],
    templateUrl: './counter-info-edit-dialog-component.html'
})
export class CounterInfoEditDialogComponent implements OnInit {

    EditType = EditType; // export enum to make it available into the component template

    @ViewChild('entitySelector') _entitySelector: ServiceCatalogSelectorDialogComponent;

    display: boolean;
    private _currentEditType:EditType;
    
    confirmButtonTitle: string;

    name: string;
    description: string;
    enabled: boolean;
    pattern: string;
    fn: string;
    fnParams: string;
    channel: string;
    domain: string;
    application: string;
    service: string;
    operation: string;

    private _nameEditingWarningDisplay: boolean;

    @Output() confirm: EventEmitter<CounterInfoDialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public show(editType: EditType,
                 name?: string,
                 description?: string, 
                 enabled?: boolean, 
                 pattern?: string,
                fn?: string, 
                fnParams?: string): void {
        this.prepare(editType, name, description, enabled, pattern, fn, fnParams);
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    public get currentEditType(): EditType {
        return this._currentEditType;
    }

    private prepare(editType: EditType,
        name: string,
        description: string, 
        enabled: boolean, 
        pattern: string,
        fn: string, 
        fnParams: string): void {
        this.logger.debug(LOG_TAG, 'prepare for:', editType);
        this._currentEditType = editType;
        if (editType === EditType.New) {
            // empty the fields
            this.name = '';
            this.description = '';
            this.enabled = false;
            this.pattern = '';
            this.fn = '';
            this.fnParams = '';
            this.domain = null;
            this.application = null;
            this.service = null;
            this.operation = null;
            this.channel = null;
        } else {
            this.name = name;
            this.description = description;
            this.enabled = enabled;
            this.pattern = pattern;
            this.fn = fn;
            this.fnParams = fnParams;
            this.domain = null;
            this.application = null;
            this.service = null;
            this.operation = null;
            this.channel = null;
        }
        this.confirmButtonTitle = (editType === EditType.New ? 'Create' : 'Update');
    }

    onCancel(): void {
        this.display = false;
        this.cancel.emit();
    }

    onConfirm(): void {
        if (!this.validate()) {
            return;
        }
        this.display = false;
        const event: CounterInfoDialogResult = {
            name: this.name,
            description: this.description,
            enabled: this.enabled,
            pattern: this.pattern,
            fn: this.fn,
            fnParams: this.fnParams,
            editType: this._currentEditType,
            channel: this.channel,
            domain: this.domain,
            application: this.application,
            service: this.service,
            operation: this.operation

        };
        this.confirm.emit(event);
    }

    private validate(): boolean {
        let validate = true;
        /* TODO!!
        if (!this.name  || this.name === '') {
            this._nameEditingWarningDisplay = true;
            validate = false;
        } else {
            this._nameEditingWarningDisplay = false;
        }
        if (this.inputParams && this.inputParams.length > 0 && !this.validateJson(this.inputParams))  {
            validate = false;
            this._inputJsonWarningDisplay = true;
        } else {
            this._inputJsonWarningDisplay = false;
        }
        if (this.outputParams && this.outputParams.length > 0 && !this.validateJson(this.outputParams))  {
            validate = false;
            this._outputJsonWarningDisplay = true;
        } else {
            this._outputJsonWarningDisplay = false;
        }
        */
        return validate;
    }

    private validateJson(jsonValue: string): boolean {
        try {
            const jsonObj = JSON.parse(jsonValue);
            return true;
        } catch (ex) {
            console.log('validation error: ', ex);
            return false;
        }
    }

    onPatternSelec() {
        this._entitySelector.open('Select an Entity');
    }

    onEntrySelected(event: SelectionEvent){
        this.logger.debug(LOG_TAG, 'onEntrySelected:', event);
        this.pattern = CountersAndThresholdUtils.buildServiceCatalogEntryPattern(event.catalogEntry.channel,
            event.catalogEntry.domain,
            event.catalogEntry.application,
            event.catalogEntry.service,
            event.catalogEntry.operation);
            this.logger.debug(LOG_TAG, 'Current pattern selected :', this.pattern);
        this.domain = event.catalogEntry.domain;
        this.application = event.catalogEntry.application;
        this.service = event.catalogEntry.service;
        this.operation = event.catalogEntry.operation;
        this.channel = event.catalogEntry.channel;
    }

    public get titlePart(): string {
        if (this._currentEditType === EditType.New){
            return 'New';
        } else if (this._currentEditType === EditType.Update){
            return 'Edit';
        } else {
            return 'n.d.'
        }
    }

    public get nameEditingWarningDisplay(): boolean {
        return this._nameEditingWarningDisplay;
    }
    
}
