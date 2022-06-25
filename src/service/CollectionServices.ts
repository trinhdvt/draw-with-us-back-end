import {Service} from "typedi";
import {BadRequestError, UnauthorizedError} from "routing-controllers";
import {Op} from "sequelize";

import Collection from "../models/Collection.model";
import CollectionDto, {CollectionType} from "../dto/response/CollectionDto";
import DrawTopic from "../models/DrawTopic.model";
import ICollectionPayload from "../dto/request/ICollectionPayload";
import User from "../models/User.model";
import AssertUtils from "../utils/AssertUtils";
import sequelize from "../models";
import CollectionTopic from "../models/CollectionTopic.model";

@Service()
class CollectionServices {
    async getAll(currentUserId: string | null) {
        const publicCollections = await Collection.findAll({
            where: {
                [Op.or]: [{isPublic: true}, {isOfficial: true}, {userId: currentUserId}]
            },
            include: [DrawTopic]
        });

        return publicCollections.map(collection => {
            const dto = new CollectionDto(collection);
            if (Number(currentUserId) === collection.userId) {
                dto.type = CollectionType.YOUR;
            }
            return dto;
        });
    }

    async createCollection(authorId: string, {isPublic, name, topicIds}: ICollectionPayload) {
        const author = await User.findByPk(authorId);
        AssertUtils.isExist(author, new UnauthorizedError("User not found"));

        const drawTopic = await DrawTopic.findAll({
            where: {id: topicIds}
        });
        AssertUtils.isTrue(drawTopic.length >= 5, new BadRequestError("Topic must be at least 5"));

        return await sequelize.transaction(async t => {
            const collection = await Collection.create(
                {
                    name: name,
                    isPublic: isPublic,
                    image: author.avatar,
                    userId: authorId
                },
                {transaction: t}
            );

            await CollectionTopic.bulkCreate(
                drawTopic.map(topic => ({
                    collectionId: collection.id,
                    drawTopicId: topic.id
                })),
                {transaction: t}
            );

            return collection.toJSON();
        });
    }
}

export default CollectionServices;
