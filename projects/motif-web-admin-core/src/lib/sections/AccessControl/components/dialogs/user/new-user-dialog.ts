import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { DialogType, EntityType } from '../../editors/acl-editor-context';

const LOG_TAG = '[NewUserDialogComponent]';

export interface UserDialogResult {
    userId: string;
    userIdInt: string;
    state: string;
    email: string;
    firstName: string;
    lastName: string;
    dialogType: DialogType;
    entityType: EntityType;
}

interface State {
    name: string;
}

@Component({
    selector: 'wa-platform-section-new-user-dialog',
    styleUrls: ['./new-user-dialog.scss'],
    templateUrl: './new-user-dialog.html'
})
export class NewUserDialogComponent implements OnInit {

    _currentDialogType: DialogType;
    _currentEntityType: EntityType;
    dialogTitle = '';
    confirmButtonLabel = '';
    display: boolean;
    userId: string;
    userIdInt: string;
    email: string;
    firstName: string;
    lastName: string;

    public defaultStateItem: State = { name: 'Select a State...' };

    states: State[] = [
        { name: 'PREACTIVE'},
        { name: 'ACTIVE'},
        { name: 'BLOCKED'}
    ];
    selectedState: State;
    private _stateEditingWarningDisplay: boolean;
    private _userIdEditingWarningDisplay: boolean;

    @Output() confirm: EventEmitter<UserDialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public show(dialogType:DialogType, entityType: EntityType, dataItem?:any): void {
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

    public get isCreatingUser(): Boolean {
        return this._currentEntityType === EntityType.User;
    }

    private prepare(dialogType:DialogType, entityType: EntityType, dataItem:any) {
        this.logger.debug(LOG_TAG, 'prepare to ', dialogType === DialogType.Create ? 'create' : 'edit', ':', entityType);
        this._currentDialogType = dialogType;
        this._currentEntityType = entityType;
        this.dialogTitle = dialogType;
        if (dialogType == DialogType.Create) {
            // empty the fields
            this.userId = '';
            this.userIdInt = '';
            this.selectedState = null;
            this.confirmButtonLabel = 'Create';
        } else {
            this.userId = dataItem.userId;
            this.userIdInt = dataItem.userIdInt;
            this.selectedState = dataItem.state ? { name: dataItem.state } : undefined;
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
        const event: UserDialogResult = {
            userId: this.userId,
            userIdInt: this._currentEntityType === EntityType.User ? this.userIdInt : undefined,
            state: (this._currentEntityType === EntityType.User || this.isEdit) ? (this.selectedState ? this.selectedState.name : '') : '',
            email: (this.isEdit && this._currentEntityType === EntityType.Admin) ? this.email : undefined,
            firstName: (this.isEdit && this._currentEntityType === EntityType.Admin) ? this.firstName : undefined,
            lastName: (this.isEdit && this._currentEntityType === EntityType.Admin) ? this.lastName : undefined,
            dialogType: this._currentDialogType,
            entityType: this._currentEntityType
        };
        this.confirm.emit(event);
    }

    get stateEditingWarningDisplay(): boolean {
        return this._stateEditingWarningDisplay;
    }

    get userIdEditingWarningDisplay(): boolean {
        return this._userIdEditingWarningDisplay;
    }

    private validate(): boolean {
        let validate = true;
        if (!this.userId  || this.userId === '') {
            this._userIdEditingWarningDisplay = true;
            validate = false;
        } else {
            this._userIdEditingWarningDisplay = false;
        }
        if (this._currentEntityType === EntityType.User && !this.selectedState) {
            this._stateEditingWarningDisplay = true;
            validate = false;
        } else {
            this._stateEditingWarningDisplay = false;
        }
        return validate;
    }

}
