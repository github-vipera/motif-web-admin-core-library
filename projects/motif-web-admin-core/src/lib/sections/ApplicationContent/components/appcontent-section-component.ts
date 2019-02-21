import { Component, OnInit, ViewChild, ElementRef, Renderer2} from '@angular/core';
import { PluginView } from 'web-console-core'
import { NGXLogger} from 'web-console-core'
import { WCToasterService } from 'web-console-ui-kit'
import * as _ from 'lodash';

const LOG_TAG = "[AppContentSection]";

@Component({
    selector: 'wa-appcontent-section',
    styleUrls: [ './appcontent-section-component.scss' ],
    templateUrl: './appcontent-section-component.html'
  })
  @PluginView("Application Content",{
    iconName: "wa-ico-smartphone" 
})
export class AppContentSectionComponent implements OnInit {
    

    constructor(private logger: NGXLogger, 
        private toaster: WCToasterService){
        this.logger.debug(LOG_TAG ,"Opening...");
        
    } 
    
    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG ,"Initializing...");
    }


    /**
     * Show Info Toast
     * @param title 
     * @param message 
     */
    private showInfo(title:string, message:string):void {
        this.toaster.info(message, title, {
            positionClass: 'toast-top-center'
        });
    }

    /**
     * Show Error Toast
     * @param title 
     * @param message 
     */
    private showError(title:string, message:string):void {
        this.toaster.error(message, title, {
            positionClass: 'toast-top-center'
        });
    }

}
