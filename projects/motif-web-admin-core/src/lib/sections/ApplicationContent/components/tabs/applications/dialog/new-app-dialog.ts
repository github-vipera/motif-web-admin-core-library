import { ApplicationSelectorComboBoxComponent } from '../../../../../../components/UI/selectors/application-selector-combobox-component';
import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { Application } from '@wa-motif-open-api/platform-service';

const LOG_TAG = '[NewOtpDialogComponent]';

export interface NewAppDialogResult {
    name: string;
    latestVersion: string;
    downloadUrl: string;
    forbiddenVersion: string;
}

@Component({
    selector: 'wa-appcontent-applications-new-app-dialog',
    styleUrls: ['./new-app-dialog.scss'],
    templateUrl: './new-app-dialog.html'
})
export class NewAppDialogComponent implements OnInit {

    display: boolean;
    appName: string;
    _appNameEditingWarningDisplay: boolean;
    appVersion: string;
    _appVersionEditingWarningDisplay: boolean;
    appStoreUrl: string;
    forbiddenVersion: string;

    @Input('domain') domain: string;
    @Output() confirm: EventEmitter<NewAppDialogResult> = new EventEmitter();
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
        this.appName = null;
        this.appVersion = null;
        this.appStoreUrl = '';
        this.forbiddenVersion = '';
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
        const event: NewAppDialogResult = {
            name: this.appName,
            latestVersion : this.appVersion,
            downloadUrl: this.appStoreUrl,
            forbiddenVersion: this.forbiddenVersion
        };
        this.confirm.emit(event);
    }

    get appNameEditingWarningDisplay(): boolean {
        return this._appNameEditingWarningDisplay;
    }

    get appVersionEditingWarningDisplay(): boolean {
        return this._appVersionEditingWarningDisplay;
    }

    private validate(): boolean {
        let validate = true;
        if (!this.appName) {
            this._appNameEditingWarningDisplay = true;
            validate = false;
        } else {
            this._appNameEditingWarningDisplay = false;
        }
        if (!this.appVersion) {
            this._appVersionEditingWarningDisplay = true;
            validate = false;
        } else {
            this._appVersionEditingWarningDisplay = false;
        }
        return validate;
    }

    onTypeValueChange(event) {
        this.validate();
    }

}
