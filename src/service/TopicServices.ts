import {Service} from "typedi";
import DrawTopic from "../models/DrawTopic.model";
import DrawTopicDto from "../dto/response/DrawTopicDto";

@Service()
class TopicServices {
    constructor() {}

    async getAll() {
        const topics = await DrawTopic.findAll({
            order: [["nameVi", "ASC"]]
        });
        return topics.map(t => new DrawTopicDto(t));
    }
}

export default TopicServices;
