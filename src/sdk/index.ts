import {EventListener, EventDispatcher, EventSubscriber, EventManager} from '@croct/sdk/eventManager';
import {SdkEventMap, SdkEventType} from '@croct/sdk/sdkEvents';

type SdkEventListener<T extends SdkEventType> = EventListener<SdkEventMap[T]>;
type SdkEventDispatcher = EventDispatcher<Record<string, object>>;
type SdkEventSubscriber = EventSubscriber<SdkEventMap>;
type SdkEventManager = EventManager<SdkEventMap, Record<string, object>>;

export {Logger} from '@croct/sdk/logging';
export {default as SessionFacade} from '@croct/sdk/facade/sessionFacade';
export {default as UserFacade} from '@croct/sdk/facade/userFacade';
export {default as Tab} from '@croct/sdk/tab';
export {default as CidAssigner} from '@croct/sdk/cid';

export {
    SdkEventListener as EventListener,
    SdkEventDispatcher as EventDispatcher,
    SdkEventSubscriber as EventSubscriber,
    SdkEventManager as EventManager,
};

