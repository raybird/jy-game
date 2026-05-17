import Phaser from 'phaser';
import { spriteManager } from '../systems/SpriteManager.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        spriteManager.preload(this);
    }

    create() {
        spriteManager.createAnimations(this);
        this.scene.start('MenuScene');
    }
}