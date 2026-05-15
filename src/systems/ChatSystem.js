class ChatSystem {
    constructor() {
        this.messages = [];
        this.channel = 'all';
        this.listeners = [];
    }

    send(text, channel = null) {
        const ch = channel || this.channel;
        const msg = { text, channel: ch, time: Date.now() };
        this.messages.push(msg);
        if (this.messages.length > 100) this.messages.shift();
        this.listeners.forEach(fn => fn(msg));
    }

    switchChannel(ch) {
        this.channel = ch;
    }

    getMessages(channel = null) {
        const ch = channel || this.channel;
        if (ch === 'all') return this.messages.slice(-20);
        return this.messages.filter(m => m.channel === ch).slice(-20);
    }

    onMessage(fn) {
        this.listeners.push(fn);
    }
}

export const chatSystem = new ChatSystem();