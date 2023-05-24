import {callbackFuncTypes, contentTypes, ToastOptionsInterface} from './types/preact-tiny-toast';

const defaultOptions: ToastOptionsInterface = {
  delay: 0,
  timeout: 2000,
  position: "top-center"
}
export const toastManager = (function() {
  let callbackFn: callbackFuncTypes;
  return {
    subscribe(callback: callbackFuncTypes): void {
      callbackFn = callback;
    },
    add(content: contentTypes, options: ToastOptionsInterface) {
      const mergedOptions = {...defaultOptions, ...options};
      const timeoutId = window.setTimeout(() => {
        callbackFn('ADD', content, {...mergedOptions, id: timeoutId});
      }, mergedOptions.delay);
      return timeoutId;
    },
    remove(id: number) {
      callbackFn('REMOVE', null, {id})
      return true;
    }
  };
})();

const toast = {
  show: (content: contentTypes, options: ToastOptionsInterface) => {
    return toastManager.add(content, options)
  },
  remove: (id: number) => {
    return toastManager.remove(id)
  }
}

export default toast;
