import Phaser from 'phaser';
import { CHARACTERS } from '../data/GameData.js';
import { dataManager } from '../systems/DataManager.js';
import { saveSystem } from '../systems/SaveSystem.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
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

        this.add.text(640, 500, '名字（可選）：', {
            fontSize: '24px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const nameInput = this.add.textInput
            ? this.add.textInput(640, 540, { width: 200 })
            : this.add.text(640, 540, '(請在輸入框輸入)', {
                fontSize: '20px', color: '#888888', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);

        const confirmBtn = this.add.text(cx, 620, '確認開始遊戲', {
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
            const name = nameInput.text || CHARACTERS[selectedCharId].name;
            dataManager.data.player.name = name;
            dataManager.setCharacter(selectedCharId, CHARACTERS[selectedCharId]);
            saveSystem.save();
            this.scene.start('WorldScene', { map: 'xianyang' });
        });
    }
}

this.add.textInput = function(x, y, options) {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '輸入名字';
    input.style.position = 'absolute';
    input.style.left = x + 'px';
    input.style.top = y + 'px';
    input.style.width = (options.width || 200) + 'px';
    input.style.textAlign = 'center';
    input.style.fontSize = '20px';
    input.style.backgroundColor = '#2a2a4a';
    input.style.color = '#ffffff';
    input.style.border = '2px solid #c9a227';
    input.style.borderRadius = '5px';
    input.style.padding = '5px';
    document.body.appendChild(input);
    return {
        text: '',
        get text() { return input.value; },
        set text(v) { input.value = v; },
        setPosition: () => {},
        setOrigin: () => {},
        setDepth: () => {}
    };
};