import { CatalogEntry } from './model';
import { Service, ServiceOperation } from '@wa-motif-open-api/catalog-service';
import { Application, Domain } from '@wa-motif-open-api/platform-service';
import { TreeNode } from 'primeng/api';
import * as _uuidv1 from 'uuid/v1';

const uuidv1 = _uuidv1;

export interface DataFilter {
  channel: string
}

export interface CatalogEntry {
  domain: string;
  application?: string;
  service?: string;
  operation?: string;
  channel?: string;
}

export class ServiceCatalogTableModel {
  private _model: TreeNode[] = [];
  private _filter : DataFilter;

  constructor() {}

  public loadData(serviceCatalog: any, filter?: DataFilter) {
    this._filter = filter;
    this.rebuildModel(serviceCatalog);
  }

  public get filter(): DataFilter {
    return this._filter;
  }

  public close() {
    this._model = null;
  }

  private buildNode(
    name: string,
    description: string,
    nodeType?: string,
    channel?: string,
    leaf?: boolean,
    domainName?: string,
    applicationName?: string,
    serviceName?: string,
    operationName?: string
  ): TreeNode {
    // Set the icon name
    let iconName = 'pi-globe';
    if (nodeType === 'Application') {
      iconName = 'pi-mobile';
    } else if (nodeType === 'Service') {
      iconName = 'pi-sitemap';
    } else if (nodeType === 'Operation') {
      iconName = 'pi-chevron-circle-right';
    }

    return {
      data: {
        name: name,
        description: description,
        nodeType: nodeType,
        channel: channel,
        leaf: leaf,
        icon: 'pi-bell',
        selectable: true,
        nodeIcon: iconName,
        nodeIconStyle: 'color:blue;',
        id: uuidv1(),
        catalogEntry: {
          domain: domainName ? domainName : null,
          application: applicationName ? applicationName : null,
          service: serviceName ? serviceName : null,
          operation: operationName ? operationName : null,
          channel: channel
        }
      },
      expanded: true,
      children: []
    };
  }

  private rebuildModel(serviceCatalog: any): void {
    const tempModel = [];

    serviceCatalog.forEach(domain => {
      const domainNode = this.buildNode(
        domain.name,
        domain.description,
        'Domain',
        null,
        false,
        domain.name,
        null
      );

      if (domain.applications) {
        for (let i = 0; i < domain.applications.length; i++) {
          const application = domain.applications[i];
          const applicationNode = this.buildNode(
            application.name,
            application.description,
            'Application',
            null,
            false,
            domain.name,
            application.name
          );

          if (application.services) {
            for (let y = 0; y < application.services.length; y++) {
              const service = application.services[y];
              if (!this._filter || (!this._filter.channel) || (this._filter && (this._filter.channel === service.channel))) {
                const serviceNode = this.buildNode(
                  service.name,
                  service.description,
                  'Service',
                  service.channel,
                  false,
                  domain.name,
                  application.name,
                  service.name
                );

                if (service.serviceOperationList) {
                  for (let z = 0; z < service.serviceOperationList.length; z++) {
                    const operation = service.serviceOperationList[z];
                    const operationNode = this.buildNode(
                      operation.name,
                      operation.description,
                      'Operation',
                      service.channel,
                      true,
                      domain.name,
                      application.name,
                      service.name,
                      operation.name
                    );

                    serviceNode.children.push(operationNode);
                  }
                }

                applicationNode.children.push(serviceNode);
              }
            }
          }

          domainNode.children.push(applicationNode);
        }
      }
      tempModel.push(domainNode);
    });

    this._model = tempModel;
  }

  public get model(): TreeNode[] {
    return this._model;
  }

  public getDomainNode(domainName: string): TreeNode {
    const domainNodes = this.getDomainNodes();
    return this.getChildNodeByName(domainNodes, domainName);
  }

  public getApplicationNode(
    domainName: string,
    applicationName: string
  ): TreeNode {
    const applicationNodes = this.getDomainNode(domainName).children;
    return this.getChildNodeByName(applicationNodes, applicationName);
  }

  public getServiceNode(
    channel: string,
    domainName: string,
    applicationName: string,
    serviceName: string
  ): TreeNode {
    const servicesNodes = this.getApplicationNode(domainName, applicationName)
      .children;
    return this.getChildNodeByName(servicesNodes, serviceName, channel);
  }

  public getOperationNode(
    channel: string,
    domainName: string,
    applicationName: string,
    serviceName: string,
    operationName: string
  ): TreeNode {
    const operationsNodes = this.getServiceNode(
      channel,
      domainName,
      applicationName,
      serviceName
    ).children;
    return this.getChildNodeByName(operationsNodes, operationName);
  }

  private getChildNodeByName(
    nodes: TreeNode[],
    childNodeName: string,
    channel?: string
  ): TreeNode {
    for (let i = 0; i < nodes.length; i++) {
      const treeNode: TreeNode = nodes[i];
      if (treeNode.data.name === childNodeName) {
        if (channel) {
          if (treeNode.data.channel === channel) {
            return treeNode;
          }
        } else {
          return treeNode;
        }
      }
    }
    return null;
  }

  public removeDomainNode(domainName: string): void {
    const nodeIndex = this.getDomainNodeIndex(domainName);
    if ( nodeIndex >= 0 ) {
      this.model.splice(nodeIndex, 1);
      this.refreshModel();
    }
  }

  public removeApplicationNode(domainName: string, applicationName: string): void {
    const domainNode = this.getDomainNode(domainName);
    if ( domainNode ) {
      const nodeIndex = this.getNodeIndex(domainNode.children, applicationName);
      if ( nodeIndex >= 0 ) {
        domainNode.children.splice(nodeIndex, 1);
        domainNode.children = [...domainNode.children];
        this.refreshModel();
      }
    }
  }

  public removeServiceNode(channel: string, domainName: string, applicationName: string, serviceName: string): void {
    const applicationNode = this.getApplicationNode(domainName, applicationName);
    if ( applicationNode ) {
      const nodeIndex = this.getNodeIndex(applicationNode.children, serviceName, channel);
      if ( nodeIndex >= 0 ) {
        applicationNode.children.splice(nodeIndex, 1);
        applicationNode.children = [...applicationNode.children];
        this.refreshModel();
      }
    }
  }

  public removeOperationNode(channel: string,
                             domainName: string,
                             applicationName: string,
                             serviceName: string,
                             operationName: string): void {
    const serviceNode = this.getServiceNode(channel, domainName, applicationName, serviceName);
    if ( serviceNode ) {
      const nodeIndex = this.getNodeIndex(serviceNode.children, operationName);
      if ( nodeIndex >= 0 ) {
        serviceNode.children.splice(nodeIndex, 1);
        serviceNode.children = [...serviceNode.children];
        this.refreshModel();
      }
    }
  }

  public getDomainNodes(): TreeNode[] {
   return this._model;
  }

  public getApplicationNodes(): TreeNode[] {
    const ret = [];
    const domainNodes = this.getDomainNodes();
    for (let i = 0; i < domainNodes.length; i++) {
      const domainNode = domainNodes[i];
      ret.push(domainNode.children);
    }
    return ret;
  }

  public addDomainNode(domain: Domain): TreeNode {
    const domainNode: TreeNode = this.buildNode(
      domain.name,
      domain.description,
      'Domain',
      null,
      false,
      domain.name,
      null
    );
    // From PrimeNG docs (https://www.primefaces.org/primeng/#/table):
    /**
     * Table may need to be aware of changes in its value in some cases such as reapplying sort.
     * For the sake of performance, this is only done when the reference of the value changes meaning
     * a setter is used instead of ngDoCheck/IterableDiffers which can reduce performance.
     * So when you manipulate the value such as removing or adding an item,
     * instead of using array methods such as push, splice create a new array reference using a spread operator or similar.
     */
    this._model = [...this.model, domainNode];
    return domainNode;
  }

  public addOperationNode(channel: string,
    domainName: string,
    applicationName: string,
    serviceName: string,
    operation: ServiceOperation): TreeNode {
    const operationNode: TreeNode = this.buildNode(
      operation.name,
      operation.description,
      'Operation',
      channel,
      true,
      domainName,
      applicationName,
      serviceName,
      operation.name
    );
    const serviceNode: TreeNode = this.getServiceNode(channel, domainName, applicationName, serviceName);
    if (serviceNode) {
      serviceNode.children = [...serviceNode.children, operationNode];
    }
    this.refreshModel();
    return operationNode;

  }

  public addApplicationNode(domainName: string, application: Application): TreeNode {
    const applicationNode: TreeNode = this.buildNode(
        application.name,
        application.description,
        'Application',
        null,
        false,
        domainName,
        application.name
      );
      const domainNode: TreeNode = this.getDomainNode(domainName);
      if (domainNode) {
        domainNode.children = [...domainNode.children, applicationNode];
      }
      this.refreshModel();
      return applicationNode;
  }

  public addServiceNode(domainName: string, applicationName: string, service: Service): TreeNode {
    const serviceNode: TreeNode = this.buildNode(
        service.name,
        null,
        'Service',
        service.channel,
        false,
        domainName,
        applicationName,
        service.name
      );
      const applicationNode: TreeNode = this.getApplicationNode(domainName, applicationName);
      if (applicationNode) {
        applicationNode.children = [...applicationNode.children, serviceNode];
      }
      this.refreshModel();
      return serviceNode;
  }

  private refreshModel(): void {
    this._model = [...this.model];
  }

  private getDomainNodeIndex(domainName: string): number {
    return this.getNodeIndex(this.getDomainNodes(), domainName);
  }

  private getNodeIndex(nodes: TreeNode[], nodeName: string, channel?: string): number {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].data.name === nodeName ) {
        if (channel) {
          if (nodes[i].data.catalogEntry.channel === channel) {
            return i;
          }
        } else {
          return i;
        }
      }
    }
    return -1;
  }

}
