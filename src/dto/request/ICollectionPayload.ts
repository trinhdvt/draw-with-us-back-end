import {IsArray, IsNotEmpty, MaxLength} from "class-validator";
import {Transform} from "class-transformer";

export const ToBoolean = () => Transform(({value}) => ["1", 1, "true", true].includes(value));

export default class ICollectionPayload {
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ToBoolean()
    isPublic!: boolean;

    @IsArray()
    topicIds: number[];
}
