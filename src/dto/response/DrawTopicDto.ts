import DrawTopic from "../../models/DrawTopic.model";

class DrawTopicDto {
    id: number;
    name: string;
    nameEn: string;
    sample: string;

    constructor(drawTopic: DrawTopic) {
        const {id, nameEn, nameVi} = drawTopic;
        this.id = id;
        this.name = nameVi;
        this.nameEn = nameEn;
        this.sample = "";
    }
}

export default DrawTopicDto;
