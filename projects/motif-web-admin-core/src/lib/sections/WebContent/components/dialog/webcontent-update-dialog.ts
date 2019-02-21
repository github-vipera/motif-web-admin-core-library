import { Component, OnInit, Input, ViewChild, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { StringMap } from '@angular/compiler/src/compiler_facade_interface';

const LOG_TAG = '[WebContentUpdateDialogComponent]';

export interface UpdateDialogResult {
    domain: string;
    application: string;
    context: string;
}

@Component({
    selector: 'wa-webcontent-update-dialog',
    styleUrls: ['./webcontent-update-dialog.scss'],
    templateUrl: './webcontent-update-dialog.html'
})
export class WebContentUpdateDialogComponent implements OnInit {

    display: boolean;
    domain: string;
    application: string;
    context: string;

    selectedDomain: any;
    selectedApplication: any;

    contextEditingWarningDisplay = false;
    
    @Output() confirm: EventEmitter<UpdateDialogResult> = new EventEmitter();
    @Output() cancel: EventEmitter<void> = new EventEmitter();

    constructor(private logger: NGXLogger) {}

    ngOnInit(): void {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public show(domain: string, application: string, context: string): void {
        this.logger.debug(LOG_TAG, 'show called for: ', domain, application, context);
        this.prepare(domain, application, context);
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    private prepare(domain: string, application: string, context: string): void {
        this.logger.debug(LOG_TAG, 'show called for: ', domain, application, context);
        // fill the fields
        this.domain = domain;
        this.application = application;
        this.context = context;
    }

    onCancel(): void {
        this.display = false;
        this.cancel.emit();
    }

    onConfirm(): void {
        //TODO !!       
    }

}