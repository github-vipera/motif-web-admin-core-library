import { WAThemeDesignerClipboardService } from './toolbox/WAThemeDesignerClipboardService';
import { WAThemeDesignerColorPickerInputField } from './toolbox/color-picker-field-component/color-picker-input-field-component/wa-theme-designer-color-picker-input-field';
import { CommonModule } from '@angular/common';
import { CheckboardComponent } from './toolbox/color-picker-field-component/checkboard/checkboard.component';
import { WAThemeDesignerColorPicker } from './toolbox/color-picker-field-component/wa-theme-designer-color-picker';
import { WAThemeDesignerToolbox } from './toolbox/wa-theme-designer-toolbox';
import { WAThemeDesignerService } from './WAThemeDesignerService';
import { NgModule } from '@angular/core';
import { LoggerModule } from 'ngx-logger'
import { DialogModule } from 'primeng/dialog';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ColorChromeModule } from 'ngx-color/chrome';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ColorPickerModule } from 'primeng/colorpicker';
import { FormsModule }    from '@angular/forms'

@NgModule({
    imports: [
        LoggerModule,
        DialogModule,
        AccordionModule,
        InputTextModule,
        ButtonModule,
        ColorChromeModule,
        OverlayPanelModule,
        ColorPickerModule,
        FormsModule,
        CommonModule
    ],
    entryComponents:[
      WAThemeDesignerToolbox, WAThemeDesignerColorPicker, CheckboardComponent, WAThemeDesignerColorPickerInputField
    ],
    declarations: [
      WAThemeDesignerToolbox, WAThemeDesignerColorPicker, CheckboardComponent, WAThemeDesignerColorPickerInputField
    ],
    exports: [ ],
    providers: [
        WAThemeDesignerService, WAThemeDesignerClipboardService
    ]

  })
  export class WAThemeDesignerModule { }



