import { ComponentChildren } from 'preact';
import { POSITIONS, VARIANTS, ACTIONS } from "..";
import toast from '../toast';
import ToastContainer from '../ToastContainer';
export declare type variantTypes = typeof VARIANTS[keyof typeof VARIANTS];
export declare type positionTypes = typeof POSITIONS[keyof typeof POSITIONS];
export declare type actionTypes = typeof ACTIONS[keyof typeof ACTIONS];
export declare type contentTypes = ComponentChildren;
export interface ToastOptionsInterface {
    delay?: number;
    timeout?: number;
    position?: positionTypes;
    pause?: boolean;
    className?: string;
    variant?: variantTypes;
    uniqueCode?: string | number;
}
export interface optionTypes extends ToastOptionsInterface {
    id: number;
    key?: string;
}
export declare type callbackFuncTypes = (type: actionTypes, content: contentTypes, options: optionTypes) => void;
export { VARIANTS, POSITIONS, ACTIONS, toast, ToastContainer };
