// @ts-check
import Phaser from 'phaser';
import { saveSystem } from '../systems/SaveSystem.js';
import { dataManager } from '../systems/DataManager.js';
import { CHARACTERS } from '../data/GameData.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor(0x0a0a1a);

        this.createBackground();
        this.createTitle();
        this.createButtons();

        this.time.addEvent({
            delay: 100,
            callback: this.animateTitle,
            callbackScope: this,
            loop: true
        });
    }

    createBackground() {
        for (let x = 0; x < 1280; x += 40) {
            for (let y = 0; y < 720; y += 40) {
                if (Math.random() > 0.7) {
                    this.add.rectangle(x + 20, y + 20, 36, 36, 0x1a1a3a, 0.5);
                }
            }
        }

        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 1280;
            const y = Math.random() * 720;
            const star = this.add.circle(x, y, Math.random() * 2 + 1, 0xffffff, Math.random() * 0.5 + 0.3);

            this.tweens.add({
                targets: star,
                alpha: 0.1,
                duration: 1000 + Math.random() * 2000,
                yoyo: true,
                repeat: -1
            });
        }

        const logoY = 150;
        const circle1 = this.add.circle(300, logoY, 100, 0xc9a227, 0.1);
        const circle2 = this.add.circle(300, logoY, 130, 0xc9a227, 0.05);

        this.tweens.add({
            targets: [circle1, circle2],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 2000,
            yoyo: true,
            repeat: -1
        });
    }

    createTitle() {
        this.titleText = this.add.text(640, 150, '金庸武俠 Online', {
            fontSize: '72px', color: '#c9a227', fontFamily: 'Microsoft JhengHei',
            stroke: '#8b4513', strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(640, 220, '~ 江湖俠客，行俠仗義 ~', {
            fontSize: '24px', color: '#888888', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);
    }

    animateTitle() {
        const hue = (Date.now() / 50) % 360;
        const r = Math.sin(hue * 0.1) * 50 + 200;
        const g = Math.sin(hue * 0.1 + 2) * 50 + 150;
        const b = Math.sin(hue * 0.1 + 4) * 50 + 100;

        this.titleText.setColor(`rgb(${r}, ${g}, ${b})`);
    }

    createButtons() {
        const buttonY = 400;
        const spacing = 100;

        this.createMenuButton(640 - spacing, buttonY, '新遊戲', () => {
            dataManager.resetPlayer();
            this.scene.start('CharacterSelectScene');
        });

        const continueBtn = this.createMenuButton(640 + spacing, buttonY, '繼續遊戲', () => {
            if (saveSystem.load()) {
                const charId = dataManager.getPlayer().characterId;
                if (CHARACTERS[charId]) {
                    dataManager.setCharacter(charId, CHARACTERS[charId]);
                }
                this.scene.start('WorldScene', { map: dataManager.data.currentMap });
            }
        });

        if (!saveSystem.hasSave()) {
            continueBtn.setAlpha(0.4);
            continueBtn.getAt(0).setAlpha(0.4);
        }

        this.add.text(640, 550, '📖 操作說明', {
            fontSize: '16px', color: '#666666', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.add.text(640, 580, 'WASD/方向鍵 移動 | E 互動 | 1-4 招式 | 空白 攻擊', {
            fontSize: '14px', color: '#888888', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add.text(640, 680, '一款基於金庸武俠世界的網頁遊戲', {
            fontSize: '12px', color: '#444444', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);
    }

    createMenuButton(x, y, text, callback) {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 200, 60, 0x1a1a4a)
            .setStrokeStyle(3, 0xc9a227);

        const label = this.add.text(0, 0, text, {
            fontSize: '28px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        container.add([bg, label]);

        if (text !== '繼續遊戲' || saveSystem.hasSave()) {
            bg.setInteractive({ useHandCursor: true });

            bg.on('pointerover', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 100
                });
                label.setColor('#ffd700');
                bg.setStrokeStyle(4, 0xffd700);
            });

            bg.on('pointerout', () => {
                this.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
                label.setColor('#c9a227');
                bg.setStrokeStyle(3, 0xc9a227);
            });

            bg.on('pointerdown', callback);
        }

        this.tweens.add({
            targets: container,
            y: y - 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Math.random() * 500
        });

        return container;
    }
}