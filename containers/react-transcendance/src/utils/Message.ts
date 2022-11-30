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
    constructor(public name: string, public content: Message[] = []) {
    }
}

export function putMessageInChannels(message: Message, channels: Channel[]): Channel[] {
    // 1. Make a shallow copy of the items
    let allChannels = [...channels];
    // 2. Make a shallow copy of the item you want to mutate
    let indexOfChannelToModify = allChannels.findIndex(channel => channel.name === message.channel)
    if (indexOfChannelToModify < 0)
    {
        console.log('this message is not for us')
        console.log(message)
        return channels;
    }
    let channelToModify = {...allChannels[indexOfChannelToModify]};
    // 3. Replace the property you're intested in
    channelToModify.content = [...channelToModify.content, message];
    // 4. Put it back into our array. N.B. we *are* mutating the array here,
    //    but that's why we made a copy first
    allChannels[indexOfChannelToModify] = channelToModify;
    // 5. Set the state to our new copy
    return allChannels
}