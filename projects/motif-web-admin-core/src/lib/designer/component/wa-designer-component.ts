import { Component, OnInit, OnDestroy } from '@angular/core';
import { NGXLogger} from 'web-console-core';

const LOG_TAG = '[LogSection]';

declare var grapesjs: any; // Important!

@Component({
    selector: 'wa-designer-component',
    styleUrls: [ './wa-designer-component.scss' ],
    templateUrl: './wa-designer-component.html'
  })
export class WADesignerComponent implements OnInit, OnDestroy {

    constructor(private logger: NGXLogger) {
        this.logger.debug(LOG_TAG , 'Opening...');
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');

        const editor = grapesjs.init({
            container : '#designer-container',
            components: '<div class="txt-red">Hello world!</div>',
            style: '.txt-red{color: red}',
          });
      
          var blockManager = editor.BlockManager;
      
          // 'my-first-block' is the ID of the block
          blockManager.add('my-first-block', {
            label: 'Simple block',
            content: '<div class="my-block">This is a simple block</div>',
          });
      
          // 'my-first-block' is the ID of the block
          blockManager.add('View Title', {
            label: 'View Title',
            content: '<div class="view-title">View</div>',
          });

          
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
    }



}
