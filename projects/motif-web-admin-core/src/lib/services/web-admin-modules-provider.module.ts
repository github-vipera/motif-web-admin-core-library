import {NgModule} from '@angular/core'
import { WebConsoleCoreModule } from 'web-console-core'
import { WebConsoleLoginModule } from 'web-console-login'

@NgModule({
    imports:[ WebConsoleCoreModule.withConfig({loginRoute:"login",dashboardRoute:"dashboard"}), WebConsoleLoginModule ],
    exports:[ WebConsoleCoreModule, WebConsoleLoginModule ]
})
export class WebAdminModulesProvider {
    
}