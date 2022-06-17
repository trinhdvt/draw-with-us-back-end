import {HttpError} from "routing-controllers";

export default class AssertUtils {
    static isExist(value: unknown, error: HttpError) {
        if (value == null) throw error;
    }

    static isTrue(condition: boolean, error: HttpError) {
        if (!condition) throw error;
    }
}
