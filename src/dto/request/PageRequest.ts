import {IsOptional, Min} from "class-validator";

export default class PageRequest {
    @IsOptional()
    @Min(0)
    size = 10;

    @IsOptional()
    @Min(0)
    page = 0;
}
