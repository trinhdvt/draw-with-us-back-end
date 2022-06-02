import {IGameTopic} from "../dto/response/DrawTopicDto";
import {Service} from "typedi";

@Service()
export default class MLServices {
    constructor() {}

    async predict(_image: string, _topic: IGameTopic): Promise<boolean> {
        // delay for 2 seconds
        await this.delay(2000);

        // predict player's drawn image with topic
        return true;
    }

    async delay(time = 3000) {
        await new Promise(resolve => setTimeout(resolve, time));
    }
}
