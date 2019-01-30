import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { EditingType } from '../../editors/service-catalog-editor-context';

const LOG_TAG = '[NewItemDialogComponent]';

export interface NewOperationDialogResult {
    domain: string;
    application: string;
    service: string;
    name: string;
    editType: EditingType;
    description: string;
    pluginName: string;
    secure: boolean;
    counted: boolean;
    sessionless: boolean;
    encrypted: boolean;
    inputParams: string;
    outputParams: string;
    channel: string;
}


@Component({
    selector: 'wa-services-section-new-operation-dialog',
    styleUrls: ['./new-operation-dialog.scss'],
    templateUrl: './new-operation-dialog.html'
})
export class NewOperationDialogComponent implements OnInit {

    _currentEditType: EditingType;
    display: boolean;
    name: string;
    description: string;
    pluginName: string;
    secure: boolean;
    counted: boolean;
    sessionLess: boolean;
    encrypted: boolean;
    inputParams: string;
    outputParams: string;
    _nameEditingWarningDisplay: boolean;
    _inputJsonWarningDisplay: boolean;
    _outputJsonWarningDisplay: boolean;
    domain: string;
    application: string;
    service: string;
    channel: string;

    @Output() confirm: EventEmitter<NewOperationDialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public show(editType: EditingType, channel: string, domain: string, application: string, service: string): void {
        this.prepare(editType, channel, domain, application, service);
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    public get currentEditType(): EditingType {
        return this._currentEditType;
    }

    private prepare(editType: EditingType,
        channel: string,
        domain: string,
        application: string,
        service: string): void {
        this.logger.debug(LOG_TAG, 'prepare for:', editType);
        this._currentEditType = editType;
        // empty the fields
        this.name = '';
        this.description = '';
        this.pluginName = '';
        this.secure = false;
        this.counted = false;
        this.sessionLess = false;
        this.inputParams = '';
        this.outputParams = '';
        this.domain = domain;
        this.application = application;
        this.service = service;
        this.encrypted = true;
        this.channel = channel;
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
        const event: NewOperationDialogResult = {
            domain: this.domain,
            application: this.application,
            service: this.service,
            name: this.name,
            description: this.description,
            editType: this._currentEditType,
            pluginName: this.pluginName,
            counted: this.counted,
            secure: this.secure,
            sessionless: this.sessionLess,
            inputParams: (this.inputParams.length > 0 ? this.inputParams : null),
            outputParams: (this.outputParams.length > 0 ? this.outputParams : null),
            encrypted : this.encrypted,
            channel: this.channel
        };
        this.confirm.emit(event);
    }

    get isServiceEditing(): boolean {
        return (this._currentEditType === EditingType.Service);
    }

    get nameEditingWarningDisplay(): boolean {
        return this._nameEditingWarningDisplay;
    }

    get inputJsonWarningDisplay(): boolean {
        return this._inputJsonWarningDisplay;
    }

    get outputJsonWarningDisplay(): boolean {
        return this._outputJsonWarningDisplay;
    }

    private validate(): boolean {
        let validate = true;
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
}
