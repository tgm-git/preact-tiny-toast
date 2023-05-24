import { callbackFuncTypes, contentTypes, ToastOptionsInterface } from './types/preact-tiny-toast';
export declare const toastManager: {
    subscribe(callback: callbackFuncTypes): void;
    add(content: contentTypes, options: ToastOptionsInterface): number;
    remove(id: number): boolean;
};
declare const toast: {
    show: (content: contentTypes, options: ToastOptionsInterface) => number;
    remove: (id: number) => boolean;
};
export default toast;
