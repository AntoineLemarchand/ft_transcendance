export class Message{
    sender: string;
    content: string;
    channel: string;
    constructor() {
        this.sender = ''
        this.channel = ''
        this.content = ''
    }
}

export class Channel{
    constructor(public channelName: string, public messages: Message[] = []) {
    }
}

export function putMessageInChannels(message: Message, channels: Channel[]): Channel[] {
    let allChannels = [...channels];
    allChannels.find(obj=>obj.channelName === message.channel).messages.push(message)
    return allChannels
}
