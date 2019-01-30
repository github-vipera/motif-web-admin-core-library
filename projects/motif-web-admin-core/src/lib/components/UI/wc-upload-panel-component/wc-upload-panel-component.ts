import { WCFileDropPanelComponent } from './wc-file-drop-panel-component';
 
import { Component, OnInit, ElementRef, Renderer2, ViewChild, EventEmitter,Output } from '@angular/core';
import { WCSlidePanelComponent } from 'web-console-ui-kit';
import { NGXLogger } from 'ngx-logger';
import { WCSubscriptionHandler } from '../../Commons/wc-subscription-handler';

const LOG_TAG = '[WCUploadPanelComponent]';

export interface WCUploadPanelEvent {
    file: File;
    fileName: string;
}

@Component({
   selector: 'wc-upload-panel',
   templateUrl: './wc-upload-panel-component.html',
   styleUrls: [ './wc-upload-panel-component.scss' ]
 })
 export class WCUploadPanelComponent implements OnInit {

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    @ViewChild('fileDrop') fileDrop: WCFileDropPanelComponent;
    @ViewChild('uploadSlideDownPanel') _uploadSlideDownPanel: WCSlidePanelComponent;

    @Output() close: EventEmitter<WCUploadPanelComponent> = new EventEmitter<WCUploadPanelComponent>();
    @Output() open: EventEmitter<WCUploadPanelComponent> = new EventEmitter<WCUploadPanelComponent>();
    @Output() upload: EventEmitter<WCUploadPanelEvent> = new EventEmitter<WCUploadPanelEvent>();
    @Output() uploadError: EventEmitter<any> = new EventEmitter<any>();

   constructor(private renderer2: Renderer2, 
    private element: ElementRef,
    private logger: NGXLogger) { }
 
   ngOnInit() {
   }

   public get isOpen(): boolean {
        return this._uploadSlideDownPanel.isOpen;
   }

   public toggle(): void {
    this._uploadSlideDownPanel.toggle()
   }

    /**
     *
     * @param show Show/Hide the new Slide down panel
     */
    public show(show: boolean): void {
        this._uploadSlideDownPanel.show(show);
    }

    onSlideEditorClose():void {
        this.logger.trace(LOG_TAG, 'onSlideEditorClose');
        if (this.fileDrop.file) {
            this.fileDrop.reset();
        }
    }

    onBundleUploadCancel(): void {
        this.logger.debug(LOG_TAG, 'onBundleUploadCancel');
        this._uploadSlideDownPanel.show(false);
    }

    onBundleUploadConfirm(): void {
        this.logger.debug(LOG_TAG, 'onBundleUploadConfirm');
        if (this.fileDrop.file) {
            this.doUploadFile(this.fileDrop.file);
            this._uploadSlideDownPanel.show(false);
            this.fileDrop.reset();
        }
    }

    private doUploadFile(file: File): void {
        this.logger.debug(LOG_TAG, 'doUploadNewBundle : ', file);
        const reader = new FileReader();
        reader.onloadend = (data) => {
            this.uploadAssetBundle(reader.result as ArrayBuffer, file.name);
        };
        reader.onerror = (error) => {
            this.logger.error(LOG_TAG, 'doUploadNewBundle error: ', error);
            this.uploadError.emit(error);
        };
        reader.readAsArrayBuffer(file);
    }

    private uploadAssetBundle(blob: ArrayBuffer, fileName: string): void {
        this.logger.debug(LOG_TAG, 'uploadAssetBundle : ', blob);
        const file =  new File([blob], fileName);
        this.upload.emit({ file: file, fileName: fileName});
    }

 }
 