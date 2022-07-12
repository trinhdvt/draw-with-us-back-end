import {IMessage} from "../interfaces/IMessage";
import {ERoomEvent} from "../interfaces/IRoom";

const fromEn = "⚙️ System: ";
const fromVi = "⚙️ Hệ thống: ";

type ParamEvent = ERoomEvent.JOIN | ERoomEvent.PLAYER_SUCCESS | ERoomEvent.NEXT_TURN;
type NoParamEvent = Exclude<ERoomEvent, ParamEvent>;

const GameMessages:
    | Record<NoParamEvent, IMessage>
    | Record<ParamEvent, (en: string, vi: string) => IMessage> = {
    [ERoomEvent.START]: {
        type: "warn",
        i18n: {
            en: {message: "Game has started🎉", from: fromEn},
            vi: {message: "Trò chơi đã bắt đầu!!!", from: fromVi}
        }
    },
    [ERoomEvent.FINISH]: {
        type: "error",
        i18n: {
            en: {message: "Game has finished!!! Let's see the result 👀", from: fromEn},
            vi: {message: "Trò chơi đã kết thúc!!! Hãy xem kết quả nào 👀", from: fromVi}
        }
    },
    [ERoomEvent.END_TURN]: {
        type: "warn",
        i18n: {
            en: {message: "Time out!!! Let's take a rest⌛️", from: fromEn},
            vi: {message: "Hết giờ!!! Nghỉ ngơi một chút nào⌛️", from: fromVi}
        }
    },
    [ERoomEvent.PLAYER_SUCCESS]: (en: string, vi: string) => ({
        type: "success",
        i18n: {
            en: {message: `${en} has done a correct drawing!👏`},
            vi: {message: `${vi} đã vẽ chính xác!👏`}
        }
    }),
    [ERoomEvent.NEXT_TURN]: (en: string, vi: string) => ({
        type: "warn",
        i18n: {
            en: {message: `The next topic is 🔥${en}🔥`, from: fromEn},
            vi: {message: `Chủ đề tiếp theo là 🔥${vi}🔥`, from: fromVi}
        }
    }),
    [ERoomEvent.JOIN]: (en: string, vi: string) => ({
        type: "success",
        i18n: {
            en: {message: `${en} joined the room!`, from: fromEn},
            vi: {message: `${vi} đã tham gia phòng!`, from: fromVi}
        }
    })
};

export default GameMessages;
