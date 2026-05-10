import Phaser from 'phaser';
import { CHARACTERS } from '../data/GameData.js';
import { dataManager } from '../systems/DataManager.js';
import { saveSystem } from '../systems/SaveSystem.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
        this.inputText = '';
    }

    create() {
        const cx = 640, cy = 360;

        this.add.text(cx, 80, '選擇角色', {
            fontSize: '48px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const chars = Object.entries(CHARACTERS);
        const startX = 140;
        const spacing = 220;

        const charButtons = [];
        chars.forEach(([id, char], i) => {
            const x = startX + i * spacing;
            const btn = this.add.rectangle(x, cy - 30, 180, 240, 0x2a2a4a, 1)
                .setStrokeStyle(2, 0xc9a227)
                .setInteractive({ useHandCursor: true });

            this.add.text(x, cy - 120, char.name, {
                fontSize: '28px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);

            this.add.text(x, cy + 30, char.desc, {
                fontSize: '16px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei',
                align: 'center', wordWrap: { width: 160 }
            }).setOrigin(0.5);

            charButtons.push({ btn, id });
        });

        this.add.text(640, 480, '名字（可選）：', {
            fontSize: '24px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const inputBg = this.add.rectangle(640, 520, 200, 40, 0x1a1a2e)
            .setStrokeStyle(2, 0xc9a227);

        this.nameText = this.add.text(640, 520, '', {
            fontSize: '20px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const confirmBtn = this.add.text(cx, 600, '確認開始遊戲', {
            fontSize: '32px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        let selectedCharId = 'guojing';

        charButtons.forEach(({ btn, id }) => {
            btn.on('pointerdown', () => {
                selectedCharId = id;
                charButtons.forEach(b => b.btn.setStrokeStyle(2, 0xc9a227));
                btn.setStrokeStyle(3, 0xff0000);
            });
        });

        confirmBtn.on('pointerover', () => confirmBtn.setColor('#ffffff'));
        confirmBtn.on('pointerout', () => confirmBtn.setColor('#c9a227'));
        confirmBtn.on('pointerdown', () => {
            const name = this.inputText || CHARACTERS[selectedCharId].name;
            dataManager.data.player.name = name;
            dataManager.setCharacter(selectedCharId, CHARACTERS[selectedCharId]);
            saveSystem.save();
            this.scene.start('WorldScene', { map: 'xianyang' });
        });

        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Backspace') {
                this.inputText = this.inputText.slice(0, -1);
            } else if (event.key.length === 1) {
                this.inputText += event.key;
            }
            this.nameText.setText(this.inputText);
        });
    }
}