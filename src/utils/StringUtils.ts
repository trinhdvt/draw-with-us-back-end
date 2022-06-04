import {customAlphabet} from "nanoid";
import {uniqueNamesGenerator, Config, adjectives, names} from "unique-names-generator";

export default class StringUtils {
    public static randomName(length: number = 2) {
        const customConfig: Config = {
            dictionaries: [adjectives, names],
            separator: " ",
            length: length,
            style: "capital"
        };

        return uniqueNamesGenerator(customConfig);
    }

    public static randomId(length: number = 8) {
        const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-";
        const nanoid = customAlphabet(alphabet);
        return nanoid(length);
    }
}
