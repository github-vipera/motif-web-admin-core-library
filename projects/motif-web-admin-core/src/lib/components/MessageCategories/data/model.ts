import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';
import { LocalesService } from '../../Commons/locales-service';

/*
export interface Message {
    message: string;
    locale: string;
    localeName: string;
}

export interface Locale {
    code: string;
    name: string;
}
*/

/*
export class LocaleMapping {

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

    public findByCode(locale: string): string {
        return _.find(this._mapping, function(o) { return o.code === locale; }).name;
    }

    public findByName(localeName: string): string {
        return _.find(this._mapping, function(o) { return o.name === localeName; }).code;
    }

}
*/

/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({name: 'localeName'})
export class LocaleNamePipe implements PipeTransform {

    constructor(private localesMappingService: LocalesService) {
    }

    transform(value: string): string {
        return this.localesMappingService.mapCode(value);
    }

}
