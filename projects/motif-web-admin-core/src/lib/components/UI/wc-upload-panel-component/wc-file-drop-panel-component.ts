
import { Component, OnInit, Input } from '@angular/core';
import { NGXLogger} from 'web-console-core'


const LOG_TAG = "[FileDropComponent]";

@Component({
    selector: 'wc-file-drop-panel',
    styles: [
        '.wc-file-drop-panel {  width: 100%; height: 100%; border: 1px dashed #8b8c8c; display:flex;align-items: center;justify-content: center; flex-direction:column;}',
        '.wc-file-drop-panel.dragover { background-color: #4c4c4c; }',
        '.wc-file-drop-panel-caption { font-size: .7rem;font-family: montserrat; text-transform: uppercase; vertical-align: middle; text-align: center;padding-top: 4px;}',
        '.wc-file-drop-panel-caption-filename { font-size: .6rem;}',
        '.wc-file-drop-panel { font-family: montserrat; text-transform: uppercase; color: #888; font-size: .7rem; }'
    ],
    template:`
        <div droppable (filesDropped)="handleFilesDropped($event)" class="wc-file-drop-panel" role="button" #dropzone="droppable">
        {{caption}}
        <!--
        <label *ngIf="!dropzone.isHover" class="btn small wc-file-drop-panel-caption">{{caption}}</label>
        <label *ngIf="dropzone.isHover" class="btn small wc-file-drop-panel-caption">{{altCaption}}</label>
        <label *ngIf="droppedFileName" class="wc-file-drop-panel-caption wc-file-drop-panel-caption-filename">{{droppedFileName}}</label>
        -->
        </div>
    `
})
export class WCFileDropPanelComponent implements OnInit {

    //@Input() caption:string = "Drop files here or click";
    @Input() altCaption:string = "Drop the file";

    public droppedFileName:string = null;
    private _droppedFile:File;
    private _caption: string =  'Drop files here or click';

    constructor(private logger: NGXLogger){
            this.logger.debug(LOG_TAG ,"Creating...");
    } 

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG ,"Initializing...");
    }

    public handleFilesDropped(event){
        this.logger.debug(LOG_TAG ,"File dropped: ", event);
        this._droppedFile = event[0];
        this.droppedFileName = event[0].name;
    }

    public get file():File {
        return this._droppedFile;
    }

    public reset():void {
        this._droppedFile = null;
        this.droppedFileName = null;
    }
    
    public get caption():string {
        if (this.droppedFileName!=null){
            return this.droppedFileName;
        } else {
            return this._caption;
        }
    }

    @Input()
    public set caption(value:string){
        this._caption = value;
    }
}

