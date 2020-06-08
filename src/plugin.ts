import {TokenStore} from './sdk/token';
import {Evaluator} from './sdk/evaluation';
import {Tracker} from './sdk/tracking';
import {Tab, Logger, EventManager, SessionFacade, UserFacade, CidAssigner} from './sdk';

export interface PluginSdk {
    readonly tracker: Tracker;
    readonly evaluator: Evaluator;
    readonly user: UserFacade;
    readonly session: SessionFacade;
    readonly tab: Tab;
    readonly tokenStore: TokenStore;
    readonly cidAssigner: CidAssigner;
    readonly eventManager: EventManager;

    getLogger(...namespace: string[]): Logger;

    getTabStorage(...namespace: string[]): Storage;

    getBrowserStorage(...namespace: string[]): Storage;
}

export interface PluginArguments<T = any> {
    options: T;
    sdk: PluginSdk;
}

export interface PluginFactory<T = any> {
    (args: PluginArguments<T>): Plugin;
}

export interface Plugin {
    enable(): Promise<void>|void;

    disable?(): Promise<void>|void;
}
