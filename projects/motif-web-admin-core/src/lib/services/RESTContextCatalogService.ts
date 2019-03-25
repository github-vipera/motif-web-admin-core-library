import { Injectable } from '@angular/core';
import { DomainsService,
         Domain, DomainCreate,
         ApplicationsService,
         Application,
         ApplicationCreate,
          } from '@wa-motif-open-api/platform-service';
import { ServicesService,
    Service,
    ServiceCreate,
    OperationsService,
    ServiceOperation } from '@wa-motif-open-api/catalog-service';
import { ApplicationsService as AppService } from '@wa-motif-open-api/catalog-service';

import { Observable } from 'rxjs';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[RESTContextCatalogService]';


@Injectable()
export class RESTContextCatalogService {

    private domainsList: Array<Domain>;

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
    public getRESTContextCatalog(): Observable<any> {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'getRESTContextCatalog called' );

            const restContextCatalog = [];
            
            // Get all domains
            this.domainService.getDomains().subscribe(( domains: Array<Domain> ) => {
                const domainsCount = domains.length;
                let processedDomains = 0;
                for (const domain of domains) {

                    this.applicationService.getApplications(domain.name).subscribe(( applications: Array<Application> ) => {

                        const appCount = applications.length;
                        let processedApps = 0;

                        if (appCount === 0) {
                            processedDomains++;
                        }

                        for (const application of applications ) {
                            const applicationInfo: any = application;

                            /*
                            this.appService.getServiceList(domain.name, application.name).subscribe( ( services: Array<Service> ) => {
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
                            */
                        }


                    }, ( error ) => {
                        this.logger.error(LOG_TAG, 'getRESTContextCatalog error:' , error);
                        observer.error(error);
                    });

                    if ( processedDomains === domainsCount) {
                        observer.next( restContextCatalog );
                        observer.complete();
                        this.logger.debug(LOG_TAG, 'getRESTContextCatalog completed' );
                    }
                }

            }, (error) => {
                this.logger.error(LOG_TAG, 'getRESTContextCatalog error:' , error);
                observer.error(error);
            });


        });
    }

}
