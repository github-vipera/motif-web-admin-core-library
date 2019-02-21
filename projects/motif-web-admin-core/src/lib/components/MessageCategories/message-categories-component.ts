import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NGXLogger} from 'web-console-core';
import { SystemCategory, SystemMessage } from '@wa-motif-open-api/platform-service';
import { CategoryPaneComponent } from './panes/category-pane/category-pane-component';
import { MessagesPaneComponent } from './panes/messages-pane/messages-pane-component';

const LOG_TAG = '[MessageCategoriesComponent]';

export interface MessageCategorySelectionEvent {
    domain: string;
    category: string;
    message: string;
    locale: string;
}

@Component({
    selector: 'wa-message-categories-component',
    styleUrls: [ './message-categories-component.scss', './message-categories-component-shared.scss' ],
    templateUrl: './message-categories-component.html'
})
export class MessageCategoriesComponent implements OnInit  {

    @Output() public selectedCategory: SystemCategory;
    @Output() public selectedMessage: SystemMessage;
    @Output() public selectionChange: EventEmitter<MessageCategorySelectionEvent> = new EventEmitter();

    @ViewChild('messagesPane') _messagesPane: MessagesPaneComponent;
    @ViewChild('categoriesPane') _categoriesPane: CategoryPaneComponent;

    private _domain: string;

    constructor(private logger: NGXLogger) {

    }

    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
    }

    onCategorySelection(category: SystemCategory) {
        this.logger.debug(LOG_TAG, 'On category selected: ', category);
        this.selectedCategory = category;
    }

    onMessageSelectionChange(message: SystemMessage) {
        this.logger.debug(LOG_TAG, 'On message selected: ', message);
        this.selectedMessage = message;
        this.emitSelectionEvent();
    }

    private emitSelectionEvent() {
        if (this._domain && this.selectedCategory && this.selectedMessage) {
            this.selectionChange.emit({
                domain: this._domain,
                category: this.selectedCategory.name,
                message: this.selectedMessage.message,
                locale: this.selectedMessage.locale
            });
        }
    }

    @Input()
    set domain(domain: string) {
        this._domain = domain;
    }

    get domain(): string {
        return this._domain;
    }

    public reset(): void {
        this._messagesPane.reset();
        this._categoriesPane.reset();
    }
}
