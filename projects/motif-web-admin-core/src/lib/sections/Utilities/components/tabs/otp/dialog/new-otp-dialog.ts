import { ApplicationSelectorComboBoxComponent } from './../../../../../../components/UI/selectors/application-selector-combobox-component';
import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { Application } from '@wa-motif-open-api/platform-service';

const LOG_TAG = '[NewOtpDialogComponent]';

export interface NewOtpDialogResult {
    application: Application;
    scope: string;
}

@Component({
    selector: 'wa-utilities-otp-component-new-otp-dialog',
    styleUrls: ['./new-otp-dialog.scss'],
    templateUrl: './new-otp-dialog.html'
})
export class NewOtpDialogComponent implements OnInit {

    display: boolean;
    application: Application;
    scope: string;
    _applicationEditingWarningDisplay: boolean;

    @Input('domain') domain: string;
    @Output() confirm: EventEmitter<NewOtpDialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();
    @ViewChild('applicationSelector') applicationSelector: ApplicationSelectorComboBoxComponent;

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
        this.application = null;
        this.scope = '';
        this.applicationSelector.reset();
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
        const event: NewOtpDialogResult = {
            application: this.application,
            scope: (this.scope.length > 0 ? this.scope : null)
        };
        this.confirm.emit(event);
    }

    get applicationEditingWarningDisplay(): boolean {
        return this._applicationEditingWarningDisplay;
    }

    private validate(): boolean {
        let validate = true;
        if (!this.application) {
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
