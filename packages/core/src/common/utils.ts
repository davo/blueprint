/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import * as React from "react";

import { CLAMP_MIN_MAX } from "./errors";

export * from "./utils/compareUtils";
export * from "./utils/safeInvokeMember";

// only accessible within this file, so use `Utils.isNodeEnv(env)` from the outside.
declare var process: { env: any };

/** Returns whether `process.env.NODE_ENV` exists and equals `env`. */
export function isNodeEnv(env: string) {
    return typeof process !== "undefined" && process.env && process.env.NODE_ENV === env;
}

/** Returns whether the value is a function. Acts as a type guard. */
// tslint:disable-next-line:ban-types
export function isFunction(value: any): value is Function {
    return typeof value === "function";
}

/**
 * Returns true if `node` is null/undefined, false, empty string, or an array
 * composed of those. If `node` is an array, only one level of the array is
 * checked, for performance reasons.
 */
export function isReactNodeEmpty(node?: React.ReactNode, skipArray = false): boolean {
    return (
        node == null ||
        node === "" ||
        node === false ||
        (!skipArray &&
            Array.isArray(node) &&
            // only recurse one level through arrays, for performance
            (node.length === 0 || node.every(n => isReactNodeEmpty(n, true))))
    );
}

/**
 * Converts a React child to an element: non-empty string or number or
 * `React.Fragment` (React 16.3+) is wrapped in given tag name; empty strings
 * are discarded.
 */
export function ensureElement(child: React.ReactChild | undefined, tagName: keyof JSX.IntrinsicElements = "span") {
    if (child == null) {
        return undefined;
    } else if (typeof child === "string") {
        // cull whitespace strings
        return child.trim().length > 0 ? React.createElement(tagName, {}, child) : undefined;
    } else if (typeof child === "number" || typeof child.type === "symbol") {
        // React.Fragment has a symbol type
        return React.createElement(tagName, {}, child);
    } else {
        return child;
    }
}

/**
 * Represents anything that has a `name` property such as Functions.
 */
export interface INamed {
    name?: string;
}

export function getDisplayName(ComponentClass: React.ComponentType | INamed) {
    return (ComponentClass as React.ComponentType).displayName || (ComponentClass as INamed).name || "Unknown";
}

/**
 * Returns true if the given JSX element matches the given component type.
 *
 * NOTE: This function only checks equality of `displayName` for performance and
 * to tolerate multiple minor versions of a component being included in one
 * application bundle.
 * @param element JSX element in question
 * @param ComponentType desired component type of element
 */
export function isElementOfType<P = {}>(
    element: any,
    ComponentType: React.ComponentType<P>,
): element is React.ReactElement<P> {
    return (
        element != null &&
        element.type != null &&
        element.type.displayName != null &&
        element.type.displayName === ComponentType.displayName
    );
}

/**
 * Safely invoke the function with the given arguments, if it is indeed a
 * function, and return its value. Otherwise, return undefined.
 */
export function safeInvoke<R>(func: (() => R) | undefined): R | undefined;
export function safeInvoke<A, R>(func: ((arg1: A) => R) | undefined, arg1: A): R | undefined;
export function safeInvoke<A, B, R>(func: ((arg1: A, arg2: B) => R) | undefined, arg1: A, arg2: B): R | undefined;
export function safeInvoke<A, B, C, R>(
    func: ((arg1: A, arg2: B, arg3: C) => R) | undefined,
    arg1: A,
    arg2: B,
    arg3: C,
): R | undefined;
export function safeInvoke<A, B, C, D, R>(
    func: ((arg1: A, arg2: B, arg3: C, arg4: D) => R) | undefined,
    arg1: A,
    arg2: B,
    arg3: C,
    arg4: D,
): R | undefined;
// tslint:disable-next-line:ban-types
export function safeInvoke(func: Function | undefined, ...args: any[]) {
    if (isFunction(func)) {
        return func(...args);
    }
    return undefined;
}

/**
 * Safely invoke the provided entity if it is a function; otherwise, return the
 * entity itself.
 */
export function safeInvokeOrValue<R>(funcOrValue: (() => R) | R | undefined): R;
export function safeInvokeOrValue<A, R>(funcOrValue: ((arg1: A) => R) | R | undefined, arg1: A): R;
export function safeInvokeOrValue<A, B, R>(funcOrValue: ((arg1: A, arg2: B) => R) | R | undefined, arg1: A, arg2: B): R;
export function safeInvokeOrValue<A, B, C, R>(
    funcOrValue: ((arg1: A, arg2: B, arg3: C) => R) | R | undefined,
    arg1: A,
    arg2: B,
    arg3: C,
): R;
export function safeInvokeOrValue<A, B, C, D, R>(
    funcOrValue: ((arg1: A, arg2: B, arg3: C, arg4: D) => R) | R | undefined,
    arg1: A,
    arg2: B,
    arg3: C,
    arg4: D,
): R;
// tslint:disable-next-line:ban-types
export function safeInvokeOrValue(funcOrValue: Function | any | undefined, ...args: any[]) {
    return isFunction(funcOrValue) ? funcOrValue(...args) : funcOrValue;
}

export function elementIsOrContains(element: HTMLElement, testElement: HTMLElement) {
    return element === testElement || element.contains(testElement);
}

/**
 * Returns the difference in length between two arrays. A `null` argument is
 * considered an empty list. The return value will be positive if `a` is longer
 * than `b`, negative if the opposite is true, and zero if their lengths are
 * equal.
 */
export function arrayLengthCompare(a: any[] = [], b: any[] = []) {
    return a.length - b.length;
}

/**
 * Returns true if the two numbers are within the given tolerance of each other.
 * This is useful to correct for floating point precision issues, less useful
 * for integers.
 */
export function approxEqual(a: number, b: number, tolerance = 0.00001) {
    return Math.abs(a - b) <= tolerance;
}

/**
 * Clamps the given number between min and max values. Returns value if within
 * range, or closest bound.
 */
export function clamp(val: number, min: number, max: number) {
    if (val == null) {
        return val;
    }
    if (max < min) {
        throw new Error(CLAMP_MIN_MAX);
    }
    return Math.min(Math.max(val, min), max);
}

/** Returns the number of decimal places in the given number. */
export function countDecimalPlaces(num: number) {
    if (typeof num !== "number" || Math.floor(num) === num) {
        return 0;
    }
    return num.toString().split(".")[1].length;
}

/**
 * Throttle an event on an EventTarget by wrapping it in a
 * `requestAnimationFrame` call. Returns the event handler that was bound to
 * given eventName so you can clean up after yourself.
 * @see https://developer.mozilla.org/en-US/docs/Web/Events/scroll
 */
export function throttleEvent(target: EventTarget, eventName: string, newEventName: string) {
    const throttledFunc = _throttleHelper((event: Event) => {
        target.dispatchEvent(new CustomEvent(newEventName, event));
    });
    target.addEventListener(eventName, throttledFunc);
    return throttledFunc;
}

export interface IThrottledReactEventOptions {
    preventDefault?: boolean;
}

/**
 * Throttle a callback by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 * @see https://www.html5rocks.com/en/tutorials/speed/animations/
 */
export function throttleReactEventCallback(
    callback: (event: React.SyntheticEvent<any>, ...otherArgs: any[]) => any,
    options: IThrottledReactEventOptions = {},
) {
    const throttledFunc = _throttleHelper(
        callback,
        (event2: React.SyntheticEvent<any>) => {
            if (options.preventDefault) {
                event2.preventDefault();
            }
        },
        // prevent React from reclaiming the event object before we reference it
        (event2: React.SyntheticEvent<any>) => event2.persist(),
    );
    return throttledFunc;
}

/**
 * Throttle a method by wrapping it in a `requestAnimationFrame` call. Returns
 * the throttled function.
 */
// tslint:disable-next-line:ban-types
export function throttle<T extends Function>(method: T): T {
    return _throttleHelper(method);
}

// tslint:disable-next-line:ban-types
function _throttleHelper<T extends Function>(
    onAnimationFrameRequested: T,
    onBeforeIsRunningCheck?: T,
    onAfterIsRunningCheck?: T,
) {
    let isRunning = false;
    const func = (...args: any[]) => {
        // don't use safeInvoke, because we might have more than its max number
        // of typed params
        if (isFunction(onBeforeIsRunningCheck)) {
            onBeforeIsRunningCheck(...args);
        }

        if (isRunning) {
            return;
        }
        isRunning = true;

        if (isFunction(onAfterIsRunningCheck)) {
            onAfterIsRunningCheck(...args);
        }

        requestAnimationFrame(() => {
            onAnimationFrameRequested(...args);
            isRunning = false;
        });
    };
    return (func as any) as T;
}
