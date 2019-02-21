import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { NGXLogger } from 'web-console-core';
import { MessageCategoriesComponent, MessageCategorySelectionEvent } from '../../../../../components/MessageCategories/message-categories-component';

const LOG_TAG = '[MessageCategoriesDialogComponent]';



@Component({
    selector: 'wa-services-section-message-cateogries-dialog',
    styleUrls: ['./message-categories-dialog.scss'],
    templateUrl: './message-categories-dialog.html'
})
export class MessageCategoriesDialogComponent implements OnInit {

    display: boolean;
    domain: string;

    @Output() categorySelect: EventEmitter<string> = new EventEmitter();

    @ViewChild('messageCategories') _messageCategories: MessageCategoriesComponent;

    constructor(private logger: NGXLogger) {}

    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');
    }

    public show(domain: string): void {
        this.domain = domain;
        this.display = true;
    }

    public hide() {
        this.display = false;
    }

    onSelectionChange(event: MessageCategorySelectionEvent) {
        this.logger.debug(LOG_TAG, 'onSelectionChange: ', event);
    }

    onCancel() {
        this.hide();
    }

    onConfirm() {
        if (this._messageCategories.selectedCategory.name){
            this.categorySelect.emit(this._messageCategories.selectedCategory.name);
            this.hide();
        }
    }   

    public get canSelect(): boolean {
        // tslint:disable-next-line:max-line-length
        return (this._messageCategories && this._messageCategories.selectedCategory !== null && this._messageCategories.selectedCategory !== undefined);
    }


}
