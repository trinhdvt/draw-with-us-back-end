import {randomUUID} from "crypto";
import {nanoid} from "nanoid";
import {uniqueNamesGenerator, Config, adjectives, names} from "unique-names-generator";

export default class StringUtils {
    public static randomName(length: number = 2) {
        const customConfig: Config = {
            dictionaries: [adjectives, names],
            separator: "",
            length: length,
            style: "capital"
        };

        return uniqueNamesGenerator(customConfig);
    }

    public static randomId(length: number = 8) {
        return nanoid(length);
    }

    public static randomString(length: number) {
        const charSet = [..."abcdefghijklmnopqrstuvwxyz"];
        let arr = Array.from(
            {length: length},
            () => charSet[StringUtils.randomInt(0, charSet.length - 1)]
        );
        return arr.join("");
    }

    public static isEmail(str: string): boolean {
        let pattern =
            /^[_A-Za-z0-9-+]+(.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(.[A-Za-z0-9]+)*(.[A-Za-z]{2,})$/;
        return pattern.test(str);
    }

    public static randomUUID(): string {
        return randomUUID({disableEntropyCache: true});
    }

    public static createSlug(str: string): string {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace("đ", "d")
            .replace(/(?!-)\W/g, "-")
            .replace(/^-*|-*$/g, "")
            .replace(/-{2,}/g, "-");
    }

    private static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
