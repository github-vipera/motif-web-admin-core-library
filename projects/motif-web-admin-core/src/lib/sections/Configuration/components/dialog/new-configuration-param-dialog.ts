import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[NewConfigurationParamDialogComponent]';

export interface NewParamDialogResult {
    name: string;
    type: string;
    dynamic: boolean;
    encrypted: boolean;
    value: string;
}

interface DataTypeItem {
    name: string;
    code: string;
}

@Component({
    selector: 'wa-configuration-section-new-config-param-dialog',
    styleUrls: ['./new-configuration-param-dialog.scss'],
    templateUrl: './new-configuration-param-dialog.html'
})
export class NewConfigurationParamDialogComponent implements OnInit {

    dataTypes: DataTypeItem[] = [
        { name: 'java.lang.String', code: 'java.lang.String'},
        { name: 'java.lang.Double', code: 'java.lang.Double'},
        { name: 'java.lang.Integer', code: 'java.lang.Integer'},
        { name: 'java.lang.Long', code: 'java.lang.Long'},
        { name: 'java.lang.Boolean', code: 'java.lang.Boolean'},
        { name: 'Password', code: 'password'}
    ];
    defaultDataType: DataTypeItem = { name: 'Choose a data type...', code: null };

    display: boolean;
    name: string;
    type: DataTypeItem;
    dynamic: boolean;
    encrypted: boolean;
    value: string;
    _nameEditingWarningDisplay: boolean;
    _typeEditingWarningDisplay: boolean;

    @Output() confirm: EventEmitter<NewParamDialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public show(): void {
        this.prepare();
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    private prepare(): void {
        this.logger.debug(LOG_TAG, 'prepare called');
        // empty the fields
        this.name = '';
        this.type = null;
        this.dynamic = false;
        this.encrypted = false;
        this.value = '';
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
        const event: NewParamDialogResult = {
            name: this.name,
            type: this.type.code,
            dynamic: this.dynamic,
            encrypted: this.encrypted,
            value: this.value
        };
        this.confirm.emit(event);
    }

    get nameEditingWarningDisplay(): boolean {
        return this._nameEditingWarningDisplay;
    }

    get typeEditingWarningDisplay(): boolean {
        return this._typeEditingWarningDisplay;
    }

    private validate(): boolean {
        let validate = true;
        if (!this.name  || this.name === '') {
            this._nameEditingWarningDisplay = true;
            validate = false;
        } else {
            this._nameEditingWarningDisplay = false;
        }
        if (!this.type  || !this.type.code ) {
            this._typeEditingWarningDisplay = true;
            validate = false;
        } else {
            this._typeEditingWarningDisplay = false;
        }
        return validate;
    }

    onTypeValueChange(event) {
        this.validate();
    }

}
