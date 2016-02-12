﻿import Crumb = require('./Crumb');
import IRouter = require('./IRouter');
import State = require('./State');

interface IStateHandler {
    getNavigationLink(router: IRouter, state: State, data: any, arrayData: { [index: string]: string[] }): string;
    navigateLink(oldState: State, state: State, url: string): void;
    getNavigationData(router: IRouter, state: State, url: string): { data: any, separableData: any };
    urlEncode(state: State, key: string, val: string, queryString: boolean): string;
    urlDecode(state: State, key: string, val: string, queryString: boolean): string;
    truncateCrumbTrail(state: State, crumbs: Crumb[]): Crumb[];
}
export = IStateHandler;