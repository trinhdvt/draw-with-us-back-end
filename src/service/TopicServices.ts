import {Service} from "typedi";
import {FindOptions} from "sequelize";

import DrawTopic from "../models/DrawTopic.model";
import DrawTopicDto from "../dto/response/DrawTopicDto";
import TopicSample from "../models/TopicSample.model";
import ISample from "../dto/response/SampleDto";

@Service()
class TopicServices {
    async getAll(locale?: string) {
        const orderCol = locale === "en" ? "nameEn" : "nameVi";
        const topics = await DrawTopic.findAll({
            order: [[orderCol, "ASC"]]
        });

        return topics.map(t => {
            const dto = new DrawTopicDto(t);
            dto.name = locale == "en" ? t.nameEn : t.nameVi;
            return dto;
        });
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
