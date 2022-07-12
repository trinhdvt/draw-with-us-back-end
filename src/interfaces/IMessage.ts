type ISimpleMessage = {
    from?: string;
    message?: string;
};

type I18nMessage = {
    [locale in "en" | "vi"]: ISimpleMessage;
};

interface IMessage extends ISimpleMessage {
    type: "warn" | "error" | "success" | "default";
    id?: string;
    i18n?: I18nMessage;
}

export type {IMessage};
