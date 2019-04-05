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
import { ContextsService as RESTContextService, ServiceContext, RestContextCreate, RestContextUpdate } from '@wa-motif-open-api/rest-content-service';
import { ContextsService } from '@wa-motif-open-api/context-service';

import { Observable } from 'rxjs';
import { NGXLogger } from 'web-console-core';
import { WCSubscriptionHandler } from '../components';

const LOG_TAG = '[RESTContextCatalogService]';


@Injectable()
export class RESTContextCatalogService {

    private domainsList: Array<Domain>;

    constructor(private domainService: DomainsService,
        private applicationService: ApplicationsService,
        private restContextService: RESTContextService,
        private contextService: ContextsService,
        private logger: NGXLogger) {
    }


    public deleteRESTContext(domain:string, application:string, contextName:string) : Observable<any> {
        return this.restContextService.deleteContext(domain, application, contextName);
    }

    public createRESTContext(domain:string, application:string, contextName:string, url:string) : Observable<ServiceContext> {
        this.logger.debug(LOG_TAG, 'createRESTContext called for ', domain, application, contextName, url );
        let createObj: RestContextCreate = {
            context: contextName,
            url: url
        };
        return this.restContextService.createContext(domain, application, createObj);
    }

    public enableRESTContext(domain:string, application:string, contextName:string, enabled: boolean) : Observable<ServiceContext> {
        this.logger.debug(LOG_TAG, 'enableRESTContext called for ', domain, application, contextName, enabled );
        if (enabled){
            return this.contextService.enableContext(domain, application, contextName);
        } else {
            return this.contextService.disableContext(domain, application, contextName);
        }
    }

    public updateRESTContext(domain:string, application:string, contextName:string, url:string) : Observable<ServiceContext> {
        this.logger.debug(LOG_TAG, 'updateRESTContext called for ', domain, application, contextName, url );
        let updateObj: RestContextUpdate = {
            url: url
        };
        return this.restContextService.updateContext(domain, application, contextName, updateObj);
    }

    /**
     * Returns a JSON with the Service Catalog Structure
     */
    public getRESTContextCatalog(): Observable<Array<ServiceContext>> {
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

                            this.restContextService.getContexts(domain.name, application.name).subscribe((contexts:Array<ServiceContext>)=>{

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

    public getRESTContextCatalogFor(domain:string, application:string): Observable<Array<ServiceContext>> {
        return this.restContextService.getContexts(domain, application);
    }

}
