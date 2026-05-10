import Phaser from 'phaser';
import { saveSystem } from '../systems/SaveSystem.js';
import { dataManager } from '../systems/DataManager.js';
import { CHARACTERS } from '../data/GameData.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const cx = 640, cy = 360;

        this.add.text(cx, 120, '金庸武俠 Online', {
            fontSize: '64px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const newGameBtn = this.add.text(cx, 280, '新遊戲', {
            fontSize: '36px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        const continueBtn = this.add.text(cx, 360, '繼續遊戲', {
            fontSize: '36px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        if (!saveSystem.hasSave()) {
            continueBtn.setAlpha(0.4);
            continueBtn.disableInteractive();
        }

        newGameBtn.on('pointerover', () => newGameBtn.setColor('#c9a227'));
        newGameBtn.on('pointerout', () => newGameBtn.setColor('#ffffff'));
        newGameBtn.on('pointerdown', () => {
            dataManager.resetPlayer();
            this.scene.start('CharacterSelectScene');
        });

        continueBtn.on('pointerover', () => {
            if (continueBtn.input.enabled) continueBtn.setColor('#c9a227');
        });
        continueBtn.on('pointerout', () => continueBtn.setColor('#ffffff'));
        continueBtn.on('pointerdown', () => {
            if (saveSystem.load()) {
                const charId = dataManager.data.player.characterId;
                const charData = CHARACTERS[charId];
                if (charData) {
                    dataManager.setCharacter(charId, charData);
                }
                this.scene.start('WorldScene', { map: dataManager.data.currentMap });
            }
        });
    }
}