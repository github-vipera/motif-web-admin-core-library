import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[UninstallConfirmationDialogComponent]';

export interface UninstallDialogResult {
    deleteConfig:boolean;
    pluginName: string;
    pluginVersion: string;
}


@Component({
    selector: 'wa-uninstall-confirmation-dialog-component',
    styleUrls: ['./uninstall-confirmation-dialog-component.scss'],
    templateUrl: './uninstall-confirmation-dialog-component.html'
})
export class UninstallConfirmationDialogComponent implements OnInit {

    display: boolean;
    deleteConfiguration: boolean = false;
    pluginName: string;
    pluginVersion: string;

    @Output() confirm: EventEmitter<UninstallDialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public show(pluginName:string, pluginVersion: string): void {
        this.prepare();
        this.pluginName = pluginName;
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    private prepare(): void {
        this.logger.debug(LOG_TAG, 'prepare called');
    }

    onCancel(): void {
        this.display = false;
        this.cancel.emit();
    }

    onConfirm(): void {
        this.display = false;
        const event: UninstallDialogResult = {
            pluginName: this.pluginName,
            deleteConfig: this.deleteConfiguration,
            pluginVersion: this.pluginVersion
        };
        this.confirm.emit(event);
    }


}
