import {Service} from "typedi";
import {FindOptions} from "sequelize/types";
import DrawTopic from "../models/DrawTopic.model";

@Service()
class TopicRepository {
    constructor() {}

    async all(options?: FindOptions<DrawTopic>) {
        return await DrawTopic.findAll(options);
    }
}

export default TopicRepository;
