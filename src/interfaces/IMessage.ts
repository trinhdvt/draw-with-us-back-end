interface IMessage {
    from?: string;
    message: string;
    type: "warn" | "error" | "success" | "default";
    id?: string;
}

export type {IMessage};
