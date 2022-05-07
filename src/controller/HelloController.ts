import {Service} from "typedi";
import {
    BodyParam,
    Get,
    HttpCode,
    JsonController,
    Post,
    Res
} from "routing-controllers";
import {StatusCodes} from "http-status-codes";
import FormData from "form-data";
import axios from "axios";
import {Response} from "express";

@Service()
@JsonController()
export default class HelloController {
    @Get("/")
    @HttpCode(StatusCodes.OK)
    async greeting() {
        return {message: "Hello World"};
    }

    @Post("/predict")
    async predict(@BodyParam("data") data: string, @Res() response: Response) {
        data = data.split(",")[1];
        const buffer = Buffer.from(data, "base64");
        const form = new FormData();
        form.append("data", buffer);
        const URL = "http://localhost:8080/predictions/drawclassifier";
        try {
            const result = await axios.post(URL, form, {
                headers: form.getHeaders()
            });
            return response.status(200).json(result.data);
        } catch (e) {
            console.log(e);
        }

        return response.status(200).json({message: "OK"});
    }
}
