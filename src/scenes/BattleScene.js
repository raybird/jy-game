import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { saveSystem } from '../systems/SaveSystem.js';
import { CHARACTERS, ENEMIES, SKILL_NAMES } from '../data/GameData.js';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data) {
        this.enemyId = data.enemyId || 'quanzhen_disciple';
    }

    create() {
        this.battleActive = true;
        this.playerTurn = true;

        const charId = dataManager.data.player.characterId;
        const charData = CHARACTERS[charId];

        this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e);
        this.add.text(640, 50, '戰鬥開始！', {
            fontSize: '36px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.playerHp = dataManager.data.player.hp;
        this.playerMaxHp = dataManager.data.player.maxHp;
        this.playerMp = dataManager.data.player.mp;
        this.playerMaxMp = dataManager.data.player.maxMp;

        this.enemyHp = ENEMIES[this.enemyId].hp;
        this.enemyMaxHp = ENEMIES[this.enemyId].hp;
        this.enemyAtb = 0;
        this.enemyCanAct = false;

        this.add.rectangle(300, 350, 100, 100, 0x4a90d9);
        this.add.text(300, 420, charData.name, {
            fontSize: '20px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.add.rectangle(250, 440, 100, 15, 0x333333).setOrigin(0, 0.5);
        this.playerHpBar = this.add.rectangle(250, 440, 100, 15, 0xff0000).setOrigin(0, 0.5);

        this.add.rectangle(840, 390, 120, 15, 0x333333).setOrigin(0, 0.5);
        this.enemyHpBar = this.add.rectangle(840, 390, 120, 15, 0xff0000).setOrigin(0, 0.5);

        this.add.rectangle(900, 300, 120, 120, 0xd94a4a);
        this.add.text(900, 370, ENEMIES[this.enemyId].name, {
            fontSize: '20px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.battleLog = this.add.text(100, 500, '戰鬥日志:\n', {
            fontSize: '16px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei',
            lineSpacing: 8
        });

        this.add.text(600, 600, '招式 (1-4) / 空白鍵普攻', {
            fontSize: '20px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        for (let i = 1; i <= 4; i++) {
            const x = 500 + i * 60;
            const btn = this.add.rectangle(x, 650, 50, 40, 0x2a2a4a)
                .setStrokeStyle(2, 0xc9a227)
                .setInteractive({ useHandCursor: true });
            const label = this.add.text(x, 650, String(i), {
                fontSize: '24px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);

            btn.on('pointerdown', () => this.useSkill(i - 1));
        }

        this.input.keyboard.on('keydown-SPACE', () => this.attack());
        this.input.keyboard.on('keydown-ONE', () => this.useSkill(0));
        this.input.keyboard.on('keydown-TWO', () => this.useSkill(1));
        this.input.keyboard.on('keydown-THREE', () => this.useSkill(2));
        this.input.keyboard.on('keydown-FOUR', () => this.useSkill(3));

        this.log('選擇你的行動！');

        this.time.addEvent({
            delay: 100,
            callback: this.updateATB,
            callbackScope: this,
            loop: true
        });
    }

    log(msg) {
        this.battleLog.text += msg + '\n';
    }

    attack() {
        if (!this.battleActive || !this.playerTurn) return;

        const damage = 10 + Math.floor(dataManager.data.player.strength * 0.5);
        this.dealDamageToEnemy(damage);
    }

    useSkill(index) {
        if (!this.battleActive || !this.playerTurn) return;

        const mpCost = 10 + index * 5;
        if (this.playerMp < mpCost) {
            this.log('MP不足！');
            return;
        }

        this.playerMp -= mpCost;
        const baseDamage = 10 + dataManager.data.player.strength * 0.5 + index * 8;
        this.dealDamageToEnemy(Math.floor(baseDamage));
        this.log(`使用 ${SKILL_NAMES[index]}！`);
    }

    dealDamageToEnemy(damage) {
        const defense = ENEMIES[this.enemyId].defense || 0;
        const actualDamage = Math.max(1, damage - defense);
        this.enemyHp -= actualDamage;
        this.enemyHpBar.width = Math.max(0, (this.enemyHp / this.enemyMaxHp) * 120);
        this.log(`${ENEMIES[this.enemyId].name} 受到 ${actualDamage} 傷害！`);

        if (this.enemyHp <= 0) {
            this.endBattle(true);
        } else {
            this.playerTurn = false;
            this.time.delayedCall(1000, () => this.enemyTurn());
        }
    }

    dealDamageToPlayer(damage) {
        const actualDamage = Math.max(1, damage);
        this.playerHp -= actualDamage;
        dataManager.data.player.hp = this.playerHp;

        const hpPercent = Math.max(0, (this.playerHp / this.playerMaxHp) * 100);
        this.playerHpBar.width = (hpPercent / 100) * 100;
        this.log(`你受到 ${actualDamage} 傷害！`);

        if (this.playerHp <= 0) {
            this.endBattle(false);
        }
    }

    enemyTurn() {
        if (!this.battleActive) return;

        this.log(`${ENEMIES[this.enemyId].name} 的回合！`);
        const damage = ENEMIES[this.enemyId].attack;
        this.time.delayedCall(500, () => {
            this.dealDamageToPlayer(damage);
            if (this.battleActive) {
                this.time.delayedCall(1000, () => {
                    this.playerTurn = true;
                    this.log('選擇你的行動！');
                });
            }
        });
    }

    updateATB() {
        if (!this.battleActive) return;
    }

    endBattle(victory) {
        this.battleActive = false;

        if (victory) {
            this.log('戰鬥勝利！');
            const expGain = 50;
            const silverGain = 100;
            dataManager.data.player.exp += expGain;
            dataManager.addSilver(silverGain);
            dataManager.checkLevelUp();
            this.log(`獲得 ${expGain} 經驗，${silverGain} 銀兩！`);

            if (Math.random() < 0.3) {
                const items = ['iron_ore', 'herb', 'leather', 'bronze_ore'];
                const item = items[Math.floor(Math.random() * items.length)];
                dataManager.addItem(item, Math.floor(Math.random() * 3) + 1);
                this.log(`獲得材料: ${item}！`);
            }
        } else {
            this.log('戰鬥失敗...');
        }

        saveSystem.save();

        this.time.delayedCall(2000, () => {
            dataManager.data.inBattle = false;
            dataManager.data.player.hp = dataManager.data.player.maxHp;
            dataManager.data.player.mp = dataManager.data.player.maxMp;
            this.scene.start('WorldScene', { map: dataManager.data.currentMap });
        });
    }
}