interface IFbProfile {
    name: string;
    email: string;
    picture: {
        data: {
            url: string;
        };
    };
}

export type {IFbProfile};
