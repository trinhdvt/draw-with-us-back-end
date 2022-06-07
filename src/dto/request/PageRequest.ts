import {IsOptional, Min} from "class-validator";

export default class PageRequest {
    @IsOptional()
    @Min(0)
    size: number = 10;

    @IsOptional()
    @Min(0)
    page: number = 0;
}
