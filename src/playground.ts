import {formatCause} from '@croct/sdk/error';
import CidAssigner from '@croct/sdk/cid';
import {Plugin, PluginFactory} from './plugin';
import {PLAYGROUND_ENDPOINT, PLAYGROUND_ORIGIN} from './constants';
import {Tab, EventSubscriber, Logger} from './sdk';
import {Token, TokenProvider} from './sdk/token';
import {SdkEvent} from './sdk/sdkEvents';

export const factory: PluginFactory = ({sdk}): PlaygroundPlugin => {
    return new PlaygroundPlugin(
        sdk.tab,
        sdk.getTabStorage(),
        sdk.tokenStore,
        sdk.cidAssigner,
        sdk.eventManager,
        sdk.getLogger(),
    );
};

export default class PlaygroundPlugin implements Plugin {
    private readonly tab: Tab;

    private readonly storage: Storage;

    private readonly eventSubscriber: EventSubscriber;

    private readonly cidAssigner: CidAssigner;

    private readonly tokenProvider: TokenProvider;

    private readonly logger: Logger;

    public constructor(
        tab: Tab,
        storage: Storage,
        tokenProvider: TokenProvider,
        cidAssigner: CidAssigner,
        eventSubscriber: EventSubscriber,
        logger: Logger,
    ) {
        this.tab = tab;
        this.storage = storage;
        this.tokenProvider = tokenProvider;
        this.cidAssigner = cidAssigner;
        this.eventSubscriber = eventSubscriber;
        this.logger = logger;

        this.handleTokenChange = this.handleTokenChange.bind(this);
    }

    public async enable(): Promise<void> {
        if (this.tab.referrer.startsWith(PLAYGROUND_ORIGIN)) {
            this.storage.setItem('playgroundEnabled', 'true');
        } else if (this.storage.getItem('playgroundEnabled') !== 'true') {
            return;
        }

        this.notifyPlayground(await this.cidAssigner.assignCid(), this.tokenProvider.getToken());

        this.eventSubscriber.addListener('tokenChanged', this.handleTokenChange);
    }

    public disable(): Promise<void> | void {
        this.eventSubscriber.removeListener('tokenChanged', this.handleTokenChange);
    }

    private handleTokenChange(event: SdkEvent<'tokenChanged'>): Promise<void> {
        return this.cidAssigner.assignCid()
            .then(cid => this.notifyPlayground(cid, event.newToken))
            .catch(error => this.logger.error(`Failed to assign CID: ${formatCause(error)}`));
    }

    private notifyPlayground(cid: string, token: Token|null): void {
        const iframe = window.document.createElement('iframe');
        iframe.setAttribute('src', PLAYGROUND_ENDPOINT);

        iframe.onload = (): void => {
            if (iframe.contentWindow === null) {
                window.document.body.removeChild(iframe);

                this.logger.error('Playground handshake failed');

                return;
            }

            const listener = (event: MessageEvent): void => {
                if (event.origin !== PLAYGROUND_ORIGIN || event.data !== 'accepted') {
                    return;
                }

                window.removeEventListener('message', listener);
                window.document.body.removeChild(iframe);

                this.logger.debug('Playground handshake completed');
            };

            window.addEventListener('message', listener);

            const payload = {
                tabId: this.tab.id,
                cid: cid,
                token: token?.toString() ?? null,
            };

            iframe.contentWindow.postMessage(payload, PLAYGROUND_ORIGIN);

            this.logger.debug('Playground handshake sent');
        };

        this.logger.debug('Playground handshake started');

        window.document.body.append(iframe);
    }
}
