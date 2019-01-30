import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  OnDestroy
} from '@angular/core';
import { NGXLogger } from 'web-console-core';
import {
  SystemService,
  SystemCategory,
  SystemMessage,
  SystemMessageCreate,
  SystemMessagesList
} from '@wa-motif-open-api/platform-service';
import { ConfirmationService } from 'primeng/api';
import {
  WCNotificationCenter,
  NotificationType
} from 'web-console-ui-kit';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import {
  WCEditService,
  WCEditServiceConfiguration
} from 'web-console-ui-kit';
import { GridComponent } from '@progress/kendo-angular-grid';
import { LocalesService, Locale } from '../../../../components/Commons/locales-service';
import * as _ from 'lodash';
import { WCSubscriptionHandler } from '../../../Commons/wc-subscription-handler';

const LOG_TAG = '[MessagesPaneComponent]';

@Component({
  selector: 'wa-message-categories-messages-pane',
  styleUrls: [
    './messages-pane-component.scss',
    '../../message-categories-component-shared.scss'
  ],
  templateUrl: './messages-pane-component.html'
})
export class MessagesPaneComponent implements OnInit, OnDestroy {

  private _category: SystemCategory = null;
  private _domain: string = null;
  private _selectedMessage: SystemMessage = null;
  @Output() selectionChange: EventEmitter<SystemMessage> = new EventEmitter<
    SystemMessage
  >();

  data: SystemMessagesList = [];

  locales: string[];
  availableLocales: string[];

  private editService: WCEditService = new WCEditService();
  private editServiceConfiguration: WCEditServiceConfiguration = {
    idField: 'locale',
    dirtyField: 'isDirty',
    isNewField: 'isNew'
  };
  public formGroup: FormGroup;
  private editedRowIndex: number;

  @ViewChild('grid') _grid: GridComponent;

  private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

  constructor(
    private logger: NGXLogger,
    private systemService: SystemService,
    private confirmationService: ConfirmationService,
    private notificationCenter: WCNotificationCenter,
    private formBuilder: FormBuilder,
    private localesService: LocalesService
  ) {}

  ngOnInit() {
    this.logger.debug(LOG_TAG, 'Initializing...');
  }

  ngOnDestroy() {
      this.logger.debug(LOG_TAG , 'ngOnDestroy');
      this.freeMem();
  }

  freeMem() {
      this.formGroup = null;
      this.editService = null;
      this.locales = null;
      this.availableLocales = null;
      this.data = null;
      this._category = null;
      this._domain = null;
      this._selectedMessage = null;
      this._subHandler.unsubscribe();
      this._subHandler = null;
  }

  private reloadMessages() {
    if (this._category && this._domain) {
      this.logger.debug(
        LOG_TAG,
        'reloadMessages for ',
        this._domain,
        this._category.name
      );
      this._subHandler.add(this.systemService
        .getSystemMessages(this._domain, this._category.name)
        .subscribe(
          (data: SystemMessagesList) => {
            this.data = data;
            this.editService.read(this.data, this.editServiceConfiguration);
            this.logger.debug(LOG_TAG, 'reloadMessages: ', data);
            this._selectedMessage = null;
            this.selectionChange.emit(this._selectedMessage);

            this.availableLocales = this.buildRemainLocales();

            },
          error => {
            this.logger.error(LOG_TAG, 'reloadMessages error: ', error);
          }
        ));
    } else {
      this.data = [];
    }
  }

  @Input()
  set category(category: SystemCategory) {
    this._category = category;
    this.reloadMessages();
    this.logger.debug(LOG_TAG, 'Category changed: ', this._category);
  }

  get category(): SystemCategory {
    return this._category;
  }

  onSelectionChange(event) {
    this.logger.debug(LOG_TAG, 'onSelectionChange: ', event);
    this._selectedMessage = event.selectedRows[0].dataItem;
    this.selectionChange.emit(this._selectedMessage);
  }

  @Input()
  set domain(domain: string) {
    this._domain = domain;
    this._category = null;
    this.reloadMessages();
  }

  get domain(): string {
    return this._domain;
  }

  /**
   * Trgiggered by the button
   */
  addNewClicked(): void {
    this.formGroup = this.createFormGroup();
    this._grid.addRow(this.formGroup);
  }

  /**
   * triggered by the button
   */
  removeClicked(): void {
    if (this._selectedMessage) {
      this.confirmationService.confirm({
        message:
          'Are you sure you want to remove the selected message for Locale \'' +
          this._selectedMessage.locale +
          '\' ?',
        accept: () => {
          this.removeMessage(this._selectedMessage);
        }
      });
    }
  }

  public createFormGroup(): FormGroup {
    this.locales = this.buildRemainLocales();
    return this.formBuilder.group({
      'locale': new FormControl('en'),
      'message': new FormControl('New Message')
    });
  }

  /**
   * Triggered by the grid component
   */
  public onKeydown(sender: any, e: any) {

    if (e.key === 'Escape') {
      this.closeEditor();
      // Stop parent form from submitting
      e.preventDefault();
    }

    if (e.key !== 'Enter') {
      return;
    }
    if (!this.formGroup || !this.formGroup.valid) {
      return;
    }

    this.createNewMessage(this.formGroup.value);

    // Stop parent form from submitting
    e.preventDefault();
  }

  /**
   * triggered by the grid
   */
  public cellCloseHandler(args: any) {
    const { formGroup, dataItem } = args;
    if (!formGroup.valid) {
      // prevent closing the edited cell if there are invalid values.
      args.preventDefault();
    } else if (formGroup.dirty) {
      this.editService.assignValues(dataItem, formGroup.value);
      this.editService.update(dataItem);
    }
  }

  private closeEditor() {
    this._grid.closeRow(this.editedRowIndex);
    this.editedRowIndex = undefined;
    this.formGroup = undefined;
  }

  private removeMessage(message: SystemMessage): void {
    this.logger.debug(LOG_TAG, 'removeMessage: ', message);
    this._subHandler.add(this.systemService.deleteSystemMessage(this._domain, 
      this._category.name, message.locale).subscribe( (data) => {

        this.logger.debug(LOG_TAG , 'System Message removed: ', message);

        this.notificationCenter.post({
            name: 'RemoveSystemMessageSuccess',
            title: 'System Message Delete',
            message: 'The system message has been deleted successfully.',
            type: NotificationType.Success
        });

        this.reloadMessages();

    }, (error) => {

        this.logger.error(LOG_TAG , 'removeMessage error: ', error);

        this.notificationCenter.post({
            name: 'RemoveSystemMessageError',
            title: 'System Message Delete',
            message: 'Error deleting System Message:',
            type: NotificationType.Error,
            error: error,
            closable: true
        });

    }));
  }

  private createNewMessage(message: SystemMessage): void {
    this.logger.debug(LOG_TAG, 'createNewMessage: ', message);
    const systemMessageCreate: SystemMessageCreate = {
        locale: message.locale,
        message: message.message
    };
    // tslint:disable-next-line:max-line-length
    this._subHandler.add(this.systemService.createSystemMessage(this._domain, this._category.name, systemMessageCreate).subscribe((newMessage: SystemMessage) => {
        this.logger.debug(LOG_TAG, 'createNewMessage success: ', newMessage);

        this.editService.create(message);

        this.notificationCenter.post({
            name: 'CreateSystemMessageSuccess',
            title: 'Create System Message',
            message: 'The system message has been created successfully.',
            type: NotificationType.Success
        });

        this.availableLocales = this.buildRemainLocales();

        this.closeEditor();

    }, (error) => {

        this.logger.error(LOG_TAG, 'createNewMessage error: ', error);

        this.notificationCenter.post({
            name: 'CreateSystemMessageError',
            title: 'Create System Message',
            message: 'Error creating System Message:',
            type: NotificationType.Error,
            error: error,
            closable: true
        });

        this.closeEditor();

    }));
  }

  public get canAdd(): boolean {
    return (this._category !== null && this._domain !== null && this.availableLocales && this.availableLocales.length > 0);
  }

  public get canRemove(): boolean {
    return this._selectedMessage !== null;
  }

  private buildRemainLocales(): string[] {
      const currentLocales = this.currentDefinedLocales();
      const allLocales = this.localesService.allLocales();
      const remaining = _.difference(allLocales, currentLocales);
    return remaining;
  }

  /**
   * Return a list of current defined locales
   */
  private currentDefinedLocales(): Locale[] {
    const ret: Locale[] = [];
    for (let i = 0; i < this.data.length; i++) {
        const message: SystemMessage = this.data[i];
        ret.push( this.localesService.getLocaleByCode(message.locale) );
    }
    return ret;
  }

  public reset(): void {
    this.data = [];
  }

}
