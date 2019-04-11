import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { DialogType, EntityType } from '../../../editors/acl-editor-context';

const LOG_TAG = '[NewAclEntityDialogComponent]';

export interface DialogResult {
    name: string;
    description: string;
    dialogType: DialogType;
    entityType: EntityType;
}

@Component({
    selector: 'wa-access-control-section-new-acl-entity-dialog',
    styleUrls: ['./new-acl-entity-dialog.scss'],
    templateUrl: './new-acl-entity-dialog.html'
})
export class NewAclEntityDialogComponent implements OnInit {

    _currentDialogType: DialogType;
    _currentEntityType: EntityType;
    dialogTitle = '';
    confirmButtonLabel = '';
    display: boolean;
    name: string;
    description: string;
    floatingLabel: string;

    private _nameEditingWarningDisplay: boolean;

    @Output() confirm: EventEmitter<DialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public show(dialogType: DialogType, entityType: EntityType, dataItem?:any): void {
        this.prepare(dialogType, entityType, dataItem);
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    public get isEdit(): Boolean {
        return this._currentDialogType === DialogType.Edit;
    }

    public get currentEntityType(): EntityType {
        return this._currentEntityType;
    }

    private prepare(dialogType: DialogType, entityType: EntityType, dataItem:any) {
        this.logger.debug(LOG_TAG, 'prepare for:', entityType);
        this._currentDialogType = dialogType;
        this._currentEntityType = entityType;
        this.dialogTitle = dialogType;
        this.floatingLabel = entityType + ' Name';
        if (dialogType == DialogType.Create) {
            // empty the fields
            this.name = '';
            this.description = '';
            this.confirmButtonLabel = 'Create';
        } else {
            this.name = dataItem.name;
            this.description = dataItem.description;
            this.confirmButtonLabel = 'Update';
        }
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
        const event: DialogResult = {
            name: this.name,
            description: this.description,
            dialogType: this._currentDialogType,
            entityType: this._currentEntityType
        };
        this.confirm.emit(event);
    }

    get nameEditingWarningDisplay(): boolean {
        return this._nameEditingWarningDisplay;
    }

    private validate(): boolean {
        let validate = true;
        if (!this.name  || this.name === '') {
            this._nameEditingWarningDisplay = true;
            validate = false;
        } else {
            this._nameEditingWarningDisplay = false;
        }
        return validate;
    }

}
