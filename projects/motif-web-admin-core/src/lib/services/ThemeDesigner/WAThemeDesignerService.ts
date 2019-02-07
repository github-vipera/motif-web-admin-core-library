import { Injectable, Inject } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { GUI } from "dat-gui";
import { DOCUMENT } from '@angular/common';

import * as dat from 'dat.gui'

const LOG_TAG = '[WAThemeDesignerService]';

@Injectable()
export class WAThemeDesignerService {

  private themeWrapper: any;

    constructor(private logger: NGXLogger, @Inject(DOCUMENT) private document: any){
      console.log("@Inject(DOCUMENT) private document ", document);
      this.themeWrapper = this.document.querySelector('app-root');
      console.log("this.themeWrapper:", this.themeWrapper);
    }

    private obj:any;

    public show(){
        this.logger.debug(LOG_TAG, 'show called' );

        const gui: GUI = new dat.default.GUI({name: "Theme Designer", width: 400, closed: true, autoPlace: true, hideable:true });
        gui.useLocalStorage = true;

        this.obj = {
            header: {
                "Background": "#ffae23",
                "Color" : "#ffae23",
                "ColorHover" : "#ffae23"
            },
            Export: () =>{ alert("ppppp"); console.log("this.obj:",this.obj)}
          };

          let f1 = gui.addFolder("Header");
          f1.addColor(this.obj.header, 'Background').onChange((value) => {
            //console.log("this.themeWrapper:", this.themeWrapper)
            this.themeWrapper.style.setProperty('--headerBackground', value);
          });
          f1.addColor(this.obj.header, 'Color').onChange((value) => {
            //console.log("this.themeWrapper:", this.themeWrapper)
            this.themeWrapper.style.setProperty('--headerColor', value);
          });
          f1.addColor(this.obj.header, 'ColorHover').onChange((value) => {
            //console.log("this.themeWrapper:", this.themeWrapper)
            this.themeWrapper.style.setProperty('--headerColorHover', value);
          });

          gui.add(this.obj, "Export");


          this.logger.debug(LOG_TAG, 'show done' );

    }
}

var FizzyText = function() {
    this.message = 'dat.gui';
    this.speed = 0.8;
    this.displayOutline = true;
};
