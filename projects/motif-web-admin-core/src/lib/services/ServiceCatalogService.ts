import { Injectable } from '@angular/core';
import { DomainsService,
         DomainsList,
         Domain, DomainCreate,
         ApplicationsService,
         ApplicationsList,
         Application,
         ApplicationCreate,
          } from '@wa-motif-open-api/platform-service';
import { ServicesService,
    Service,
    ServiceList,
    ServiceCreate,
    OperationsService,
    ServiceOperation } from '@wa-motif-open-api/catalog-service';
import { ApplicationsService as AppService } from '@wa-motif-open-api/catalog-service';

import { Observable } from 'rxjs';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[ServiceCatalogService]';

@Injectable()
export class ServiceCatalogService {

    private domainsList: DomainsList;

    constructor(private domainService: DomainsService,
        private applicationService: ApplicationsService,
        private appService: AppService,
        private servicesService: ServicesService,
        private operationsService: OperationsService,
        private logger: NGXLogger) {
    }

    /**
     * Returns a JSON with the Service Catalog Structure
     */
    public getServiceCatalog(): Observable<any> {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'getServiceCatalog called' );

            const serviceCatalog = [];

            this.domainService.getDomains().subscribe(( domains: DomainsList ) => {
                const domainsCount = domains.length;
                let processedDomains = 0;

                for (const domain of domains) {

                    const domainInfo: any = domain;
                    domainInfo.applications = [];
                    serviceCatalog.push(domainInfo);

                    this.applicationService.getApplications(domain.name).subscribe(( applications: ApplicationsList ) => {

                        const appCount = applications.length;
                        let processedApps = 0;

                        if (appCount === 0) {
                            processedDomains++;
                        }

                        for (const application of applications ) {
                            const applicationInfo: any = application;
                            this.appService.getServiceList(domain.name, application.name).subscribe( ( services: ServiceList ) => {
                                applicationInfo.services = services;
                                // tslint:disable-next-line:max-line-length
                                this.logger.debug(LOG_TAG, 'getServiceCatalog services[' + application.name + '@' + domain.name + ']:', services );
                            }, ( error ) => {
                                this.logger.error(LOG_TAG, 'getServiceCatalog error:' , error);
                                observer.error(error);
                            }, () => {
                                processedApps++;
                                if (processedApps === appCount) {
                                    processedDomains++;
                                }
                                if ( processedDomains === domainsCount) {
                                    observer.next( serviceCatalog );
                                    observer.complete();
                                    this.logger.debug(LOG_TAG, 'getServiceCatalog completed' );
                                }
                            });
                            domainInfo.applications.push(applicationInfo);
                        }

                    }, ( error ) => {
                        this.logger.error(LOG_TAG, 'getServiceCatalog error:' , error);
                        observer.error(error);
                    });

                    if ( processedDomains === domainsCount) {
                        observer.next( serviceCatalog );
                        observer.complete();
                        this.logger.debug(LOG_TAG, 'getServiceCatalog completed' );
                    }

                }
            }, (error) => {
                this.logger.error(LOG_TAG, 'getServiceCatalog error:' , error);
                observer.error(error);
            });
        });
    }

    public getServices(): Observable<any> {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'getServices called' );

            const services: any = [];

            this.getServiceCatalog().subscribe((serviceCatalog) => {

                this.logger.debug(LOG_TAG, 'getServices rawData:', serviceCatalog );

                serviceCatalog.forEach(domain => {

                    if (domain.applications) {
                        for (let i = 0 ; i < domain.applications.length; i++) {
                            const application = domain.applications[i];

                            if (application.services) {
                                for (let y = 0; y < application.services.length; y++) {
                                    const service = application.services[y];

                                    if (service.serviceOperationList) {
                                        for (let z = 0; z < service.serviceOperationList.length; z++) {
                                            const operation = service.serviceOperationList[z];

                                            const serviceEntry: any = {
                                                domain: domain.name,
                                                application: application.name,
                                                service: service.name,
                                                serviceEnabled : service.enabled,
                                                channel: service.channel,
                                                name: operation.name,
                                                description: operation.description,
                                                type: 'Operation'
                                            };
                                            services.push(serviceEntry);
                                        }
                                    }
                                }
                            }

                        }
                    }

                });
                observer.next( services );
                observer.complete();

            }, (error) => {
                this.logger.error(LOG_TAG, 'getServices error:' , error);
                observer.error(error);
            });

        });
    }

    public createNewDomain(domainName: string): Observable<Domain> {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'createNewDomain called for ', domainName);

            const domainCreate: DomainCreate = { name: domainName, description: 'Description of ' + domainName };

            this.domainService.createDomain(domainCreate).subscribe((data: Domain) => {
                observer.next(data);
                observer.complete();
            }, (error) => {
                observer.error(error);
            });
        });
    }

    public createNewApplication(domain: string, applicationName: string): Observable<Application> {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'createNewApplication called for ', domain, applicationName);

            const appCreate: ApplicationCreate = { name: applicationName, description: 'Description of ' + applicationName };

            this.applicationService.createApplication(domain, appCreate).subscribe((data: Application) => {
                observer.next(data);
                observer.complete();
            }, (error) => {
                observer.error(error);
            });
        });
    }

    public createNewService(domain: string, application: string, serviceName: string, channel: string): Observable<Service> {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'createNewService called for ', domain, application, serviceName, channel);

            const serviceCreate: ServiceCreate = {
                name: serviceName
            };

            this.servicesService.createService(channel, domain, application, serviceCreate).subscribe((data: Service) => {
                observer.next(data);
                observer.complete();
            }, (error) => {
                observer.error(error);
            });
        });
    }

    public createNewOperation(channel: string,
        domain: string,
        application: string,
        service: string,
        operationName: string,
        description: string,
        pluginName: string,
        encrypted: boolean,
        secure: boolean,
        counted: boolean,
        sessionless: boolean,
        inputParams: string,
        outputParams: string
        ): Observable<ServiceOperation> {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'createNewOperation called for ', domain, application, service, operationName);
            const serviceOperation: ServiceOperation = {
                counted: counted,
                encryptActive: encrypted,
                inputParams: inputParams,
                outputParams: outputParams,
                pluginName: pluginName,
                secure: secure,
                sessionless: sessionless,
                name: operationName,
                description: description
            };

            this.operationsService.createServiceOperation(channel,
                domain, application, service, serviceOperation). subscribe((data: ServiceOperation) => {
                    observer.next(data);
                    observer.complete();
            }, (error) => {
                observer.error(error);
            });

        });
    }


    public deleteDomain(domainName: string): Observable<any> {
        return new Observable((observer) => {
            this.logger.debug(LOG_TAG, 'deleteDomain called for ', domainName);
            this.domainService.deleteDomain(domainName).subscribe((data: Domain) => {
                observer.next(data);
                observer.complete();
            }, (error) => {
                observer.error(error);
            });
        });
    }

    public deleteApplication(domainName: string, applicationName: string): Observable<any> {
        return new Observable((observer) => {
            this.logger.debug(LOG_TAG, 'deleteApplication called for ', domainName, applicationName);
            this.applicationService.deleteApplication(domainName, applicationName).subscribe((data) => {
                observer.next(data);
                observer.complete();
            }, (error) => {
                observer.error(error);
            });
        });
    }

    public deleteService(channel: string, domainName: string, applicationName: string, serviceName: string): Observable<any> {
        return new Observable((observer) => {
            this.logger.debug(LOG_TAG, 'deleteService called for ', domainName, applicationName, serviceName);
            this.servicesService.deleteService(channel, domainName, applicationName, serviceName).subscribe((data) => {
                observer.next(data);
                observer.complete();
            }, (error) => {
                observer.error(error);
            });
        });
    }

    public deleteOperation(channel: string,
        domainName: string,
        applicationName: string,
        serviceName: string,
        operationName: string): Observable<any> {
        return new Observable((observer) => {
            this.logger.debug(LOG_TAG, 'deleteOperation called for ', domainName, applicationName, serviceName, operationName);
            this.operationsService.deleteServiceOperation(channel,
                domainName, applicationName, serviceName, operationName). subscribe((data) => {
                    observer.next(data);
                    observer.complete();
            }, (error) => {
                observer.error(error);
            });
        });
    }

    /**
     this.domainService.getDomains()
            .pipe(
                switchMap( (domains:DomainsList) => from(domains)),
                flatMap((domain:Domain) => forkJoin(
                    this.applicationService.getApplications(domain.name)
                        .pipe(
                            switchMap( (applications:ApplicationsList) => from(applications)),
                            flatMap( (application:Application) => forkJoin (
                                    this.appService.getServiceList(domain.name, application.name)
                                ).pipe(
                                    map( data => ({ application: application, services: data })),
                                    tap( data => data.application["services"] = data.services[0]),
                                    tap( data => delete data.services),
                                ),
                            ),
                            toArray()
                        ).pipe(map(data => ({ domain: domain, applications: data})))
                    )
                )
             ).subscribe((results)=>{
                this.logger.debug(LOG_TAG, "getServiceCatalog results:" , results);
                serviceCatalog.push(results);
            },(error)=>{
                this.logger.error(LOG_TAG, "getServiceCatalog error:" , error);
            }, ()=>{
                this.logger.debug(LOG_TAG, "getServiceCatalog Completed! ", JSON.stringify(serviceCatalog));
            })
    }
     */





}
