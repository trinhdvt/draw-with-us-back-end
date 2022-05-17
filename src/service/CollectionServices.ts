import {Service} from "typedi";
import Collection from "../models/Collection.model";
import CollectionDto from "../dto/response/CollectionDto";
import {NotFoundError} from "routing-controllers";

@Service()
class CollectionServices {
    constructor() {
    }

    async getAll() {
        const collections = await Collection.findAll();
        return collections.map(collection => new CollectionDto(collection));
    }

    async getById(id: string) {
        const collection = await Collection.findByPk(Number(id));
        if (!collection) {
            throw new NotFoundError(`Collection with id ${id} not found`);
        }

        return new CollectionDto(collection);
    }


    async getByIds(ids: string[]) {
        const collections = await Collection.findAll({
            where: {
                id: ids
            }
        });

        return collections.map(collection => new CollectionDto(collection));
    }
}

export default CollectionServices;
