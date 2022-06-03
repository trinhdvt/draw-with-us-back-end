import DrawTopic from "../../models/DrawTopic.model";

interface IGameTopic {
    id: number;
    nameVi: string;
    nameEn: string;
}

class DrawTopicDto implements IGameTopic {
    id: number;
    nameEn: string;
    nameVi: string;

    constructor(drawTopic: DrawTopic) {
        const {id, nameEn, nameVi} = drawTopic;
        this.id = id;
        this.nameVi = nameVi;
        this.nameEn = nameEn;
    }
}

export default DrawTopicDto;
export type {IGameTopic};
