import {Service} from "typedi";
import path from "path";
import {readFileSync} from "fs";
import fileType from "file-type";

const BUCKET = process.env.BUCKET;
const REGION = process.env.REGION;
const ACCESS_KEY = process.env.ACCESS_KEY;
const SECRET_KEY = process.env.SECRET_KEY;

@Service()
export default class StorageServices {
    constructor() {}

    public async uploadFile(filePath: string) {
        const key = path.basename(filePath);

        const buffer = readFileSync(filePath);

        return `https://${BUCKET}.s3-${REGION}.amazonaws.com/${key}`;
    }
}
