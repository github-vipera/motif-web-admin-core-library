import { Subscription } from 'rxjs';

export class WCSubscriptionHandler {
    private _subscriptions: Subscription[] = [];

    constructor() {}

    public add(subscription: Subscription): void {
        this._subscriptions.push(subscription);
    }

    public unsubscribe(): void {
        for (let i = 0 ; i < this._subscriptions.length; i++) {
            this._subscriptions[i].unsubscribe();
        }
        this._subscriptions = [];
    }
}

