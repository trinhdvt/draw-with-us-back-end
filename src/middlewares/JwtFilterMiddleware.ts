import {Container} from "typedi";
import JwtService from "../service/JwtService";
import IUserCredential from "../interfaces/IUserCredential";
import {Action} from "routing-controllers";

const jwtService = Container.get(JwtService);

export function PreAuthorize(action: Action, roles: string[]): boolean {
    const authHeader = action.request.headers['authorization'];
    if (!authHeader) {
        return false;
    }

    const token = authHeader.replace("Bearer ", "");
    try {
        if (jwtService.isValidJwt(token)) {
            if (roles.length == 0) {
                return true;
            }

            const credential: IUserCredential = jwtService.getPayLoad(token);
            return roles.indexOf(credential.role) != -1;
        }
    } catch (e) {
    }
    return false;
}

export function CurrentUserChecker(action: Action) {
    if (PreAuthorize(action, [])) {
        const token = action.request.headers['authorization'].replace("Bearer ", "");

        const credential: IUserCredential = jwtService.getPayLoad(token);
        return credential;
    }
}
