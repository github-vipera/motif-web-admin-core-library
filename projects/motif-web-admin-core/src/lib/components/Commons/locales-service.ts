import { Injectable } from '@angular/core';
import * as _ from 'lodash'

export interface Locale {
    code: string;
    name: string;
}

@Injectable()
export class LocalesService {

    private _mapping: Locale[] = [
        { code: 'it', name: 'Italiano' },
        { code: 'ar', name: 'العربية' },
        { code: 'en', name: 'English' },
        { code: 'de', name: 'Deutsch' },
        { code: 'es', name: 'Español' },
        { code: 'fr', name: 'Français' }
    ];

    constructor() {
    }

    public mapCode(locale: string): string {
        return this.getLocaleByCode(locale).name;
    }

    public mapName(localeName: string): string {
        return this.getLocaleByName(localeName).code;
    }

    public allLocales(): Locale[] {
        return this._mapping;
    }

    public getLocaleByCode(locale: string): Locale {
        return _.find(this._mapping, function(o) { return o.code === locale; });
    }

    public getLocaleByName(localeName: string): Locale {
        return _.find(this._mapping, function(o) { return o.name === localeName; });
    }

}
