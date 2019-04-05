import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { PluginView } from 'web-console-core';
import { CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';

import {
    GridDataResult
} from '@progress/kendo-angular-grid';
import * as _ from 'lodash';
import { MenuItem, TreeNode } from 'primeng/api';

const LOG_TAG = '[FooASection]';

@Component({
    selector: 'foo-a-section-component',
    styleUrls: [ './foo-a-section-component.scss' ],
    templateUrl: './foo-a-section-component.html'
  })
/*
  @PluginView('FooA', {
    iconName: 'wa-ico-plugins'
})
*/
export class FooASectionComponent implements OnInit, OnDestroy {

    public gridDataLeft: any[] = [
        { name: 'pippo', description: 'è un cane' },
        { name: 'pluto', description: 'è un cane' },
        { name: 'paperino', description: 'è un papero' },
        { name: 'minnie', description: 'è un topo' },
        { name: 'topolino', description: 'è un topo' },
    ];

    //public gridDataRight: any[] = products;
    @ViewChild("canvas") canvas: ElementRef; 

    constructor(){
    }

    ngOnDestroy(): void {
    }
    
    ngOnInit(): void {
        const ctx: CanvasRenderingContext2D = this.canvas.nativeElement.getContext("2d");
        // Define the points as {x, y}
let start = { x: 50,    y: 20  };
let cp1 =   { x: 230,   y: 30  };
let cp2 =   { x: 150,   y: 80  };
let end =   { x: 250,   y: 100 };

// Cubic Bézier curve
ctx.beginPath();
ctx.moveTo(start.x, start.y);
ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
ctx.stroke();

// Start and end points
ctx.fillStyle = 'blue';
ctx.beginPath();
ctx.arc(start.x, start.y, 5, 0, 2 * Math.PI);  // Start point
ctx.arc(end.x, end.y, 5, 0, 2 * Math.PI);      // End point
ctx.fill();

// Control points
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.arc(cp1.x, cp1.y, 5, 0, 2 * Math.PI);  // Control point one
ctx.arc(cp2.x, cp2.y, 5, 0, 2 * Math.PI);  // Control point two
ctx.fill();
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            //no movement
        } else {
            alert("Dropped!");
            /*
        transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
                        */
        }
    }

}
