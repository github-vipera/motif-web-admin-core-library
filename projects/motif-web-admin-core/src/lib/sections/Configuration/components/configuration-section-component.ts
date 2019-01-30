import { Component, OnInit, OnDestroy, ViewChild, Input, ElementRef, Renderer } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger} from 'web-console-core';
import { SettingsService, ConfigurationsService, SettingUpdate, SettingCreate } from '@wa-motif-open-api/configuration-service';
import { MotifService, MotifServicesList, ConfigurationRow } from '../data/model';
import { ConfirmationDialogComponent } from 'src/app/components/ConfirmationDialog/confirmation-dialog-component';
import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import * as FileSaver from 'file-saver';
import { WCEditService, WCEditServiceConfiguration } from 'web-console-ui-kit';
import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
import { State, process } from '@progress/kendo-data-query';
import { map } from 'rxjs/operators/map';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { faFileImport, faDownload } from '@fortawesome/free-solid-svg-icons';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { NewConfigurationParamDialogComponent, NewParamDialogResult } from './dialog/new-configuration-param-dialog';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';

const LOG_TAG = '[ConfigurationSection]';

@Component({
    selector: 'wa-configuration-section',
    styleUrls: [ './configuration-section.component.scss' ],
    templateUrl: './configuration-section.component.html'
  })
  @PluginView('Configuration', {
    iconName: 'ico-configuration'
  })
export class ConfigurationSectionComponent implements OnInit, OnDestroy {

    faFileImport = faFileImport;
    faDownload = faDownload;

    public view: Observable<GridDataResult>;
    public gridState: State = {
        sort: [],
        skip: 0,
        take: 10
    };
    public changes: any = {};


    // Data binding
    public loading = false;
    public editDataItem: ConfigurationRow;

    @ViewChild(ConfirmationDialogComponent) confirmationDialog: ConfirmationDialogComponent;
    @ViewChild(ComboBoxComponent) servicesComboBox: ComboBoxComponent;
    @ViewChild('datagrid') grid: GridComponent;
    @ViewChild('newPropertyDialog') propertyEditorDialog: NewConfigurationParamDialogComponent;
    @ViewChild('xmlFileImport') xmlFileImportEl: ElementRef;

    // Buttons
    public canSave = false;
    public canRefresh = false;
    public canExport = true;
    public canAddProperty = false;

    // internal
    private _selectedService: MotifService; // the combobox selection
    private _editServiceConfig: WCEditServiceConfiguration = { idField: 'name' , dirtyField: 'dirty', isNewField: 'isNew'};
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    constructor(private logger: NGXLogger,
        private settingsService: SettingsService,
        private configurationService: ConfigurationsService,
        public editService: WCEditService,
        private formBuilder: FormBuilder,
        private renderer: Renderer,
        private notificationCenter: WCNotificationCenter,
        private elem: ElementRef) {
            this.editService.init();
            this.logger.debug(LOG_TAG , 'Opening...');
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
        this.view = this.editService.pipe(map(data => process(data, this.gridState)));
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.view = null;
        this.editDataItem = null;
        this._selectedService = null;
        this._editServiceConfig = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    /**
     * Triggered by the grid component
     * @param state
     */
    public onStateChange(state: State) {
        this.gridState = state;
        this.logger.debug(LOG_TAG , 'onStateChange: ', state);
    }



    /**
     * Reload the list of parameters for a given service
     * @param service
     */
    private reloadConfigurationParamsForService(service: MotifService) {
        this.logger.debug(LOG_TAG, 'Reloading paramters for service:', service);
        if (service) {
            this.loading = true;
            this._subHandler.add(this.settingsService.getSettings(service.name).subscribe((data) => {
                this.logger.debug(LOG_TAG , 'reloadConfigurationParamsForService done: ', data);
                this.editService.cancelChanges();
                this.editService.read(data, this._editServiceConfig);
                this.loading = false;
            }, (error) => {
                this.logger.error(LOG_TAG , 'reloadConfigurationParamsForService error: ', error);
                this.loading = false;

                this.notificationCenter.post({
                    name: 'LoadConfigurationError',
                    title: 'Load Configuration',
                    message: 'Error loading configuration settings:',
                    type: NotificationType.Error,
                    error: error,
                    closable: true
                });

            }));
        } else {
            this.editService.read([], this._editServiceConfig);
        }
        this.setOptions(true, true, true, true);
    }

    /**
     * User selection from Combobox
     */
    @Input()
    public set selectedService(service: MotifService) {
        this._selectedService = service;
        this.reloadConfigurationParams();
        if (service) {
            this.setOptions(true, true, true, true);
        } else {
            this.setOptions(false, false, true, false);
        }
    }

    public get selectedService(): MotifService {
        return this._selectedService;
    }

    /**
     * Reload current configuration for the current selected service
     */
    private reloadConfigurationParams() {
        return this.reloadConfigurationParamsForService(this._selectedService);
    }

    /**
     * User selection on click
     * triggered by the grid
     * @param param0
     */
    public cellClickHandler({ sender, rowIndex, columnIndex, dataItem, isEdited }): void {
        if (!isEdited) {
            sender.editCell(rowIndex, columnIndex, this.createFormGroupForEdit(dataItem));
        }
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

    /**
     * Prepare edit form for inline editing
     */
    public createFormGroupForEdit(dataItem: ConfigurationRow): FormGroup {
        this.logger.debug(LOG_TAG, 'createFormGroupForEdit:', dataItem.value);
        return this.formBuilder.group({
            'value': dataItem.value
        });
    }

    /**
     * Export current configuration
     */
    private exportConfigurationFile(): void {
        this._subHandler.add(this.configurationService.downloadXml().subscribe((data) => {
            this.logger.debug(LOG_TAG , 'Export done:', data);

            const fileName = 'motif_configuration_' + new Date().getTime() + '.xml';
            FileSaver.saveAs(data, fileName);
            this.logger.debug(LOG_TAG , 'Configuration saved: ', fileName);

            this.notificationCenter.post({
                name: 'ConfigurationExportSuccess',
                title: 'Configuration Export',
                message: 'The configuration has been exported successfully.',
                type: NotificationType.Success
            });


        }, (error) => {
            this.logger.error(LOG_TAG , 'Export error:', error);

            this.notificationCenter.post({
                name: 'ConfigurationExportError',
                title: 'Export Configuration',
                message: 'Error exporting configuration:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });
        }));
    }

    /**
     * Event emitted by the editor form
     */
    onEditCancel(): void {
        this.logger.debug(LOG_TAG , 'On Edit Cancelled');
        this.editDataItem = undefined;
    }

    /**
     * Button event
     */
    onRefreshClicked(): void {
        if (this.editService.hasChanges()) {
            this.confirmationDialog.open('Pending Changes',
                // tslint:disable-next-line:max-line-length
                'Attention, in the configuration there are unsaved changes. Proceeding with the refresh these changes will be lost. Do you want to continue?',
                { 'action' : 'refresh' });
        } else {
            this.reloadConfigurationParams();
        }
    }

    /**
     * Button event
     */
    onSaveClicked(): void {
        this.logger.debug(LOG_TAG , 'Save clicked');
        this._subHandler.add(this.saveAllChanges().subscribe((responses) => {
            this.reloadConfigurationParams();
            this.logger.debug(LOG_TAG, 'Settings saved successfully: ', responses);

            this.notificationCenter.post({
                name: 'SettingsSaveSuccess',
                title: 'Settings Save',
                message: 'The configuration settings have been saved correctly',
                type: NotificationType.Success
            });

        }, (error) => {
            this.logger.debug(LOG_TAG , 'Error saving settings: ', error);

            this.notificationCenter.post({
                name: 'SettingsSaveError',
                title: 'Configuration Save',
                message: 'Error saving configuration settings:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    /**
     * Save all pending chenges remotely
     */
    private saveAllChanges(): Observable<any[]> {
        this.logger.debug(LOG_TAG, 'Saving all changes...');

        const itemsToAdd = this.editService.createdItems;
        const itemsToUpdate = this.editService.updatedItems;
        const itemsToRemove = this.editService.deletedItems;

        const responses = [];

        let i = 0;

        // Add new
        for (i = 0; i < itemsToAdd.length; i++) {
            const settingCreate: SettingCreate = {
                name : itemsToAdd[i].name,
                crypted : itemsToAdd[i].crypted,
                dynamic : itemsToAdd[i].dynamic,
                type : itemsToAdd[i].type,
                value : itemsToAdd[i].value
            };
            const response = this.settingsService.createSetting(this.selectedService.name, settingCreate);
            responses.push(response);
        }

        // Update existing
        for (i = 0; i < itemsToUpdate.length; i++) {
            const settingName = itemsToUpdate[i].name;
            const settingUpdate: SettingUpdate = {
                crypted : itemsToUpdate[i].crypted,
                dynamic : itemsToUpdate[i].dynamic,
                type : itemsToUpdate[i].type,
                value : itemsToUpdate[i].value
            };
            const response = this.settingsService.updateSetting(this.selectedService.name, settingName, settingUpdate);
            responses.push(response);
        }

        // Delete existing
        for (i = 0; i < itemsToRemove.length; i++) {
            const settingName = itemsToRemove[i].name;
            const response = this.settingsService.deleteSetting(this.selectedService.name, settingName);
            responses.push(response);
        }

        this.logger.debug(LOG_TAG, 'Waiting for all changes commit.');
        return forkJoin(responses);
    }


    /**
     * Button Event
     */
    onDiscardClicked(): void {
        if (this.editService.hasChanges()) {
            this.confirmationDialog.open('Pending Changes',
                // tslint:disable-next-line:max-line-length
                'Attention, in the configuration there are unsaved changes. Proceeding all these changes will be lost. Do you want to continue?',
                { 'action' : 'discardChanges' });
        } else {
            this.reloadConfigurationParams();
        }
    }

    /**
     * Button event
     */
    onExportClicked(): void {
        this.logger.debug(LOG_TAG , 'Export clicked');
        this.exportConfigurationFile();
    }

    /**
     * Button event
     */
    onImportClicked(): void {
        this.logger.debug(LOG_TAG , 'Import clicked:', this.xmlFileImportEl);
        // trigger mouse click
        const event = new MouseEvent('click', {bubbles: true});
        this.renderer.invokeElementMethod(
        this.xmlFileImportEl.nativeElement, 'dispatchEvent', [event]);
    }

    /**
     * Button event
     */
    onAddPropertyClicked(): void {
        // display new item dialog
        this.propertyEditorDialog.show();
    }

    /**
     * Event emitted by the confirmation dialog
     * @param userData
     */
    onConfirmationCancel(userData): void {
        this.logger.debug(LOG_TAG , 'onConfirmationCancel for:', userData);
    }

    /**
     * Event emitted by the confirmation dialog
     * @param userData
     */
    onConfirmationOK(userData): void {
        this.logger.debug(LOG_TAG , 'onConfirmationOK for:', userData);

        if (userData && userData.action === 'refresh') {
            this.reloadConfigurationParams();
        }
        if (userData && userData.action === 'discardChanges') {
            this.editService.cancelChanges();
        }
    }

    /**
     * Triggered by the new Property Editor Dialog
     * @param event
     */
    onEditCommit(newConfigurationRow: ConfigurationRow): void {
        this.logger.debug(LOG_TAG , 'onEditCommit new row:', newConfigurationRow);
        this.editService.create(newConfigurationRow);
    }

    /**
     * Enable or disable buttons
     * @param canSave
     * @param canRefresh
     * @param canExport
     * @param canAddProperty
     */
    private setOptions(canSave: boolean, canRefresh: boolean, canExport: boolean, canAddProperty: boolean): void {
        this.canSave = canSave;
        this.canRefresh = canRefresh;
        this.canExport = canExport;
        this.canAddProperty = canAddProperty;
    }

    /**
     * Triggered by the grid delete button
     * @param dataItem
     */
    onDeleteOKPressed(dataItem: ConfigurationRow): void {
        this.logger.debug(LOG_TAG , 'onDeleteOKPressed for item: ', dataItem);
        this.editService.remove(dataItem);
      }


    /**
     * Triggered by the input tag
     * @param event
     */
    onUploadFileSelected(event): void {
        const reader = new FileReader();
        if (event.target.files && event.target.files.length > 0) {
          const file = event.target.files[0];
          reader.onloadend = () => {
              this.uploadConfiguration(reader.result);
          };
          reader.onerror = (error) => {
            this.logger.error(LOG_TAG , 'onUploadFileSelected error: ', error);

            this.notificationCenter.post({
                name: 'ReadingConfigurationError',
                title: 'Configuration Upload',
                message: 'Error reading configuration file:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

          };
          reader.readAsText(file);
        }
    }

    /**
     * Upload the blob file to server
     * @param blob
     */
    uploadConfiguration(blob): void {
        this.notificationCenter.post({
            name: 'ConfigurationUpload',
            title: 'Configuration Upload',
            message: 'Uploading configuration...',
            type: NotificationType.Info
        });

        this._subHandler.add(this.configurationService.uploadXml(blob, false).subscribe((data) => {
            this.logger.info(LOG_TAG , 'Import xml done:', data);

            this.notificationCenter.post({
                name: 'ConfigurationUploadSuccess',
                title: 'Configuration Upload',
                message: 'The configuration has been successfully uloaded.',
                type: NotificationType.Success
            });


            this.reloadConfigurationParams();
          }, (error) => {
            this.logger.error(LOG_TAG, 'Import xml configuration error:', error);

            this.notificationCenter.post({
                name: 'ConfigurationUploadError',
                title: 'Configuration Upload',
                message: 'Error uploading configuration:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    onAddNewPropertyConfirmed(dialogResult: NewParamDialogResult) {
        const newConfigurationRow = new ConfigurationRow();
        newConfigurationRow.name = dialogResult.name;
        newConfigurationRow.crypted = dialogResult.encrypted;
        newConfigurationRow.isNew = true;
        newConfigurationRow.dynamic = dialogResult.dynamic;
        newConfigurationRow.type = dialogResult.type;
        newConfigurationRow.value = dialogResult.value;
        this.onEditCommit(newConfigurationRow);
    }

}
