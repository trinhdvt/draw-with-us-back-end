import {Service} from "typedi";
import Collection from "../models/Collection.model";
import CollectionDto from "../dto/response/CollectionDto";
import DrawTopic from "../models/DrawTopic.model";

@Service()
class CollectionServices {
    constructor() {}

    async getAll() {
        const collections = await Collection.findAll({
            include: [DrawTopic]
        });

        return collections.map(collection => new CollectionDto(collection));
    }
}

export default CollectionServices;
