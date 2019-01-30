import { CommonsUIModule } from '../../CommonsUIModule';
import { WCUploadPanelComponent } from './wc-upload-panel-component';
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { WCUIKitCoreModule } from 'web-console-ui-kit';
import { WCFileDropPanelComponent } from './wc-file-drop-panel-component';
import { DroppableModule } from '@ctrl/ngx-droppable';

@NgModule({
    imports: [
        CommonModule, CommonsUIModule, WCUIKitCoreModule, DroppableModule
    ],
    entryComponents: [
    ],
    declarations: [
        WCUploadPanelComponent, WCFileDropPanelComponent
    ],
    exports: [ WCUploadPanelComponent, WCUploadPanelComponent
    ],
    providers: [
    ]

  })
  export class WCUploadPanelModule { }



