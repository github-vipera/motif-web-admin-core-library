import { ComboBoxComponent } from '@progress/kendo-angular-dropdowns';
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, forwardRef, ViewChild } from '@angular/core';
import { NGXLogger} from 'web-console-core'
import { WCNotificationCenter, NotificationType } from 'web-console-ui-kit'
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { UsersService, User } from '@wa-motif-open-api/platform-service';
import { WCSubscriptionHandler } from '../../Commons/wc-subscription-handler';

const LOG_TAG = '[UsersSelectorComboBoxComponent]';

export const WC_USERS_SELECTOR_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UsersSelectorComboBoxComponent),
    multi: true
};

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'wc-user-selector-combobox',
    styles: [
    ],
    template: `
    <kendo-combobox #combo style="width:100%;" [data]="data" [filterable]="true" (filterChange)="handleFilter($event)" [popupSettings]="{ 'popupClass' : 'wa-kui-combobox-popup', 'animate' : false  }"
    [allowCustom]="false" [valueField]="'userId'" [textField]="'userId'"
    [(ngModel)]="selectedUser" [attr.disabled]="disabled?true:null"></kendo-combobox>
    `,
    providers: [WC_USERS_SELECTOR_CONTROL_VALUE_ACCESSOR]
})
export class UsersSelectorComboBoxComponent implements OnInit, OnDestroy {

    public data: Array<User> = [];
    public usersList: Array<User> = [];
    public _selectedUser: User;
    private _domain: string = null;
    @Output() userSelected: EventEmitter<User> = new EventEmitter();
    @Output() selectionCancelled: EventEmitter<any> = new EventEmitter();
    private _subHandler: WCSubscriptionHandler = new WCSubscriptionHandler();
    @ViewChild('combo') combo: ComboBoxComponent;
    @Input() public disabled: boolean;
    
    constructor(private logger: NGXLogger,
        private usersService: UsersService,
        private notificationCenter: WCNotificationCenter) {
            this.logger.debug(LOG_TAG, 'Creating...');
    }

        /**
     * Angular ngOnInit
     */
    ngOnInit() {
        this.logger.debug(LOG_TAG , 'Initializing...');
        this.refreshUsersList();
    }

    ngOnDestroy() {
        this.logger.debug(LOG_TAG , 'ngOnDestroy ');
        this.freeMem();
    }

    freeMem() {
        this.data = null;
        this.usersList = null;
        this._selectedUser = null;
        this._domain = null;
        this.userSelected = null;
        this.selectionCancelled = null;
        this._subHandler.unsubscribe();
        this._subHandler = null;
    }

    /**
     * Get the list of the available Domains
     */
    public refreshUsersList(): void {
        this.logger.debug(LOG_TAG, 'refreshUsersList domain=', this._domain);
        if (this._domain) {
            this._subHandler.add(this.usersService.getUsersList(this._domain).subscribe( (data: Array<User>) => {
                this.usersList = data;
                this.data = this.usersList;
                }, error => {
                    this.logger.debug(LOG_TAG , 'refreshUsersList error:', error);
                    this.notificationCenter.post({
                        name: 'RefreshUsersListError',
                        title: 'Load Users',
                        message: 'Error loading users:',
                        type: NotificationType.Error,
                        error: error,
                        closable: true
                    });
                }));
        } else {
            this.usersList = [];
        }
        this._selectedUser = null;
        this.propagateChange(null);
    }

    @Input() set domain(domain: string) {
        this._domain = domain;
        this.refreshUsersList();
    }

    get domain(): string {
        return this._domain;
    }


    /**
     * Set the selcted application
     */
    @Input('user')
    public set selectedUser(user: User) {
        this._selectedUser = user;
        if (this._selectedUser) {
            this.logger.debug(LOG_TAG, 'selectedUser user=', this._selectedUser);
            this.userSelected.emit(this._selectedUser);
            this.propagateChange(user);
        } else {
            this.logger.debug(LOG_TAG, 'selectedDomain domain=no selection');
            this.selectionCancelled.emit();
            this.propagateChange(null);
        }
    }

    public get selectedUser(): User {
        return this._selectedUser;
    }


    propagateChange: any = () => {};

    writeValue(value: any) {
        if ( value ) {
         this._selectedUser = value;
        }
    }

    registerOnChange(fn) {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: () => void): void { }

    handleFilter(value) {
        if (value.length >= 3) {
            this.data = this.usersList.filter((s) => s.userId.toLowerCase().indexOf(value.toLowerCase()) !== -1);
        } else {
            if (value.length===0){
                this.data = this.usersList;
            }
            this.combo.toggle(false);
        }
    }
}
