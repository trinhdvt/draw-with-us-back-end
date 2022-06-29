interface IFbProfile {
    name: string;
    email: string;
    picture: {
        data: {
            url: string;
        };
    };
}

interface IGoogleProfile extends Omit<IFbProfile, "picture"> {
    picture: string;
}

export type {IFbProfile, IGoogleProfile};
