import { ServiceCatalogSelectorComponent, ServiceCatalogNodeSelectionEvent } from './../../../components/UI/selectors/service-catalog-selector/service-catalog-selector-component';
import { Component, OnInit, ViewChild, ChangeDetectorRef, Renderer2, OnDestroy } from '@angular/core';
import { PluginView } from 'web-console-core';
import { NGXLogger } from 'web-console-core';
import { RegistryService } from '@wa-motif-open-api/plugin-registry-service';
import { faGlobe, faArchive, faBoxOpen, faCompass, faDesktop, faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { ServiceCatalogService } from '../../../services/ServiceCatalogService';
import { TreeNode } from 'primeng/api';
import { CatalogEntry } from '../data/model';
import { ServiceCataglogEditorComponent } from './editors/service-catalog-editor-component';
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit';
import { MenuItem } from 'primeng/api';
import * as _ from 'lodash';
import { NewItemDialogComponent, DialogResult } from './dialogs/generic/new-item-dialog';
import { NewOperationDialogComponent, NewOperationDialogResult } from './dialogs/service-operation/new-operation-dialog';
import { ServiceCatalogEditorChangesEvent, EditingType } from './editors/service-catalog-editor-context';
import { Domain, Application } from '@wa-motif-open-api/platform-service';
import { Service, ServiceOperation } from '@wa-motif-open-api/catalog-service';
import { ConfirmationService } from 'primeng/api';
import { WCSubscriptionHandler } from '../../../components/Commons/wc-subscription-handler';

const LOG_TAG = '[ServicesSection]';



@Component({
    selector: 'wa-services-section',
    styleUrls: ['./services-section-component.scss'],
    templateUrl: './services-section-component.html'
})
@PluginView('Services', {
    iconName: 'wa-ico-services'
})
export class ServicesSectionComponent implements OnInit, OnDestroy {

    // Menus
    menuItems: MenuItem[];

    // Icons
    faGlobe = faGlobe;
    faBoxOpen = faBoxOpen;
    faArchive = faArchive;
    faCompass = faCompass;
    faDesktop = faDesktop;

    deleteButtonCaption = 'Delete selected Domain ';
    deleteButtonEnabled: boolean;

    @ViewChild('servicesEditor') _servicesEditor: ServiceCataglogEditorComponent;
    @ViewChild('newItemDialog') _newItemDialog: NewItemDialogComponent;
    @ViewChild('newOperationDialog') _newOperationDialog: NewOperationDialogComponent;
    @ViewChild('serviceCatalog') _serviceCatalog: ServiceCatalogSelectorComponent;

    // Menus
    private _deleteMenuItem: MenuItem;
    private _addDomainMenuItem: MenuItem;
    private _addApplicationMenuItem: MenuItem;
    private _addServiceMenuItem: MenuItem;
    private _addOperationMenuItem: MenuItem;
    private _addMenuItem: MenuItem;

    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();

    constructor(private logger: NGXLogger,
        private registryService: RegistryService,
        private serviceCatalogService: ServiceCatalogService,
        private notificationCenter: WCNotificationCenter,
        private renderer2: Renderer2,
        private changeDetector: ChangeDetectorRef,
        private confirmationService: ConfirmationService
        ) {
        this.logger.debug(LOG_TAG, 'Opening...');

        this._deleteMenuItem = {
            id: 'delete',
            label: 'Delete',
            disabled: true,
            command: (event) => { this.onDeleteSelectedNode(); }
        };
        this._addDomainMenuItem = {
            id: 'newDomain',
            label: 'New Domain',
            command: (event) => { this.onAddDomainClick(); }
        };
        this._addApplicationMenuItem = {
            id: 'newApplication',
            label: 'New Application',
            disabled: true,
            command: (event) => { this.onAddApplicationClick(); }
        };
        this._addServiceMenuItem =  {
            id: 'newService',
            label: 'New Service',
            disabled: true,
            command: (event) => { this.onAddServiceClick(); }
        };
        this._addOperationMenuItem =  {
            id: 'newOperation',
            label: 'New Operation',
            disabled: true,
            command: (event) => { this.onAddOperationClick(); }
        };
        this._addMenuItem = {
            label: 'New...',
            items: [
                this._addDomainMenuItem,
                this._addApplicationMenuItem,
                this._addServiceMenuItem,
                this._addOperationMenuItem
            ]
        };
        this.menuItems = [
            this._addMenuItem,
            this._deleteMenuItem
        ];
    }

    /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG, 'Initializing...');

        this.refreshData();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this._deleteMenuItem = null;
        this._addDomainMenuItem = null;
        this._addApplicationMenuItem = null;
        this._addServiceMenuItem = null;
        this._addOperationMenuItem = null;
        this._addMenuItem = null;
        this._serviceCatalog.freeMem();
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    public onRefreshClicked(): void {
        this.logger.debug(LOG_TAG, 'Refresh clicked');
        this.refreshData();
    }

    public refreshData() {
        this._serviceCatalog.reloadData();
    }

    nodeSelect(nodeEvent: ServiceCatalogNodeSelectionEvent) {
        this.logger.debug(LOG_TAG, 'Node selected: ', nodeEvent);

        const catalogEntry = nodeEvent.node.data;
        const nodeType = nodeEvent.node.nodeType;

        if (nodeType === 'Domain') {
            this._servicesEditor.startEditDomain(catalogEntry.domain);
        } else if (nodeType === 'Application') {
            this._servicesEditor.startEditApplication(catalogEntry.domain, catalogEntry.application);
        } else if (nodeType === 'Service') {
            this._servicesEditor.startEditService(catalogEntry.domain,
                catalogEntry.application,
                catalogEntry.service,
                catalogEntry.channel);
        } else if (nodeType === 'Operation') {
            this._servicesEditor.startEditOperation(catalogEntry.domain,
                catalogEntry.application,
                catalogEntry.service,
                catalogEntry.channel,
                catalogEntry.operation);
        }
        this.updateCommands(nodeType);
    }

    private updateCommands(nodeType: string) {
        const deleteEnabled = true;
        const addDomainEnabled = true;
        let addApplicationEnabled = false;
        let addServiceEnabled = false;
        let addOperationEnabled = false;

        let deleteButtonCaption = '';
        if (nodeType === 'Domain') {
            deleteButtonCaption = 'Delete selected Domain';
            addApplicationEnabled = true;
        } else if (nodeType === 'Application') {
            deleteButtonCaption = 'Delete selected Application';
            addServiceEnabled = true;
        } else if (nodeType === 'Service') {
            deleteButtonCaption = 'Delete selected Service';
            addOperationEnabled = true;
        } else if (nodeType === 'Operation') {
            deleteButtonCaption = 'Delete selected Operation';
            addOperationEnabled = true;
        }

        // update menu items
        this._deleteMenuItem.label = deleteButtonCaption;
        this._deleteMenuItem.disabled = !deleteEnabled;
        this._addDomainMenuItem.disabled = !addDomainEnabled;
        this._addApplicationMenuItem.disabled = !addApplicationEnabled;
        this._addServiceMenuItem.disabled = !addServiceEnabled;
        this._addOperationMenuItem.disabled = !addOperationEnabled;

    }

    public onFilterChange(event: any) {
        // TODO!!
    }

    public onChangesSaved(event: ServiceCatalogEditorChangesEvent) {
        this.logger.debug(LOG_TAG, 'onChangesSaved: ', event);
        this.handleChanges(event);
    }

    private handleChanges(event: ServiceCatalogEditorChangesEvent) {
        this.logger.debug(LOG_TAG, 'handleChanges: ', event);
        const description = event.model.items[0].value;
        let treeNode: TreeNode;
        if (event.context.editingType === EditingType.Domain) {
            treeNode = this._serviceCatalog.tableModel.getDomainNode(event.context.domainName);
        } else if (event.context.editingType === EditingType.Application) {
            treeNode = this._serviceCatalog.tableModel.getApplicationNode(event.context.domainName, event.context.applicationName);
        } else if (event.context.editingType === EditingType.Operation) {
            treeNode = this._serviceCatalog.tableModel.getOperationNode(
                event.context.channel,
                event.context.domainName,
                event.context.applicationName,
                event.context.serviceName,
                event.context.operationName);
        }
        if (treeNode) {
            treeNode.data.description = description;
        }
    }


   private onAddDomainClick(): void {
    this.logger.debug(LOG_TAG, 'onAddDomainClick');
    this._newItemDialog.show(EditingType.Domain);
   }

   private onAddApplicationClick(): void {
    this.logger.debug(LOG_TAG, 'onAddApplicationClick');
    this._newItemDialog.show(EditingType.Application);
   }

   private onAddServiceClick(): void {
    this.logger.debug(LOG_TAG, 'onAddServiceClick');
    this._newItemDialog.show(EditingType.Service);
   }

    private onAddOperationClick(): void {
        this.logger.debug(LOG_TAG, 'onAddOperationClick');
        this._newOperationDialog.show(EditingType.Operation,
            this.currentSelectedChannel,
            this.currentSelectedDomain,
            this.currentSelectedApplication,
            this.currentSelectedService);
    }

    private onDeleteSelectedNode(): void {
        console.log('OnDeleteSelected node: ', this.selectedNode.data);
        this.handleDeleteRequest(this.selectedNode.data.catalogEntry);
    }

    private handleDeleteRequest(catalogEntry: CatalogEntry): void {
        if (catalogEntry.operation) {
            this.handleDeleteOperation(catalogEntry);
        } else if (catalogEntry.service) {
                this.handleDeleteService(catalogEntry);
        } else if (catalogEntry.application) {
                this.handleDeleteApplication(catalogEntry);
        } else if (catalogEntry.domain) {
                this.handleDeleteDomain(catalogEntry);
        } else {
            this.logger.warn(LOG_TAG, 'Unable to handle delete for: ', catalogEntry);
        }
    }

    private handleDeleteOperation(catalogEntry: CatalogEntry): void {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete the operation ' + catalogEntry.operation + ' ?',
            accept: () => {
                this._subHandler.add(this.serviceCatalogService.deleteOperation(catalogEntry.channel,
                    catalogEntry.domain, catalogEntry.application, catalogEntry.service, catalogEntry.operation).subscribe((data) => {

                        this.logger.debug(LOG_TAG, 'Operation deleted: ', data);

                        this._serviceCatalog.tableModel.removeOperationNode(catalogEntry.channel,
                            catalogEntry.domain,
                            catalogEntry.application,
                            catalogEntry.service,
                            catalogEntry.operation);

                        this.notificationCenter.post({
                            name: 'DeleteOperation',
                            title: 'Delete Operation',
                            message: 'Operation deleted successfully.',
                            type: NotificationType.Success
                        });

                    }, (error) => {

                        this.logger.error(LOG_TAG , 'Delete operation error: ', error);

                        this.notificationCenter.post({
                            name: 'DeleteOperationError',
                            title: 'Delete Operation',
                            message: 'Error deleting the operation:',
                            type: NotificationType.Error,
                            error: error,
                            closable: true
                        });

                    }));
            }
        });
    }

    private handleDeleteService(catalogEntry: CatalogEntry): void {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete the service ' + catalogEntry.service + ' ?',
            accept: () => {
                this._subHandler.add(this.serviceCatalogService.deleteService(catalogEntry.channel,
                    catalogEntry.domain, catalogEntry.application, catalogEntry.service).subscribe((data) => {

                        this.logger.debug(LOG_TAG, 'Service deleted: ', data);

                        this._serviceCatalog.tableModel.removeServiceNode(catalogEntry.channel,
                             catalogEntry.domain,
                             catalogEntry.application,
                             catalogEntry.service);

                        this.notificationCenter.post({
                            name: 'DeleteService',
                            title: 'Delete Service',
                            message: 'Service deleted successfully.',
                            type: NotificationType.Success
                        });

                    }, (error) => {

                        this.logger.error(LOG_TAG , 'Delete service error: ', error);

                        this.notificationCenter.post({
                            name: 'DeleteServiceError',
                            title: 'Delete Service',
                            message: 'Error deleting the service:',
                            type: NotificationType.Error,
                            error: error,
                            closable: true
                        });

                    }));
            }
        });
    }

    private handleDeleteApplication(catalogEntry: CatalogEntry): void {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete the application ' + catalogEntry.application + ' ?',
            accept: () => {
                this._subHandler.add(this.serviceCatalogService.deleteApplication(
                    catalogEntry.domain, catalogEntry.application).subscribe((data) => {

                        this.logger.debug(LOG_TAG, 'Application deleted: ', data);

                        this._serviceCatalog.tableModel.removeApplicationNode(catalogEntry.domain, catalogEntry.application);

                        this.notificationCenter.post({
                            name: 'DeleteApplication',
                            title: 'Delete Application',
                            message: 'Application deleted successfully.',
                            type: NotificationType.Success
                        });

                    }, (error) => {

                        this.logger.error(LOG_TAG , 'Delete application error: ', error);

                        this.notificationCenter.post({
                            name: 'DeleteApplicationError',
                            title: 'Delete Application',
                            message: 'Error deleting the application:',
                            type: NotificationType.Error,
                            error: error,
                            closable: true
                        });

                    }));
            }
        });
     }

    private handleDeleteDomain(catalogEntry: CatalogEntry): void {
        this.confirmationService.confirm({
            message: 'Are you sure that you want to delete the domain ' + catalogEntry.domain + ' ?',
            accept: () => {
                this._subHandler.add(this.serviceCatalogService.deleteDomain(catalogEntry.domain).subscribe((data) => {

                        this.logger.debug(LOG_TAG, 'Domain deleted: ', data);

                        this._serviceCatalog.tableModel.removeDomainNode(catalogEntry.domain);

                        this.notificationCenter.post({
                            name: 'DeleteDomain',
                            title: 'Delete Domain',
                            message: 'Domain deleted successfully.',
                            type: NotificationType.Success
                        });

                    }, (error) => {

                        this.logger.error(LOG_TAG , 'Delete domain error: ', error);

                        this.notificationCenter.post({
                            name: 'DeleteDomainError',
                            title: 'Delete Domain',
                            message: 'Error deleting the domain:',
                            type: NotificationType.Error,
                            error: error,
                            closable: true
                        });

                    }));
            }
        });
   }


    get selectedNode(): TreeNode {
        return this._serviceCatalog.selectedNode;
    }

    onNewItemConfirm(event: DialogResult): void {
        if (event.editType === EditingType.Domain) {
            this.createNewDomain(event.name);
        } else if (event.editType === EditingType.Application) {
            this.createNewApplication(this.currentSelectedDomain, event.name);
        } else if (event.editType === EditingType.Service) {
            this.createNewService(this.currentSelectedDomain,
                this.currentSelectedApplication,
                event.name, event.channel);
        } else {
            this.logger.warn(LOG_TAG, 'onNewItemConfirm unknown for: ', event);
            alert('Unknown event type: ' + event.editType);
        }
    }

    onNewServiceOperationConfirm(event: NewOperationDialogResult): void {
        this.logger.debug(LOG_TAG, 'createNewOperation called for: ', event);
        this._subHandler.add(this.serviceCatalogService.createNewOperation(event.channel,
            event.domain,
            event.application,
            event.service,
            event.name,
            event.description,
            event.pluginName,
            event.encrypted,
            event.secure,
            event.counted,
            event.sessionless,
            (event.inputParams ? btoa(event.inputParams) : null),
            (event.outputParams ? btoa(event.outputParams) : null)).subscribe((operation: ServiceOperation) => {

                this.logger.debug(LOG_TAG, 'New Operation added: ', operation);

                this._serviceCatalog.tableModel.addOperationNode(event.channel, event.domain, event.application, event.service, operation);

                this.notificationCenter.post({
                    name: 'CreateNewOperation',
                    title: 'Create New Operation',
                    message: 'New Operation created successfully.',
                    type: NotificationType.Success
                });

        }, (error) => {

            this.logger.error(LOG_TAG , 'New operation error: ', error);

            this.notificationCenter.post({
                name: 'CreateNewOperationError',
                title: 'Create New Operation',
                message: 'Error creating the new operation:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    private createNewDomain(domainName: string): void {
        this.logger.debug(LOG_TAG, 'createNewDomain called for: ', domainName);

        this._subHandler.add(this.serviceCatalogService.createNewDomain(domainName).subscribe((newDomain: Domain) => {

            this.logger.debug(LOG_TAG, 'New domain added: ', newDomain);

            this._serviceCatalog.tableModel.addDomainNode(newDomain);

            this.notificationCenter.post({
                name: 'CreateNewDomain',
                title: 'Create New Domain',
                message: 'New Domain created successfully.',
                type: NotificationType.Success
            });

        }, (error) => {

            this.logger.error(LOG_TAG , 'New domain error: ', error);

            this.notificationCenter.post({
                name: 'CreateNewDomainError',
                title: 'Create New Domain',
                message: 'Error creating the new domain:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    private createNewApplication(domainName: string, applicationName: string): void {

        this.logger.debug(LOG_TAG, 'createNewApplication called for: ', domainName, applicationName);

        this._subHandler.add(this.serviceCatalogService.createNewApplication(
            domainName, applicationName).subscribe((newApplication: Application) => {

            this.logger.debug(LOG_TAG, 'New application added: ', newApplication);

            this._serviceCatalog.tableModel.addApplicationNode(domainName, newApplication);

            this.notificationCenter.post({
                name: 'CreateNewApplication',
                title: 'Create New Application',
                message: 'New Application created successfully.',
                type: NotificationType.Success
            });

        }, (error) => {

            this.logger.error(LOG_TAG , 'New application error: ', error);

            this.notificationCenter.post({
                name: 'CreateNewApplicationError',
                title: 'Create New Application',
                message: 'Error creating the new application:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    private createNewService(domain: string,
        application: string,
        serviceName: string,
        channel: string): void {

        this.logger.debug(LOG_TAG, 'createNewService called for: ', domain, application, serviceName, channel);

        this._subHandler.add(this.serviceCatalogService.createNewService(
            domain, application, serviceName, channel).subscribe((newService: Service) => {

            this.logger.debug(LOG_TAG, 'New service added: ', newService);

            this._serviceCatalog.tableModel.addServiceNode(domain, application, newService);

            this.notificationCenter.post({
                name: 'CreateNewService',
                title: 'Create New Service',
                message: 'New Service created successfully.',
                type: NotificationType.Success
            });

        }, (error) => {

            this.logger.error(LOG_TAG , 'New application error: ', error);

            this.notificationCenter.post({
                name: 'CreateNewServiceError',
                title: 'Create New Service',
                message: 'Error creating the new service:',
                type: NotificationType.Error,
                error: error,
                closable: true
            });

        }));
    }

    public get currentSelectedDomain(): string {
        return this.selectedNode.data.catalogEntry.domain;
    }

    public get currentSelectedApplication(): string {
        return this.selectedNode.data.catalogEntry.application;
    }

    public get currentSelectedService(): string {
        return this.selectedNode.data.catalogEntry.service;
    }

    public get currentSelectedChannel(): string {
        return this.selectedNode.data.catalogEntry.channel;
    }


}
