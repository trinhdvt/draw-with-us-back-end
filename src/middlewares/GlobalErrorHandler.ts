import {ExpressErrorMiddlewareInterface, Middleware} from "routing-controllers";
import {Service} from "typedi";
import logger from "../utils/Logger";

@Middleware({type: "after"})
@Service()
export class GlobalErrorHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any, next: (err?: any) => any): void {
        if (error.hasOwnProperty("message") && !error.hasOwnProperty("httpCode")) {
            error = {
                message: error.message,
                httpCode: 500
            };
        }

        logger.error(error);
        return response.status(error.httpCode ?? 500).json(error);
    }
}
