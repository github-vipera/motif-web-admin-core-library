import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[NewRESTContextDialogComponent]';

export interface RESTContextDialogResult {
    name: string;
    url: string;
    domain: string;
    application: string;
    dialogMode: DialogMode
}

export enum DialogMode {
    Edit,
    New
}

@Component({
    selector: 'wa-rest-context-dialog',
    styleUrls: ['./rest-context-dialog-component.scss'],
    templateUrl: './rest-context-dialog-component.html'
})
export class RESTContextDialogComponent implements OnInit {

    dialogMode: DialogMode;
    display: boolean;
    dialogTitle: string;

    selectedDomain: any;
    selectedApplication: any;

    name: string;
    url: string;
    domain: string;
    application: string;

    private _nameEditingWarningDisplay:boolean;
    private _urlEditingWarningDisplay:boolean;
    private _applicationEditingWarningDisplay;
    private _domainEditingWarningDisplay;

    @Output() confirm: EventEmitter<RESTContextDialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public showForEdit(domain: string, application: string, contextName:string, url:string): void {
        this.prepareForEdit(domain, application, contextName, url);
        this.display = true;
    }

    public showForNew(): void {
        this.prepareForNew();
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    private prepareForEdit(domain: string, application: string, contextName:string, url:string): void {
        this.logger.debug(LOG_TAG, 'prepare called');
        // set the fields
        this.dialogTitle = "Edit REST Context";
        this.name = contextName;
        this.url = url;
        this.selectedDomain = domain;
        this.selectedApplication = application;
    }

    private prepareForNew(): void {
        this.logger.debug(LOG_TAG, 'prepare called');
        // empty the fields
        this.dialogTitle = "Create New REST Context";
        this.name = '';
        this.url = null;
        this.domain = '';
        this.application = '';
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
        const event: RESTContextDialogResult = {
            dialogMode: this.dialogMode,
            name: this.name,
            url: this.url,
            application: this.selectedApplication.name,
            domain: this.selectedDomain.name
        };
        this.confirm.emit(event);
    }

    get urlEditingWarningDisplay():boolean {
        return this._urlEditingWarningDisplay;
    }

    get nameEditingWarningDisplay(): boolean {
        return this._nameEditingWarningDisplay;
    }

    get domainEditingWarningDisplay(): boolean {
        return this._domainEditingWarningDisplay;
    }

    get applicationEditingWarningDisplay(): boolean {
        return this._applicationEditingWarningDisplay;
    }

    private validate(): boolean {
        
        let validate = true;
        if (!this.name  || this.name === '') {
            this._nameEditingWarningDisplay = true;
            validate = false;
        } else {
            this._nameEditingWarningDisplay = false;
        }

        if (!this.url  || this.url === '' ) {
            this._urlEditingWarningDisplay = true;
            validate = false;
        } else {
            this._urlEditingWarningDisplay = false;
        }

        if (!this.selectedDomain){
            this._domainEditingWarningDisplay = true;
            validate = false;
        } else {
            this._domainEditingWarningDisplay = false;
        }

        if (!this.selectedApplication){
            this._applicationEditingWarningDisplay = true;
            validate = false;
        } else {
            this._applicationEditingWarningDisplay = false;
        }
        return validate;

    }

    onTypeValueChange(event) {
        this.validate();
    }

}
