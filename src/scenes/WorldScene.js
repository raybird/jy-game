import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { saveSystem } from '../systems/SaveSystem.js';
import { CHARACTERS, SKILL_NAMES } from '../data/GameData.js';

export default class WorldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WorldScene' });
    }

    init(data) {
        this.currentMap = data?.map || 'xianyang';
    }

    create() {
        dataManager.data.inBattle = false;
        dataManager.data.currentMap = this.currentMap;

        this.drawMap();

        this.player = this.physics.add.sprite(640, 500, null);
        this.player.setCircle(16);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(32, 32);

        this.setupHUD();
        this.setupNPCs();
        this.setupExits();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);

        this.updateHUD();
    }

    drawMap() {
        const colors = {
            xianyang: 0x4a6741,
            zhongnan: 0x3d5c3d,
            guangming: 0x5c4a3d
        };

        const mapNames = {
            xianyang: '襄陽城',
            zhongnan: '終南山',
            guangming: '光明頂'
        };

        this.add.rectangle(640, 360, 1280, 720, colors[this.currentMap] || 0x333333);

        this.add.text(20, 20, mapNames[this.currentMap], {
            fontSize: '32px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        });

        if (this.currentMap !== 'xianyang') {
            this.grassArea = this.add.rectangle(640, 400, 800, 300, 0x2d4a2d, 0.3).setInteractive();
        }
    }

    setupHUD() {
        const p = dataManager.data.player;

        this.add.rectangle(170, 690, 150, 20, 0x333333).setOrigin(0, 0.5);
        this.hpBar = this.add.rectangle(170, 690, (p.hp / p.maxHp) * 150, 20, 0xff0000).setOrigin(0, 0.5);
        this.add.text(20, 690, 'HP', { fontSize: '16px', color: '#ffffff' });

        this.add.rectangle(170, 715, 150, 20, 0x333333).setOrigin(0, 0.5);
        this.mpBar = this.add.rectangle(170, 715, (p.mp / p.maxMp) * 150, 20, 0x0000ff).setOrigin(0, 0.5);
        this.add.text(20, 715, 'MP', { fontSize: '16px', color: '#ffffff' });

        this.silverText = this.add.text(20, 640, '銀兩: ' + p.silver, {
            fontSize: '20px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        });

        this.levelText = this.add.text(20, 665, '等級: ' + p.level, {
            fontSize: '20px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        });

        const skillX = 900;
        this.add.text(skillX, 640, '招式 (1-4):', {
            fontSize: '20px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        });

        this.skillLabels = [];
        for (let i = 0; i < 4; i++) {
            const label = this.add.text(skillX + i * 90, 670, `${i + 1}: 招式${i + 1}`, {
                fontSize: '16px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei',
                backgroundColor: '#2a2a4a',
                padding: { x: 8, y: 4 }
            });
            this.skillLabels.push(label);
        }
    }

    setupNPCs() {
        if (this.currentMap !== 'xianyang') return;

        const npcs = [
            { id: 'smith', x: 300, y: 300, name: '鐵匠', color: 0x8b4513 },
            { id: 'auction', x: 640, y: 200, name: '拍賣行', color: 0xc9a227 },
            { id: 'herbalist', x: 980, y: 300, name: '草藥商', color: 0x228b22 }
        ];

        this.npcGroup = this.add.group();

        npcs.forEach(npc => {
            const npcSprite = this.add.rectangle(npc.x, npc.y, 50, 70, npc.color)
                .setInteractive({ useHandCursor: true });
            this.add.text(npc.x, npc.y - 50, npc.name, {
                fontSize: '18px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);

            npcSprite.setData('npcId', npc.id);
            this.npcGroup.add(npcSprite);

            npcSprite.on('pointerdown', () => this.interactWithNPC(npc.id));
        });
    }

    setupExits() {
        const exitPositions = {
            xianyang: [
                { target: 'zhongnan', x: 640, y: 700, w: 150, h: 30, label: '終南山' },
                { target: 'guangming', x: 1200, y: 360, w: 30, h: 100, label: '光明頂' }
            ],
            zhongnan: [
                { target: 'xianyang', x: 640, y: 700, w: 150, h: 30, label: '襄陽城' }
            ],
            guangming: [
                { target: 'xianyang', x: 640, y: 700, w: 150, h: 30, label: '襄陽城' }
            ]
        };

        const exits = exitPositions[this.currentMap] || [];

        exits.forEach(exit => {
            const exitZone = this.add.rectangle(exit.x, exit.y, exit.w, exit.h, 0x0000ff, 0.3)
                .setInteractive({ useHandCursor: true });
            this.add.text(exit.x, exit.y, exit.label, {
                fontSize: '14px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);
            exitZone.on('pointerdown', () => {
                dataManager.data.currentMap = exit.target;
                saveSystem.save();
                this.scene.start('WorldScene', { map: exit.target });
            });
        });
    }

    interactWithNPC(npcId) {
        switch (npcId) {
            case 'smith': this.showLifeSkillMenu('smithing'); break;
            case 'herbalist': this.showLifeSkillMenu('herbalism'); break;
            case 'auction': this.showAuctionMenu(); break;
        }
    }

    showLifeSkillMenu(skillId) {
        const skillNames = { herbalism: '采藥', mining: '採礦', smithing: '鑄造', tailoring: '縫紉' };
        const skills = dataManager.data.lifeSkills;
        const skill = skills[skillId];
        const expNeeded = skill.level * 100;

        const panel = this.add.rectangle(640, 360, 400, 300, 0x1a1a2e)
            .setStrokeStyle(2, 0xc9a227);

        this.add.text(640, 230, skillNames[skillId] + ' Lv.' + skill.level, {
            fontSize: '28px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.add.text(640, 280, `經驗: ${skill.exp}/${expNeeded}`, {
            fontSize: '20px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const closeBtn = this.add.text(640, 480, '關閉', {
            fontSize: '24px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            panel.destroy();
            closeBtn.destroy();
        });
    }

    showAuctionMenu() {
        const panel = this.add.rectangle(640, 360, 500, 400, 0x1a1a2e)
            .setStrokeStyle(2, 0xc9a227);

        this.add.text(640, 180, '拍賣行', {
            fontSize: '32px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const listings = dataManager.data.auction.listings;
        let y = 230;
        listings.forEach((listing, i) => {
            const itemName = listing.itemId;
            const price = listing.price;
            this.add.text(400, y, `${itemName} - ${price}銀兩`, {
                fontSize: '18px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
            });
            const buyBtn = this.add.text(800, y, '購買', {
                fontSize: '18px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            buyBtn.on('pointerdown', () => {
                if (dataManager.removeSilver(price)) {
                    dataManager.addItem(itemName, 1);
                    listings.splice(i, 1);
                    buyBtn.setText('已購買');
                    buyBtn.disableInteractive();
                    this.showAuctionMenu();
                }
            });
            y += 35;
        });

        if (listings.length === 0) {
            this.add.text(640, 300, '暫無拍賣物品', {
                fontSize: '20px', color: '#888888', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);
        }

        const closeBtn = this.add.text(640, 540, '關閉', {
            fontSize: '24px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => {
            panel.destroy();
            closeBtn.destroy();
        });
    }

    updateHUD() {
        const p = dataManager.data.player;
        this.hpBar.width = (p.hp / p.maxHp) * 150;
        this.mpBar.width = (p.mp / p.maxMp) * 150;
        this.silverText.setText('銀兩: ' + p.silver);
        this.levelText.setText('等級: ' + p.level);
    }

    update() {
        if (!this.player) return;

        const speed = 160;
        let vx = 0, vy = 0;

        if (this.cursors.left.isDown || this.wasd.left.isDown) vx = -1;
        else if (this.cursors.right.isDown || this.wasd.right.isDown) vx = 1;

        if (this.cursors.up.isDown || this.wasd.up.isDown) vy = -1;
        else if (this.cursors.down.isDown || this.wasd.down.isDown) vy = 1;

        if (vx !== 0 || vy !== 0) {
            const len = Math.sqrt(vx * vx + vy * vy);
            vx /= len; vy /= len;
        }

        this.player.setVelocity(vx * speed, vy * speed);

        if (this.currentMap !== 'xianyang' && this.grassArea) {
            const bounds = this.grassArea.getBounds();
            if (bounds.contains(this.player.x, this.player.y)) {
                if (Math.random() < 0.005) {
                    this.startRandomBattle();
                }
            }
        }
    }

    startRandomBattle() {
        const maps = {
            zhongnan: ['quanzhen_disciple', 'taoist'],
            guangming: ['mingjiao_member', 'persian']
        };
        const enemies = maps[this.currentMap] || ['quanzhen_disciple'];
        const enemyId = enemies[Math.floor(Math.random() * enemies.length)];

        dataManager.data.inBattle = true;
        this.scene.start('BattleScene', { enemyId });
    }
}