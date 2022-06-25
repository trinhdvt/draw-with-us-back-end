import {Container} from "typedi";
import {Action} from "routing-controllers";

import AuthServices from "../service/AuthServices";

const authServices = Container.get(AuthServices);

export const PreAuthorize = async (action: Action, roles: string[]): Promise<boolean> => {
    const authHeader = action.request.headers["authorization"];
    if (!authHeader) return false;

    const token = authHeader.replace("Bearer ", "");
    try {
        if (authServices.isValidJwt(token)) {
            if (roles.length === 0) return true;
            const {role} = authServices.getPayLoad(token);
            return roles.indexOf(role) != -1;
        }
    } catch (e) {
        return false;
    }
    return false;
};

export const CurrentUserChecker = async (action: Action) => {
    if (await PreAuthorize(action, [])) {
        const token = action.request.headers["authorization"].replace("Bearer ", "");
        return authServices.getPayLoad(token);
    }
};
