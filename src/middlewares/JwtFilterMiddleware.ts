import {Action} from "routing-controllers";

export function PreAuthorize(action: Action, roles: string[]): boolean {
    throw new Error("Not implemented");
}

export function CurrentUserChecker(action: Action) {
    throw new Error("Not implemented");
}
