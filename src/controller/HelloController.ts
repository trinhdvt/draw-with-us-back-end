import {Service} from "typedi";
import {Get, HttpCode, JsonController} from "routing-controllers";
import {StatusCodes} from "http-status-codes";

@Service()
@JsonController()
export default class HelloController {
    @Get("/")
    @HttpCode(StatusCodes.OK)
    async greeting() {
        return {message: "Hello World"};
    }
}
