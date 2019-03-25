import { Injectable } from '@angular/core';
import { DomainsService,
         Domain,
         ApplicationsService,
         Application,
          } from '@wa-motif-open-api/platform-service';
import { ServicesService,
    Service,
    ServiceCreate,
    OperationsService,
    ServiceOperation } from '@wa-motif-open-api/catalog-service';
import { ContextsService, ServiceContext } from '@wa-motif-open-api/rest-context-service';

import { Observable } from 'rxjs';
import { NGXLogger } from 'web-console-core';

const LOG_TAG = '[RESTContextCatalogService]';


@Injectable()
export class RESTContextCatalogService {

    private domainsList: Array<Domain>;

    constructor(private domainService: DomainsService,
        private applicationService: ApplicationsService,
        private contextService: ContextsService,
        private logger: NGXLogger) {
    }

        /**
     * Returns a JSON with the Service Catalog Structure
     */
    public getRESTContextCatalog(): Observable<any> {
        return new Observable((observer) => {

            this.logger.debug(LOG_TAG, 'getRESTContextCatalog called' );

            var restContextCatalog = [];
            
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
                            if ( processedDomains === domainsCount) {
                                observer.next( restContextCatalog );
                                observer.complete();
                                this.logger.debug(LOG_TAG, 'getRESTContextCatalog completed' );
                            }
                        }

                        for (const application of applications ) {
                            const applicationInfo: any = application;

                            this.contextService.getContexts(domain.name, application.name).subscribe((contexts:Array<ServiceContext>)=>{

                                this.logger.debug(LOG_TAG, 'getRESTContextCatalog contexts[' + application.name + '@' + domain.name + ']:', contexts );
                                restContextCatalog = restContextCatalog.concat(contexts);
                                
                                processedApps++;
                                if (processedApps === appCount) {
                                    processedDomains++;
                                    if ( processedDomains === domainsCount) {
                                        observer.next( restContextCatalog );
                                        observer.complete();
                                        this.logger.debug(LOG_TAG, 'getRESTContextCatalog completed' );
                                    }
                                }

                            }, (error)=>{

                                processedApps++;
                                if (processedApps === appCount) {
                                    processedDomains++;
                                    if ( processedDomains === domainsCount) {
                                        observer.next( restContextCatalog );
                                        observer.complete();
                                        this.logger.debug(LOG_TAG, 'getRESTContextCatalog completed' );
                                    }
                                }
                                this.logger.error(LOG_TAG, 'getRESTContextCatalog error:' , error);
                                observer.error(error);

                            },() => {

                                if ( processedDomains === domainsCount) {
                                    observer.next( restContextCatalog );
                                    observer.complete();
                                    this.logger.debug(LOG_TAG, 'getRESTContextCatalog completed' );
                                }
                            });
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
