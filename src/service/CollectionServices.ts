import {Service} from "typedi";
import Collection from "../models/Collection.model";
import CollectionDto from "../dto/response/CollectionDto";

@Service()
class CollectionServices {
    constructor() {}

    async getAll() {
        const collections = await Collection.findAll();
        return collections.map(collection => new CollectionDto(collection));
    }
}

export default CollectionServices;
