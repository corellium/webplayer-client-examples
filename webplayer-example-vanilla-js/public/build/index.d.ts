declare type PostMe = typeof import('post-me');
declare global {
    interface Window {
        PostMe: PostMe | undefined;
    }
}
import type { Connection, RemoteHandle, LocalHandle } from 'post-me';
declare type TAllowedEvents = {
    success: number;
    error: number;
    someOtherEvent: number;
    somePublicMethodResponse: number;
};
export declare const allowedEvents: TAllowedEvents;
declare type TAllowedMethods = {
    somePublicMethod: number;
};
export declare const allowedMethods: TAllowedMethods;
declare class CorelliumWebplayer {
    _token: string;
    _appendedChild: HTMLIFrameElement | null;
    _domain: string;
    _deviceId: string;
    _containerId: string;
    _connection: Connection | null;
    _remoteHandle: RemoteHandle | null;
    _localHandle: LocalHandle | null;
    _listeners: {
        [key: string]: (data: any) => void;
    };
    constructor({ token, domain, deviceId, containerId, }: {
        token: string;
        domain: string;
        deviceId: string;
        containerId: string;
    });
    setupPostMe(): Promise<unknown>;
    setupIframe(): HTMLIFrameElement;
    setupCommunication(appendChild: HTMLIFrameElement, postMe: PostMe): void;
    on(eventName: keyof TAllowedEvents, callback: (data: any) => void): void;
    _emit(eventName: keyof TAllowedEvents, data: unknown): void;
    exec(methodName: keyof TAllowedMethods, data: unknown): void;
}
export default CorelliumWebplayer;
