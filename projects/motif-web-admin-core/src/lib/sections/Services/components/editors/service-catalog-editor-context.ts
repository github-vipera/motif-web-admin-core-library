import { WCPropertyEditorModel } from 'web-console-ui-kit';

export enum EditingType {
    None,
    Domain,
    Application,
    Service,
    Operation
}

export interface EditorContext {
    domainName: string;
    applicationName?: string;
    serviceName?: string;
    operationName?: string;
    channel?: string;
    userdata?: any;
    editingType: EditingType;
}

export interface ServiceCatalogEditorChangesEvent {
    context: EditorContext;
    model: WCPropertyEditorModel;
}
