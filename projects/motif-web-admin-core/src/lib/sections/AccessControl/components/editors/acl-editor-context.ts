import { WCPropertyEditorModel } from 'web-console-ui-kit';

export enum DialogType {
    Create = 'Create',
    Edit = 'Edit'
}

export enum RowCommandType {
    ChangePassword = 'ChangePassword',
    Relations = 'Relations',
    Edit = 'Edit',
    Delete = 'Delete'
  }
  
export enum EntityType {
    None,
    User,
    Admin,
    Client,
    Group,
    Role,
    Permission
}

export interface AclEntityEditorContext {
    name: string,
    description: string,
    entityType: EntityType;
}

export interface AclEntityEditorChangesEvent {
    context: AclEntityEditorContext;
    model: WCPropertyEditorModel;
}

export interface UserEditorContext {
    domain: string,
    userId: string,
    userIdInt: string,
    state: string,
    entityType: EntityType;
}

export interface UserEditorChangesEvent {
    context: UserEditorContext;
    model: WCPropertyEditorModel;
}
