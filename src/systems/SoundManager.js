// @ts-check

class SoundManager {
    constructor() {
        /** @type {AudioContext|null} */
        this.ctx = null;
    }

    /** @returns {AudioContext} */
    getCtx() {
        return /** @type {AudioContext} */ (this.ctx);
    }

    ensureContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || /** @type {any} */ (window).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    play(type) {
        try {
            this.ensureContext();
            const methods = {
                hit: () => this.tone(200, 100, 'square', 0.3),
                skill: () => this.sweep(300, 600, 300, 'sine', 0.2),
                crit: () => this.tone(400, 200, 'sawtooth', 0.25),
                hurt: () => this.tone(150, 150, 'triangle', 0.3),
                victory: () => {
                    this.tone(523, 100, 'sine', 0.2);
                    setTimeout(() => this.tone(659, 100, 'sine', 0.2), 120);
                    setTimeout(() => this.tone(784, 150, 'sine', 0.2), 240);
                },
                defeat: () => this.sweep(400, 100, 500, 'sine', 0.3),
                levelup: () => {
                    this.tone(500, 100, 'sine', 0.2);
                    setTimeout(() => this.tone(800, 300, 'sine', 0.2), 120);
                }
            };
            if (methods[type]) methods[type]();
        } catch (e) {
        }
    }

    tone(freq, duration, type, volume) {
        const ctx = this.getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration / 1000);
    }

    sweep(startFreq, endFreq, duration, type, volume) {
        const ctx = this.getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration / 1000);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration / 1000);
    }
}

export const soundManager = new SoundManager();