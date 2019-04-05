import { ApplicationSelectorComboBoxComponent } from './../../../../../components/UI/selectors/application-selector-combobox-component';
import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { DomainSelectorComboBoxComponent } from 'projects/motif-web-admin-core/src/lib/components';

const LOG_TAG = '[NewRESTContextDialogComponent]';

export interface RESTContextDialogResult {
    name: string;
    url: string;
    domain: string;
    application: string;
    dialogMode: DialogMode;
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
    createButtonCaption: string;
    domain: string;
    application: string;


    name: string;
    url: string;

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

    public showForEdit(domain: string, application: string, contextName:string, url:string, enabled: boolean): void {
        this.prepareForEdit(domain, application, contextName, url, enabled);
        this.display = true;
    }

    public showForNew(domain:string, application:string): void {
        this.prepareForNew(domain, application);
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    private prepareForEdit(domain: string, application: string, contextName:string, url:string, enabled: boolean): void {
        this.logger.debug(LOG_TAG, 'prepare called');
        // set the fields
        this.dialogMode = DialogMode.Edit;
        this.dialogTitle = "Edit REST Context";
        this.createButtonCaption = "Update";
        this.name = contextName;
        this.url = url;
        this.domain = domain;
        this.application = application;
    }

    private prepareForNew(domain: string, application: string): void {
        this.logger.debug(LOG_TAG, 'prepare called');
        // empty the fields
        this.dialogMode = DialogMode.New;
        this.dialogTitle = "Create New REST Context";
        this.createButtonCaption = "Create";
        this.name = '';
        this.url = null;
        this.domain = domain;
        this.application = application;
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
            application: this.application,
            domain: this.domain
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

        return validate;

    }

    onTypeValueChange(event) {
        this.validate();
    }

    public get editMode():boolean {
        return this.dialogMode === DialogMode.Edit;
    }

    public get newMode():boolean {
        return this.dialogMode === DialogMode.New;
    }

}
