// @ts-check
import Phaser from 'phaser';
import { INITIAL_PLAYER, FIVE_ATTRS, CHARACTERS, CHARACTER_SKILLS } from '../data/GameData.js';
import { dataManager } from '../systems/DataManager.js';
import { saveSystem } from '../systems/SaveSystem.js';

export default class CharacterSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectScene' });
    }

    create() {
        this.cameras.main.setBackgroundColor('#1a1a2e');
        this.remainingPoints = 50;
        this.attrs = { str: 10, bra: 10, wis: 10, luk: 10, con: 10 };
        this.playerName = '少俠';

        const cx = 400;
        let iy = 40;

        this.add.text(cx, iy, '創建角色', {
            fontSize: '32px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 60;

        this.add.text(cx - 150, iy, '角色名稱：', {
            fontSize: '20px', fill: '#fff', fontFamily: 'serif'
        });
        this.nameText = this.add.text(cx + 20, iy, this.playerName, {
            fontSize: '20px', fill: '#00ff88', fontFamily: 'serif'
        }).setOrigin(0, 0.5);
        iy += 40;

        this.pointsText = this.add.text(cx, iy, `剩餘點數：${this.remainingPoints}`, {
            fontSize: '22px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 50;

        this.attrTexts = {};
        const keys = ['str', 'bra', 'wis', 'luk', 'con'];

        keys.forEach(key => {
            const cfg = FIVE_ATTRS[key];
            this.add.text(cx - 200, iy, `${cfg.label} (${cfg.short})`, {
                fontSize: '18px', fill: '#aaa', fontFamily: 'serif'
            }).setOrigin(0, 0.5);

            const minusBtn = this.add.text(cx + 50, iy, '◀', {
                fontSize: '22px', fill: '#ff6666', fontFamily: 'serif'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            const valText = this.add.text(cx + 90, iy, `${this.attrs[key]}`, {
                fontSize: '22px', fill: '#fff', fontFamily: 'serif'
            }).setOrigin(0.5);

            const plusBtn = this.add.text(cx + 130, iy, '▶', {
                fontSize: '22px', fill: '#66ff66', fontFamily: 'serif'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.attrTexts[key] = valText;

            minusBtn.on('pointerdown', () => {
                if (this.attrs[key] > 5) {
                    this.attrs[key] -= 1;
                    this.remainingPoints += 1;
                    this.updateDisplay();
                }
            });
            plusBtn.on('pointerdown', () => {
                if (this.attrs[key] < 15 && this.remainingPoints > 0) {
                    this.attrs[key] += 1;
                    this.remainingPoints -= 1;
                    this.updateDisplay();
                }
            });

            iy += 40;
        });

        iy += 20;

        this.add.text(cx, iy, `[ 屬性說明 ]`, {
            fontSize: '18px', fill: '#aaa', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 25;

        const descKeys = [
            '臂力：影響物理攻擊力',
            '膽識：影響暴擊率',
            '悟性：影響學點消耗折扣',
            '福緣：影響稀有掉落率',
            '定力：影響防禦與狀態抗性',
        ];
        descKeys.forEach(desc => {
            this.add.text(cx, iy, desc, {
                fontSize: '14px', fill: '#666', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 22;
        });

        iy += 10;

        const confirmBtn = this.add.text(cx, iy, '[ 踏入江湖 ]', {
            fontSize: '24px', fill: '#ffd700', fontFamily: 'serif',
            backgroundColor: '#444', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        confirmBtn.on('pointerover', () => {
            confirmBtn.setFill('#00ff88');
        });
        confirmBtn.on('pointerout', () => {
            confirmBtn.setFill('#ffd700');
        });

        confirmBtn.on('pointerdown', () => {
            const p = dataManager.getPlayer();

            p.name = this.playerName;
            p.attributes = { ...this.attrs };
            p.attributePoints = this.remainingPoints;
            p.hp = 100;
            p.maxHp = 100;
            p.mp = 50;
            p.maxMp = 50;
            p.combatExp = 0;
            p.studyPoints = 0;
            p.fame = 0;
            p.karma = 0;
            p.sect = null;
            p.sectReputation = 0;
            p.martialArts = [];
            p.equippedSkills = [null, null, null, null];
            p.equipped = { weapon: null, armor: null, accessory: null };
            p.silver = 1000;
            p.level = 1;

            p.characterId = 'guojing';
            p.strength = this.attrs.str;
            p.agility = this.attrs.bra;
            p.innerPower = this.attrs.wis;
            p.constitution = this.attrs.con;

            p.skills = [0, 0, 0, 0];
            p.skillExp = [0, 0, 0, 0];
            p.skillTree = [
                { nodes: [false, false, false] },
                { nodes: [false, false, false] },
                { nodes: [false, false, false] },
                { nodes: [false, false, false] },
            ];
            p.exp = 0;
            p.skillPoints = 3;
            p.achievements = {};
            p.battleCount = 0;
            p.killCount = 0;
            p.titles = [];

            saveSystem.save();
            this.scene.start('WorldScene', { map: 'xianyang' });
        });

        this.input.keyboard.on('keydown', (event) => {
            if (event.key === 'Backspace') {
                this.inputText = (this.inputText || this.playerName).slice(0, -1);
            } else if (event.key.length === 1) {
                this.inputText = (this.inputText || '') + event.key;
            }
            this.playerName = this.inputText || '少俠';
            this.nameText.setText(this.playerName);
        });
    }

    updateDisplay() {
        this.pointsText.setText(`剩餘點數：${this.remainingPoints}`);
        Object.entries(this.attrTexts).forEach(([key, text]) => {
            text.setText(`${this.attrs[key]}`);
        });
    }
}