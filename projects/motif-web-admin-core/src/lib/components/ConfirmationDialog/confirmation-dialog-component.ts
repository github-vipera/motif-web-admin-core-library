import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'wc-confirmation-dialog',
    styles: [
      'input[type=text] { width: 100%; }'
    ],
    template: `
    <p-dialog
        #newItemDialog
        [(visible)]="opened"
        [modal]="true"
        [responsive]="true"
        [style]="{ width: '300px', minWidth: '300px', minHeight:'250px' }"
        [minY]="70"
        [baseZIndex]="10000"
        >
            <p-header>{{title}}</p-header>
            <div>
                {{message}}
            </div>
            <p-footer>
            <kendo-buttongroup look="flat">
              <button kendoButton [toggleable]="false" (click)="onCancel();">Cancel</button>
              <button kendoButton [toggleable]="false" [primary]="true" (click)="onConfirm();">Confirm</button>
            </kendo-buttongroup>
          </p-footer>
        </p-dialog>

    `
})
export class ConfirmationDialogComponent {

    public opened = false;
    @Input() title = 'Alert';
    @Input() message = '';
    @Input() cancelText = 'Cancel';
    @Input() confirmText = 'Confirm';
    userData:any;

    @Output() cancel: EventEmitter<any> = new EventEmitter();
    @Output() confirm: EventEmitter<any> = new EventEmitter();

    public onConfirm(): void {
        this.opened = false;
        this.confirm.emit(this.userData);
    }

    public onCancel(): void {
        this.opened = false;
        this.cancel.emit();
    }

    public open(title: string, message: string, userData?: any) {
        this.title = title;
        this.message = message;
        this.userData = userData;
        this.opened = true;
    }


}