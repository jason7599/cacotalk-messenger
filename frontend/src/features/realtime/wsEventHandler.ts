import type { IMessage } from "@stomp/stompjs";

export function handleWsEvent(frame: IMessage) {
    console.log(frame);
}