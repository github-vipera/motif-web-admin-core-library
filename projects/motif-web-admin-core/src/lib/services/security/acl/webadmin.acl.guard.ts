// import { AclEntityEditorChangesEvent } from './../../../sections/AccessControl/components/editors/acl-editor-context';

// import { Injectable } from '@angular/core';
// import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
// import { Observable } from 'rxjs';
// import { NGXLogger, AbstractPluginValidator, PluginRegistrationEntry, WebConsolePluginManagerService } from 'web-console-core';
// import { MotifACLService } from 'web-console-motif-acl ';
//                                  //web-console-motif-acl 

// const LOG_TAG = "[WebAdminACLGuard]"

// @Injectable({
//   providedIn: 'root'
// })
// export class WebAdminACLGuard extends AbstractPluginValidator implements CanActivate, CanActivateChild {

//   constructor(private logger: NGXLogger,
//     private pluginManager: WebConsolePluginManagerService, 
//     private aclService: MotifACLService) {
//     super();
//     this.logger.debug(LOG_TAG, "constructor ", this.aclService);
//     this.pluginManager.registerPluginValidator(this);
//   }

//   canActivate(
//     next: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
//     this.logger.debug(LOG_TAG, "canActivate called for: ", next, state);
//     let componentName = next.component["name"];
//     this.logger.debug(LOG_TAG, "canActivate componentName: ", componentName);
//     let pluginRegistrationEntry: PluginRegistrationEntry = this.pluginManager.getPluginByComponentName(componentName);
//     this.logger.debug(LOG_TAG, "canActivate plugin entry: ", pluginRegistrationEntry);
//     return this.checkPermissions(pluginRegistrationEntry);
//   }

//   canActivateChild(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
//     let componentName = route.component["name"];
//     this.logger.debug(LOG_TAG, "canActivateChild componentName: ", componentName);
//     let pluginRegistrationEntry: PluginRegistrationEntry = this.pluginManager.getPluginByComponentName(componentName);
//     this.logger.debug(LOG_TAG, "canActivateChild plugin entry: ", pluginRegistrationEntry);
//     return this.checkPermissions(pluginRegistrationEntry);
//   }

//   /**
//    * Called by WebConsolePluginManagerService for display/hide button in toolbar
//    */
//   validatePluginEntry(entry: PluginRegistrationEntry): Observable<boolean> {
//     console.log(LOG_TAG, "validatePluginEntry called for:", entry);
//     return this.checkPermissions(entry);
//   }

//   private checkPermissions(entry: PluginRegistrationEntry):Observable<boolean> {
//     if (entry && entry.userData && entry.userData["acl"]) {
//       let permissions = entry.userData["acl"]["permissions"];
//       if (permissions) {
//         return this.aclService.can(permissions); 
//       } else {
//         console.log(LOG_TAG, "Invalid plugin ACL specification. Permissions not found:", entry, entry.userData["acl"]);
//         return new Observable((observer)=>{
//           observer.next(false);
//           observer.complete();
//         });
//       }
//     } else {
//       return new Observable((observer)=>{
//         observer.next(true);
//         observer.complete();
//       });
// ;
//     }
//   }


// }


