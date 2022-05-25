import Collection from "../../models/Collection.model";

enum CollectionType {
    ALL,
    PUBLIC,
    YOUR,
    OFFICIAL
}

interface ICollection {
    id: number | string;
    name: string;
    type: CollectionType;
    thumbnail: string;
}

class CollectionDto implements ICollection {
    id: number;
    name: string;
    type: CollectionType;
    thumbnail: string;

    constructor(collection: Collection) {
        const {id, name, image, isPublic, isOfficial} = collection;
        this.id = id;
        this.name = name;
        this.thumbnail = image;
        this.type = isPublic
            ? CollectionType.PUBLIC
            : isOfficial
            ? CollectionType.OFFICIAL
            : CollectionType.YOUR;
    }
}

export default CollectionDto;
export type {ICollection};
