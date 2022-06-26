import {customAlphabet} from "nanoid";
import {uniqueNamesGenerator, Config, adjectives, names} from "unique-names-generator";
import * as bcrypt from "bcrypt";

export default class StringUtils {
    public static randomName(length = 2) {
        const customConfig: Config = {
            dictionaries: [adjectives, names],
            separator: " ",
            length: length,
            style: "capital"
        };

        return uniqueNamesGenerator(customConfig);
    }

    private static nanoid = customAlphabet(
        "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    );

    public static randomId(length = 8) {
        return StringUtils.nanoid(length);
    }

    public static async hash(data: string) {
        return await bcrypt.hash(data, 10);
    }

    public static async hashCompare(data: string, hash: string) {
        if (!data || !hash) return false;
        return await bcrypt.compare(data, hash);
    }
}
