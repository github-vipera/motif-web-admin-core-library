import { EEHook } from './EEHook';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'eehook-component',
    styleUrls: [ './ehooks-component.scss' ],
    styles: [
      'input[type=text] { width: 100%; }'
    ],
    template: `
    <p-dialog
        class="ehook-dialog"
        (eehook)="onFire()"
        [showHeader]="false"
        #newItemDialog
        [(visible)]="opened"
        [modal]="true"
        [responsive]="true"
        [contentStyle] = "{ padding: '0px' }"
        [style]="{ width: '600px', height: '451px', minWidth: '600px', minHeight:'451px' }"
        [minY]="70"
        [baseZIndex]="10000"
        >
            <div class="img-eehook-comp" (click)="onClose()">
            </div>
            <p-footer>
          </p-footer>
        </p-dialog>

    `
})
export class EEHookComponent {

    private eeHook: EEHook;
    public opened = false;
    @Input() title = 'Alert';
    @Input() message = '';
    @Input() cancelText = 'Cancel';
    @Input() confirmText = 'Confirm';
    userData:any;

    @Output() cancel: EventEmitter<any> = new EventEmitter();
    @Output() confirm: EventEmitter<any> = new EventEmitter();

    constructor(){
        //console.log(">>>>>>>>>>>>>>>>>>>>>>> Ctor Component ");
        this.eeHook = new EEHook();
        /*
        this.eeHook.onFire.subscribe(()=>{
            console.log(">>>>>>>>>>>>>>>>>>>>>>>  ON FIRE!!");
            this.opened = true;
        });
        */
    }
    
    onFire(){
        //console.log(">>>>>>>>>>>>>>>>>>>>>>>  ON FIRE!!");
        this.show();
    }

    show(){
        this.opened = true;
    }

    public onClose(): void {
        this.opened = false;
        //this.cancel.emit();
    }



}