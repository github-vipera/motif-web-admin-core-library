import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { DialogType, EntityType } from '../../editors/acl-editor-context';

const LOG_TAG = '[PasswordChangeDialogComponent]';

export interface PasswordChangeDialogResult {
    entityType: EntityType;
    domain: string;
    userId: string;
    newPassword: string;
    verifyPassword: string;
}

@Component({
    selector: 'wa-access-control-section-password-change-dialog',
    styleUrls: ['./password-change-dialog.scss'],
    templateUrl: './password-change-dialog.html'
})
export class PasswordChangeDialogComponent implements OnInit {

    entityType: EntityType;
    display: boolean;
    domain: string;
    userId: string;
    newPassword: string;
    verifyPassword: string;

    newPasswordEditingWarningDisplay: boolean;
    verifyPasswordEditingWarningDisplay: boolean;

    @Output() confirm: EventEmitter<PasswordChangeDialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();
 
    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy');
      }

    public show(entityType: EntityType, dataItem?: any): void {
        this.prepare(entityType, dataItem);
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    private prepare(entityType: EntityType, dataItem: any) {
        this.logger.debug(LOG_TAG, 'prepare to change password: ', entityType);
        this.entityType = entityType;
        this.domain = dataItem.domain;
        this.userId = dataItem.userId;
        this.newPassword = '';
        this.verifyPassword = '';
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
        const event: PasswordChangeDialogResult = {
            entityType: this.entityType,
            domain: this.domain,
            userId: this.userId,
            newPassword: this.newPassword,
            verifyPassword: this.verifyPassword
        };
        this.confirm.emit(event);
    }

    private validate(): boolean {
        let validate = true;
        if (!this.newPassword  || this.newPassword === '') {
            this.newPasswordEditingWarningDisplay = true;
            validate = false;
        } else {
            this.newPasswordEditingWarningDisplay = false;
        }
        if (!this.verifyPassword  || this.verifyPassword === '' || this.newPassword !== this.verifyPassword) {
            this.verifyPasswordEditingWarningDisplay = true;
            validate = false;
        } else {
            this.verifyPasswordEditingWarningDisplay = false;
        }

        return validate;
    }

}
