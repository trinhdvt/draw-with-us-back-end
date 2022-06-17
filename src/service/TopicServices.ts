import {Service} from "typedi";
import {FindOptions} from "sequelize";

import DrawTopic from "../models/DrawTopic.model";
import DrawTopicDto from "../dto/response/DrawTopicDto";
import TopicSample from "../models/TopicSample.model";
import ISample from "../dto/response/SampleDto";

@Service()
class TopicServices {
    async getAll() {
        const topics = await DrawTopic.findAll({
            order: [["nameVi", "ASC"]]
        });
        return topics.map(t => new DrawTopicDto(t));
    }

    async getSamples(topicId: string, findOptions?: FindOptions<TopicSample>) {
        const samples = await TopicSample.findAll({
            where: {
                topicId: topicId
            },
            ...findOptions
        });

        return samples.map<ISample>(s => ({
            id: s.id,
            strokes: s.drawSample
        }));
    }
}

export default TopicServices;
