import {IsEnum, IsNotEmpty, IsOptional, Min} from "class-validator";
import {Exclude} from "class-transformer";

export enum PopularType {
    BOOKMARK = "bookmark",
    COMMENT = "comment"
}

export class Sort {

    attribute?: string;

    direction: "ASC" | "DESC" = "DESC";

    constructor() {
    }
}

export default class PageRequest {

    @IsOptional()
    @Min(0, {message: "Page size must greater than 0"})
    size: number = 10;

    @IsOptional()
    @Min(0, {message: "Page index must greater than 0"})
    page: number = 0;

    @IsOptional()
    @IsEnum(PopularType, {message: "Prop must be bookmark either comment"})
    prop: PopularType;

    @IsOptional()
    @IsNotEmpty({message: "Search keyword cannot be empty"})
    keyword: string;

    @Exclude()
    sort: Sort = new Sort();
}

