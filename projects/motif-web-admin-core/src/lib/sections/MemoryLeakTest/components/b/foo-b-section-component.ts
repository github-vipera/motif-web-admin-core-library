import { Component, OnInit, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';
import { CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

import {
    GridDataResult
} from '@progress/kendo-angular-grid';
import * as _ from 'lodash';

const LOG_TAG = '[FooBSection]';

export class Student {
    name: String;
}


@Component({
    selector: 'foo-b-section-component',
    styleUrls: [ './foo-b-section-component.scss' ],
    templateUrl: './foo-b-section-component.html'
  })
  /*
  @PluginView('FooB', {
    iconName: 'wa-ico-plugins'
})
*/
export class FooBSectionComponent implements OnInit, OnDestroy {

    students: Student[] = [];
    students2: Student[] = [
        {
            name: 'Siddharth'
        },
        {
            name: 'Jay'
        },
        {
            name: 'Jaydeep'
        },
        {
            name: 'Chirag'
        }];

    constructor(private logger: NGXLogger) {
        this.logger.debug(LOG_TAG , 'Opening...');

    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
        transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
        }
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
    }

}
