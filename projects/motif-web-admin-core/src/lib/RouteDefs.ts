import { Routes } from '@angular/router'

import { WebContentSectionComponent } from './sections/WebContent/components/webcontent-section-component';
import { UtilitiesSectionComponent } from './sections/Utilities/components/utilities-section-component';
import { SessionsSectionComponent } from './sections/Sessions/components/sessions-section-component';
import { ServicesSectionComponent } from './sections/Services/components/services-section-component';
import { SchedulerSectionComponent } from './sections/Scheduler/components/scheduler-section.component';
import { RESTManagerSectionComponent } from './sections/RESTManager/components/rest-manager-section-component';
import { PluginsSectionComponent } from './sections/Plugins/components/plugins-section-component';
import { OAuth2SectionComponent } from './sections/OAuth2/components/oauth2-section.component';
import { MainDashboardSectionComponent } from './sections/MainDashboard/components/main-dashboard-section-component';
import { LogSectionComponent } from './sections/Log/components/log-section-component';
import { LicenseManagerSectionComponent } from './sections/LicenseManagement/components/license-manager-section-component';
import { CountersAndThresholdsSectionComponent } from './sections/CountersAndThresholds/components/counters-and-thresholds-section-component';
import { ConfigurationSectionComponent } from './sections/Configuration/components/configuration-section-component';
import { ApplicationContentSectionModule } from './sections/ApplicationContent/ApplicationContentSectionModule';
import { AccessControlSectionComponent } from './sections/AccessControl/components/access-control-section.component';

export const moduleRoutes: Routes = [
    {component:MainDashboardSectionComponent, path:'Main Dashboard'},
    {component:WebContentSectionComponent, path:'Web Content'},
    {component:UtilitiesSectionComponent, path:'Utilities'},
    {component:SessionsSectionComponent, path:'Sessions'},
    {component:ServicesSectionComponent, path:'Services'},
    {component:SchedulerSectionComponent, path:'Scheduler'},
    {component:RESTManagerSectionComponent, path:'REST Manager'},
    {component:PluginsSectionComponent, path:'Plugins'},
    {component:OAuth2SectionComponent, path:'OAuth2'},
    {component:LicenseManagerSectionComponent, path:'License Manager'},
    {component:CountersAndThresholdsSectionComponent, path:'Counters and Thresholds'},
    {component:ConfigurationSectionComponent, path:'Configuration'},
    {component:ApplicationContentSectionModule, path:'Application Content'},
    {component:AccessControlSectionComponent, path:'Access Control'},
    {component:LogSectionComponent, path:'Log'}
];

export enum WebAdminModules {
    MainDashboard = "Main Dashboard",
    WebContent = "Web Content",
    Utilities = "Utilities",
    Sessions = "Sessions",
    Services = "Services",
    Scheduler = "Scheduler",
    RESTManager = "REST Manager",
    Plugins = "Plugins",
    OAuth2 = "OAuth2",
    LicenseManager = "License Manager",
    CountersAndThresholds = "Counters and Thresholds",
    Configuration = "Configuration",
    ApplicationContent = "Application Content",
    AccessControl = "Access Control",
    Log = "Log"
}

export function resolveModuleRoute(requiredPlugins?:Array<WebAdminModules>):Routes {
    if (!requiredPlugins){
        //Return All
        return moduleRoutes;
    } else {
        //TODO!! Filter
        return moduleRoutes;
    }
}