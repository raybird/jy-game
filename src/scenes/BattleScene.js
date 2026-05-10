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
        const enemyData = ENEMIES[this.enemyId];

        this.cameras.main.setBackgroundColor(0x1a1a2e);

        this.drawBattleBackground();
        this.createPlayer(charId, charData);
        this.createEnemy(enemyData);
        this.createUI();
        this.createSkillButtons();

        this.input.keyboard.on('keydown-SPACE', () => this.attack());
        this.input.keyboard.on('keydown-ONE', () => this.useSkill(0));
        this.input.keyboard.on('keydown-TWO', () => this.useSkill(1));
        this.input.keyboard.on('keydown-THREE', () => this.useSkill(2));
        this.input.keyboard.on('keydown-FOUR', () => this.useSkill(3));

        this.log('選擇你的行動！');
    }

    drawBattleBackground() {
        this.add.rectangle(640, 360, 1280, 720, 0x1a1a2e);

        for (let x = 0; x < 1280; x += 80) {
            for (let y = 400; y < 720; y += 80) {
                if (Math.random() > 0.5) {
                    this.add.rectangle(x + 40, y + 40, 76, 76, 0x2d2d4a, 0.5);
                }
            }
        }

        this.add.rectangle(640, 550, 1280, 180, 0x0a0a1a);

        this.add.text(640, 50, '⚔️ 戰鬥開始！ ⚔️', {
            fontSize: '36px', color: '#ffd700', fontFamily: 'Microsoft JhengHei',
            stroke: '#8b0000', strokeThickness: 4
        }).setOrigin(0.5);
    }

    createPlayer(charId, charData) {
        this.playerHp = dataManager.data.player.hp;
        this.playerMaxHp = dataManager.data.player.maxHp;
        this.playerMp = dataManager.data.player.mp;
        this.playerMaxMp = dataManager.data.player.maxMp;

        const colors = {
            guojing: { main: 0x4169e1, secondary: 0x1e3a8a },
            yangguo: { main: 0xdc143c, secondary: 0x8b0000 },
            xiaolongnu: { main: 0xffd700, secondary: 0xffa500 },
            zhangwuji: { main: 0x9400d3, secondary: 0x4b0082 },
            linghu: { main: 0x228b22, secondary: 0x006400 }
        };
        const playerColors = colors[charId] || colors.guojing;

        this.playerContainer = this.add.container(250, 380);

        const shadow = this.add.ellipse(0, 55, 70, 25, 0x000000, 0.4);
        const body = this.add.rectangle(0, 20, 50, 60, playerColors.main);
        const head = this.add.circle(0, -25, 25, 0xffdbac);
        const hair = this.add.arc(0, -32, 28, 180, 0, false, playerColors.secondary);
        const eyeL = this.add.circle(-8, -25, 4, 0x000000);
        const eyeR = this.add.circle(8, -25, 4, 0x000000);
        const weapon = this.add.rectangle(35, 15, 12, 55, 0xc0c0c0);
        const weaponHandle = this.add.rectangle(35, 40, 16, 12, 0x8b4513);

        this.playerContainer.add([shadow, body, head, hair, eyeL, eyeR, weapon, weaponHandle]);

        this.createHPBar(this.playerContainer.x - 60, -60, this.playerMaxHp, this.playerHp, 'player');
        this.add.text(250, 290, charData.name, {
            fontSize: '22px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);
    }

    createEnemy(enemyData) {
        this.enemyHp = enemyData.hp;
        this.enemyMaxHp = enemyData.hp;

        this.enemyContainer = this.add.container(950, 320);

        const shadow = this.add.ellipse(0, 65, 80, 30, 0x000000, 0.4);

        const enemyColors = {
            quanzhen_disciple: { main: 0x4169e1, secondary: 0x2a4a8a },
            taoist: { main: 0xffffff, secondary: 0xcccccc },
            mingjiao_member: { main: 0xdc143c, secondary: 0x8b0000 },
            persian: { main: 0x9400d3, secondary: 0x4b0082 }
        };
        const colors = enemyColors[this.enemyId] || { main: 0x8b4513, secondary: 0x5c3317 };

        const body = this.add.rectangle(0, 25, 60, 70, colors.main);
        const head = this.add.circle(0, -30, 30, 0xffdbac);
        const cloth = this.add.rectangle(0, 40, 70, 40, colors.secondary);
        const eyeL = this.add.circle(-10, -30, 5, 0x000000);
        const eyeR = this.add.circle(10, -30, 5, 0x000000);

        this.enemyContainer.add([shadow, body, head, cloth, eyeL, eyeR]);

        this.createHPBar(this.enemyContainer.x - 70, -80, this.enemyMaxHp, this.enemyHp, 'enemy');
        this.add.text(950, 250, enemyData.name, {
            fontSize: '24px', color: '#ff4444', fontFamily: 'Microsoft JhengHei',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);
    }

    createHPBar(x, y, maxHp, currentHp, id) {
        const barBg = this.add.rectangle(x, y, 140, 20, 0x333333).setStrokeStyle(2, 0x666666);
        const bar = this.add.rectangle(x, y, 136, 16, id === 'player' ? 0x00ff00 : 0xff0000).setOrigin(0, 0.5);
        const text = this.add.text(x, y, `${currentHp}/${maxHp}`, {
            fontSize: '12px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        if (id === 'player') {
            this.playerHpBar = bar;
            this.playerHpText = text;
        } else {
            this.enemyHpBar = bar;
            this.enemyHpText = text;
        }
    }

    createUI() {
        const panelBg = this.add.rectangle(640, 620, 500, 100, 0x000000, 0.7).setStrokeStyle(2, 0xc9a227);

        this.battleLog = this.add.text(100, 560, '', {
            fontSize: '14px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei',
            lineSpacing: 6, wordWrap: { width: 1100 }
        });

        this.add.text(100, 590, '💡 提示：數字鍵 1-4 使用招式，空白鍵普攻', {
            fontSize: '12px', color: '#666666', fontFamily: 'Microsoft JhengHei'
        });

        const playerStats = this.add.text(20, 20, '', {
            fontSize: '14px', color: '#ffffff', fontFamily: 'Arial'
        });
    }

    createSkillButtons() {
        const startX = 450;
        const y = 650;

        for (let i = 0; i < 4; i++) {
            const btn = this.add.rectangle(startX + i * 90, y, 80, 50, 0x1a1a4a)
                .setStrokeStyle(2, 0xc9a227)
                .setInteractive({ useHandCursor: true });

            const label = this.add.text(startX + i * 90, y - 8, SKILL_NAMES[i], {
                fontSize: '14px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);

            const cost = this.add.text(startX + i * 90, y + 12, `MP: ${10 + i * 5}`, {
                fontSize: '10px', color: '#888888', fontFamily: 'Arial'
            }).setOrigin(0.5);

            btn.on('pointerover', () => {
                btn.setFillStyle(0x2a2a6a);
                btn.setStrokeStyle(3, 0xffd700);
            });
            btn.on('pointerout', () => {
                btn.setFillStyle(0x1a1a4a);
                btn.setStrokeStyle(2, 0xc9a227);
            });
            btn.on('pointerdown', () => this.useSkill(i));

            this.tweens.add({
                targets: [btn, label, cost],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                yoyo: true,
                repeat: -1,
                delay: i * 200
            });
        }
    }

    log(msg) {
        this.battleLog.text += '▶ ' + msg + '\n';
    }

    attack() {
        if (!this.battleActive || !this.playerTurn) return;

        const damage = 10 + Math.floor(dataManager.data.player.strength * 0.5);
        this.playerAttackAnimation();
        this.time.delayedCall(300, () => this.dealDamageToEnemy(damage));
    }

    useSkill(index) {
        if (!this.battleActive || !this.playerTurn) return;

        const mpCost = 10 + index * 5;
        if (this.playerMp < mpCost) {
            this.log('⚠️ MP不足！');
            this.flashText('MP不足！', 0xff0000);
            return;
        }

        this.playerMp -= mpCost;
        const baseDamage = 10 + dataManager.data.player.strength * 0.5 + index * 8;

        this.log(`✨ 使用 ${SKILL_NAMES[index]}！`);
        this.skillAnimation(index);
        this.time.delayedCall(400, () => this.dealDamageToEnemy(Math.floor(baseDamage)));
    }

    playerAttackAnimation() {
        this.tweens.add({
            targets: this.playerContainer,
            x: this.playerContainer.x + 50,
            duration: 150,
            yoyo: true,
            ease: 'Sine.easeOut'
        });

        this.createSlashEffect(this.playerContainer.x + 80, this.playerContainer.y);
    }

    skillAnimation(index) {
        const colors = [0xffffff, 0x4169e1, 0x9400d3, 0xffd700];
        const color = colors[index];

        this.tweens.add({
            targets: this.playerContainer,
            x: this.playerContainer.x + 80,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });

        for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 80, () => {
                this.createMagicOrb(
                    this.playerContainer.x + 100,
                    this.playerContainer.y + (Math.random() - 0.5) * 60,
                    color
                );
            });
        }
    }

    createSlashEffect(x, y) {
        const slash = this.add.text(x, y, '💥', { fontSize: '48px' }).setOrigin(0.5);
        this.tweens.add({
            targets: slash,
            x: x + 100,
            alpha: 0,
            scale: 2,
            duration: 400,
            onComplete: () => slash.destroy()
        });
    }

    createMagicOrb(x, y, color) {
        const orb = this.add.circle(x, y, 12, color);
        const glow = this.add.circle(x, y, 20, color, 0.3);

        this.tweens.add({
            targets: [orb, glow],
            x: x + 200,
            duration: 500,
            onComplete: () => {
                orb.destroy();
                glow.destroy();
                this.createImpact(x + 200, y, color);
            }
        });
    }

    createImpact(x, y, color) {
        const impact = this.add.circle(x, y, 10, color);

        this.tweens.add({
            targets: impact,
            radius: 50,
            alpha: 0,
            duration: 300,
            onComplete: () => impact.destroy()
        });
    }

    dealDamageToEnemy(damage) {
        const defense = ENEMIES[this.enemyId].defense || 0;
        const actualDamage = Math.max(1, damage - defense);
        this.enemyHp -= actualDamage;

        this.log(`${ENEMIES[this.enemyId].name} 受到 ${actualDamage} 傷害！`);

        this.tweens.add({
            targets: this.enemyContainer,
            x: this.enemyContainer.x + 20,
            duration: 50,
            yoyo: true,
            repeat: 3
        });

        this.tweens.add({
            targets: this.enemyHpBar,
            width: Math.max(0, (this.enemyHp / this.enemyMaxHp) * 136),
            duration: 300
        });
        this.enemyHpText.setText(`${Math.max(0, this.enemyHp)}/${this.enemyMaxHp}`);

        this.createDamageNumber(this.enemyContainer.x, this.enemyContainer.y - 60, actualDamage);

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

        this.log(`你受到 ${actualDamage} 傷害！`);

        this.tweens.add({
            targets: this.playerContainer,
            x: this.playerContainer.x - 20,
            duration: 50,
            yoyo: true,
            repeat: 3
        });

        this.tweens.add({
            targets: this.playerHpBar,
            width: Math.max(0, (this.playerHp / this.playerMaxHp) * 136),
            duration: 300
        });
        this.playerHpText.setText(`${Math.max(0, this.playerHp)}/${this.playerMaxHp}`);

        this.createDamageNumber(this.playerContainer.x, this.playerContainer.y - 60, actualDamage);

        if (this.playerHp <= 0) {
            this.endBattle(false);
        }
    }

    createDamageNumber(x, y, damage) {
        const text = this.add.text(x, y, '-' + damage, {
            fontSize: '32px', color: '#ff0000', fontFamily: 'Arial',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => text.destroy()
        });
    }

    flashText(text, color) {
        const flash = this.add.text(640, 500, text, {
            fontSize: '36px', color: '#' + color.toString(16), fontFamily: 'Microsoft JhengHei',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.tweens.add({
            targets: flash,
            y: 450,
            alpha: 0,
            duration: 1000,
            onComplete: () => flash.destroy()
        });
    }

    enemyTurn() {
        if (!this.battleActive) return;

        this.log(`${ENEMIES[this.enemyId].name} 的回合！`);

        this.tweens.add({
            targets: this.enemyContainer,
            x: this.enemyContainer.x - 40,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });

        this.time.delayedCall(600, () => {
            const damage = ENEMIES[this.enemyId].attack;
            this.createSlashEffect(this.enemyContainer.x - 80, this.enemyContainer.y);
            this.time.delayedCall(300, () => this.dealDamageToPlayer(damage));

            if (this.battleActive) {
                this.time.delayedCall(1000, () => {
                    this.playerTurn = true;
                    this.log('選擇你的行動！');
                });
            }
        });
    }

    endBattle(victory) {
        this.battleActive = false;

        if (victory) {
            this.log('🎉 戰鬥勝利！');

            this.tweens.add({
                targets: this.enemyContainer,
                y: 800,
                alpha: 0,
                duration: 500
            });

            const expGain = 50;
            const silverGain = 100;
            dataManager.data.player.exp += expGain;
            dataManager.addSilver(silverGain);
            dataManager.checkLevelUp();

            this.log(`✨ 獲得 ${expGain} 經驗，${silverGain} 銀兩！`);

            if (Math.random() < 0.3) {
                const items = ['iron_ore', 'herb', 'leather', 'bronze_ore'];
                const item = items[Math.floor(Math.random() * items.length)];
                dataManager.addItem(item, Math.floor(Math.random() * 3) + 1);
                this.log(`📦 獲得材料: ${item}！`);
            }
        } else {
            this.log('💀 戰鬥失敗...');
            this.tweens.add({
                targets: this.playerContainer,
                alpha: 0.5,
                angle: 10,
                duration: 500
            });
        }

        saveSystem.save();

        this.time.delayedCall(2000, () => {
            dataManager.data.inBattle = false;
            dataManager.data.player.hp = dataManager.data.player.maxHp;
            dataManager.data.player.mp = dataManager.data.player.maxMp;
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('WorldScene', { map: dataManager.data.currentMap });
            });
        });
    }
}