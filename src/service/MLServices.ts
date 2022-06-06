import {IGameTopic} from "../dto/response/DrawTopicDto";
import {Service} from "typedi";
import axios, {AxiosInstance} from "axios";
import logger from "../utils/Logger";

type ResponseType = Record<string, number>;

@Service()
export default class MLServices {
    private readonly mlServer: AxiosInstance;
    /**
     * Threshold for indicate whether drawn image is correct or not.
     * @private
     */
    private readonly THRESHOLD = 15;

    constructor() {
        this.mlServer = axios.create({
            baseURL: process.env.ML_SERVER_URL
        });
    }

    /**
     * Check whether drawn image is belong to topic or not.
     * @param image - Image to be checked.
     * @param topic - Topic to be checked.
     * @param sid - User's socket id for limit request.
     */
    async predict(image: string, topic: IGameTopic, sid?: string): Promise<boolean> {
        const isAvailable = await this.ping();
        logger.debug(`ML server is available: ${isAvailable}`);

        if (isAvailable) {
            const {data} = await this.mlServer.post(
                "/predict/v1",
                {data: image},
                {headers: {"X-SID": sid}}
            );

            logger.debug(`Response from ML server: ${JSON.stringify(data)}`);
            return this.compare(topic, data);
        }

        // delay for 2 seconds
        await this.delay(2000);

        // predict player's drawn image with topic
        return true;
    }

    private async delay(time = 3000) {
        await new Promise(resolve => setTimeout(resolve, time));
    }

    /**
     * Indicates whether the server is available or not.
     * @private
     */
    private async ping(): Promise<boolean> {
        try {
            await this.mlServer.get("/ping", {timeout: 1000});
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Compare current topic with responded result.
     * @param topic - Topic to be compared with.
     * @param response - Response from AI Server
     * @private
     */
    private compare(topic: IGameTopic, response: ResponseType) {
        for (const clazz in response) {
            const prob = Math.ceil(response[clazz] * 100);
            if (prob >= this.THRESHOLD && clazz.localeCompare(topic.nameEn) === 0) {
                return true;
            }
        }

        return false;
    }
}
