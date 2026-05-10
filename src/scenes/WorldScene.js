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

        this.cameras.main.setBackgroundColor(0x1a1a2e);

        this.drawMap();
        this.drawDecorations();
        this.createPlayer();
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

        this.updateHUD();
    }

    drawMap() {
        const mapConfig = {
            xianyang: {
                ground: { base: 0x3d5c3d, detail: 0x4a6741 },
                name: '襄陽城',
                buildings: [
                    { x: 150, y: 150, w: 200, h: 150, color: 0x8b4513, roof: 0xa0522d },
                    { x: 1050, y: 150, w: 180, h: 130, color: 0x4a4a6a, roof: 0x6a6a8a },
                    { x: 600, y: 100, w: 300, h: 180, color: 0x8b0000, roof: 0xb22222 }
                ],
                trees: [{ x: 80, y: 500 }, { x: 1200, y: 550 }, { x: 200, y: 650 }]
            },
            zhongnan: {
                ground: { base: 0x2d4a2d, detail: 0x3d5c3d },
                name: '終南山',
                buildings: [],
                trees: [
                    { x: 100, y: 200 }, { x: 300, y: 150 }, { x: 500, y: 180 },
                    { x: 800, y: 200 }, { x: 1000, y: 150 }, { x: 1180, y: 250 },
                    { x: 150, y: 550 }, { x: 400, y: 600 }, { x: 900, y: 580 }
                ],
                grassArea: { x: 640, y: 420, w: 700, h: 280 }
            },
            guangming: {
                ground: { base: 0x4a3a2a, detail: 0x5c4a3d },
                name: '光明頂',
                buildings: [],
                trees: [{ x: 100, y: 300 }, { x: 1180, y: 400 }],
                grassArea: { x: 640, y: 420, w: 700, h: 280 }
            }
        };

        const config = mapConfig[this.currentMap] || mapConfig.xianyang;

        this.add.rectangle(640, 360, 1280, 720, config.ground.base);

        for (let x = 0; x < 1280; x += 64) {
            for (let y = 0; y < 720; y += 64) {
                if (Math.random() > 0.7) {
                    this.add.rectangle(x + 32, y + 32, 60, 60, config.ground.detail, 0.2);
                }
            }
        }

        config.buildings.forEach(b => {
            this.add.rectangle(b.x, b.y + b.h/2, b.w, b.h, b.color);
            const roofPoints = [
                b.x - b.w/2, b.y,
                b.x, b.y - b.h/3,
                b.x + b.w/2, b.y
            ];
            const roof = this.add.triangle(0, 0, 0, 0, 0, 0, 0, 0, b.roof);
            roof.setOrigin(0.5, 1);
            roof.setPosition(b.x, b.y);
            this.add.rectangle(b.x, b.y + b.h/2 + 4, b.w + 4, 4, 0x1a1a1a);
        });

        config.trees.forEach(t => this.drawTree(t.x, t.y));

        const titleBg = this.add.rectangle(150, 45, 200, 50, 0x000000, 0.7).setStrokeStyle(2, 0xc9a227);
        this.add.text(150, 45, config.name, {
            fontSize: '32px', color: '#c9a227', fontFamily: 'Microsoft JhengHei', stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);

        if (config.grassArea) {
            this.grassArea = this.add.rectangle(
                config.grassArea.x, config.grassArea.y,
                config.grassArea.w, config.grassArea.h,
                0x228b22, 0.25
            ).setStrokeStyle(1, 0x32cd32, 0.5);
        }
    }

    drawTree(x, y) {
        const trunk = this.add.rectangle(x, y + 30, 20, 50, 0x4a2800);
        const leaves1 = this.add.circle(x, y, 35, 0x228b22);
        const leaves2 = this.add.circle(x, y - 15, 28, 0x2e8b2e);
        const leaves3 = this.add.circle(x, y - 28, 20, 0x32cd32);
    }

    drawDecorations() {
        const decorations = [
            { type: 'rock', x: 500, y: 650 },
            { type: 'rock', x: 750, y: 600 },
            { type: 'well', x: 1100, y: 500 }
        ];

        decorations.forEach(d => {
            if (d.type === 'rock') {
                this.add.ellipse(d.x, d.y, 40, 25, 0x696969);
                this.add.ellipse(d.x, d.y - 5, 35, 20, 0x808080);
            } else if (d.type === 'well') {
                this.add.circle(d.x, d.y, 30, 0x404040);
                this.add.circle(d.x, d.y, 25, 0x1a1a2e);
                this.add.rectangle(d.x - 35, d.y - 30, 10, 40, 0x5c4033);
                this.add.rectangle(d.x + 35, d.y - 30, 10, 40, 0x5c4033);
                this.add.rectangle(d.x, d.y - 40, 80, 10, 0x5c4033);
            }
        });
    }

    createPlayer() {
        const charId = dataManager.data.player.characterId;
        const charData = CHARACTERS[charId];

        const container = this.add.container(640, 500);

        const shadow = this.add.ellipse(0, 25, 50, 20, 0x000000, 0.3);

        const bodyColors = {
            guojing: { main: 0x4169e1, secondary: 0x1e3a8a },
            yangguo: { main: 0xdc143c, secondary: 0x8b0000 },
            xiaolongnu: { main: 0xffd700, secondary: 0xffa500 },
            zhangwuji: { main: 0x9400d3, secondary: 0x4b0082 },
            linghu: { main: 0x228b22, secondary: 0x006400 }
        };
        const colors = bodyColors[charId] || bodyColors.guojing;

        const body = this.add.rectangle(0, 0, 36, 44, colors.main);
        const head = this.add.circle(0, -30, 18, 0xffdbac);
        const hair = this.add.arc(0, -35, 20, 180, 0, false, colors.secondary);
        const eyeL = this.add.circle(-6, -30, 3, 0x000000);
        const eyeR = this.add.circle(6, -30, 3, 0x000000);

        const weapon = this.add.rectangle(22, 0, 8, 40, 0xc0c0c0);
        const weaponHandle = this.add.rectangle(22, 20, 12, 8, 0x8b4513);

        container.add([shadow, body, head, hair, eyeL, eyeR, weapon, weaponHandle]);
        container.setSize(50, 60);

        this.player = this.physics.add.sprite(640, 500, null);
        this.player.setCircle(25);
        this.player.setCollideWorldBounds(true);
        this.player.body.setSize(30, 30);
        this.player.setData('container', container);

        this.tweens.add({
            targets: shadow,
            scaleX: 0.9,
            scaleY: 0.8,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    setupHUD() {
        const p = dataManager.data.player;

        const hudBg = this.add.rectangle(640, 700, 300, 80, 0x000000, 0.7).setStrokeStyle(2, 0xc9a227);

        this.hpBarBg = this.add.rectangle(100, 680, 160, 24, 0x333333).setStrokeStyle(1, 0x666666);
        this.hpBar = this.add.rectangle(100, 680, 156, 20, 0xff0000).setOrigin(0, 0.5);
        this.add.text(100, 656, 'HP', { fontSize: '14px', color: '#ffffff', fontFamily: 'Arial' }).setOrigin(0, 0.5);

        this.hpText = this.add.text(100, 680, `${p.hp}/${p.maxHp}`, {
            fontSize: '12px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.mpBarBg = this.add.rectangle(100, 718, 160, 20, 0x333333).setStrokeStyle(1, 0x666666);
        this.mpBar = this.add.rectangle(100, 718, 156, 16, 0x0000ff).setOrigin(0, 0.5);
        this.add.text(100, 700, 'MP', { fontSize: '12px', color: '#ffffff', fontFamily: 'Arial' }).setOrigin(0, 0.5);

        this.silverText = this.add.text(280, 655, '💰 ' + p.silver, {
            fontSize: '18px', color: '#ffd700', fontFamily: 'Microsoft JhengHei'
        });

        this.levelText = this.add.text(280, 680, 'Lv.' + p.level, {
            fontSize: '16px', color: '#c9a227', fontFamily: 'Arial'
        });

        this.expText = this.add.text(280, 702, 'EXP: ' + p.exp, {
            fontSize: '12px', color: '#aaaaaa', fontFamily: 'Arial'
        });

        const skillX = 900;
        this.add.text(skillX, 638, '【 招式 】', {
            fontSize: '18px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        });

        this.skillLabels = [];
        for (let i = 0; i < 4; i++) {
            const bg = this.add.rectangle(skillX + i * 85, 665, 75, 45, 0x1a1a4a)
                .setStrokeStyle(2, 0x4169e1);

            const label = this.add.text(skillX + i * 85, 660, `${SKILL_NAMES[i]}`, {
                fontSize: '13px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);

            const cost = this.add.text(skillX + i * 85, 678, `MP: ${10 + i * 5}`, {
                fontSize: '10px', color: '#888888', fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.skillLabels.push({ bg, label, cost });
        }
    }

    setupNPCs() {
        if (this.currentMap !== 'xianyang') return;

        const npcs = [
            { id: 'smith', x: 280, y: 350, name: '鐵匠', color: 0xcd853f, icon: '🔨' },
            { id: 'auction', x: 640, y: 280, name: '拍賣行', color: 0xffd700, icon: '🏪' },
            { id: 'herbalist', x: 1000, y: 350, name: '草藥商', color: 0x32cd32, icon: '🌿' }
        ];

        npcs.forEach(npc => {
            const container = this.add.container(npc.x, npc.y);

            const shadow = this.add.ellipse(0, 35, 50, 20, 0x000000, 0.3);
            const body = this.add.rectangle(0, 10, 40, 50, npc.color);
            const head = this.add.circle(0, -20, 18, 0xffdbac);
            const label = this.add.text(0, -55, npc.name, {
                fontSize: '16px', color: '#ffffff', fontFamily: 'Microsoft JhengHei', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5);
            const icon = this.add.text(0, 10, npc.icon, { fontSize: '24px' }).setOrigin(0.5);
            const interactHint = this.add.text(0, 60, '點擊互動', {
                fontSize: '12px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5).setAlpha(0);

            container.add([shadow, body, head, icon, label, interactHint]);

            const hitbox = this.add.rectangle(npc.x, npc.y, 60, 80, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hitbox.setData('npcId', npc.id);
            hitbox.setData('container', container);
            hitbox.setData('hint', interactHint);

            hitbox.on('pointerover', () => {
                this.tweens.add({ targets: interactHint, alpha: 1, duration: 200 });
                container.setScale(1.05);
            });
            hitbox.on('pointerout', () => {
                this.tweens.add({ targets: interactHint, alpha: 0, duration: 200 });
                container.setScale(1);
            });
            hitbox.on('pointerdown', () => this.interactWithNPC(npc.id));
        });
    }

    setupExits() {
        const exitPositions = {
            xianyang: [
                { target: 'zhongnan', x: 640, y: 705, w: 120, h: 25, label: '→ 終南山' },
                { target: 'guangming', x: 1260, y: 360, w: 25, h: 100, label: '光明頂 →' }
            ],
            zhongnan: [{ target: 'xianyang', x: 640, y: 705, w: 120, h: 25, label: '← 襄陽城' }],
            guangming: [{ target: 'xianyang', x: 640, y: 705, w: 120, h: 25, label: '← 襄陽城' }]
        };

        const exits = exitPositions[this.currentMap] || [];

        exits.forEach(exit => {
            const exitBg = this.add.rectangle(exit.x, exit.y, exit.w, exit.h, 0x0000ff, 0.4)
                .setStrokeStyle(2, 0x4169e1)
                .setInteractive({ useHandCursor: true });

            this.add.text(exit.x, exit.y, exit.label, {
                fontSize: '16px', color: '#ffffff', fontFamily: 'Microsoft JhengHei', stroke: '#000000', strokeThickness: 2
            }).setOrigin(0.5);

            const glow = this.add.rectangle(exit.x, exit.y, exit.w + 10, exit.h + 10, 0x4169e1, 0.2);
            glow.setDepth(-1);

            this.tweens.add({
                targets: glow,
                alpha: 0.3,
                duration: 800,
                yoyo: true,
                repeat: -1
            });

            exitBg.on('pointerover', () => exitBg.setFillStyle(0x0000ff, 0.6));
            exitBg.on('pointerout', () => exitBg.setFillStyle(0x0000ff, 0.4));
            exitBg.on('pointerdown', () => {
                dataManager.data.currentMap = exit.target;
                saveSystem.save();
                this.cameras.main.fade(500, 0, 0, 0);
                this.time.delayedCall(500, () => {
                    this.scene.start('WorldScene', { map: exit.target });
                });
            });
        });
    }

    interactWithNPC(npcId) {
        const panelX = 640, panelY = 350;
        const panelW = 420, panelH = 300;

        const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.6).setInteractive();
        const panel = this.add.rectangle(panelX, panelY, panelW, panelH, 0x1a1a2e)
            .setStrokeStyle(3, 0xc9a227);

        this.tweens.add({
            targets: [overlay, panel],
            scaleX: 1,
            scaleY: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });

        switch (npcId) {
            case 'smith': this.showLifeSkillMenu('smithing', panel, overlay); break;
            case 'herbalist': this.showLifeSkillMenu('herbalism', panel, overlay); break;
            case 'auction': this.showAuctionMenu(panel, overlay); break;
        }
    }

    showLifeSkillMenu(skillId, panel, overlay) {
        const skillNames = { herbalism: '采藥', mining: '採礦', smithing: '鑄造', tailoring: '縫紉' };
        const skillIcons = { herbalism: '🌿', mining: '⛏️', smithing: '🔨', tailoring: '🧵' };
        const skills = dataManager.data.lifeSkills;
        const skill = skills[skillId];
        const expNeeded = skill.level * 100;

        const title = this.add.text(640, 220, `${skillIcons[skillId]} ${skillNames[skillId]}`, {
            fontSize: '28px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const levelText = this.add.text(640, 270, `等級: ${skill.level}`, {
            fontSize: '20px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const expBarBg = this.add.rectangle(640, 305, 300, 20, 0x333333).setStrokeStyle(1, 0x666666);
        const expBar = this.add.rectangle(490, 305, (skill.exp / expNeeded) * 300, 16, 0xffd700).setOrigin(0, 0.5);
        const expText = this.add.text(640, 305, `${skill.exp} / ${expNeeded} EXP`, {
            fontSize: '14px', color: '#ffffff', fontFamily: 'Arial'
        }).setOrigin(0.5);

        const desc = this.add.text(640, 350, this.getSkillDescription(skillId), {
            fontSize: '14px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei',
            align: 'center', wordWrap: { width: 350 }
        }).setOrigin(0.5);

        const closeBtn = this.add.rectangle(640, 480, 120, 40, 0x8b0000)
            .setStrokeStyle(2, 0xff4444)
            .setInteractive({ useHandCursor: true });
        const closeText = this.add.text(640, 480, '關閉', {
            fontSize: '18px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        closeBtn.on('pointerover', () => closeBtn.setFillStyle(0xa00000));
        closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x8b0000));
        closeBtn.on('pointerdown', () => this.closePanel([title, levelText, expBarBg, expBar, expText, desc, closeBtn, closeText, panel, overlay]));
    }

    getSkillDescription(skillId) {
        const descriptions = {
            herbalism: '采集珍貴草藥，用於煉丹製藥。\n草藥可用於製作回復藥水。',
            mining: '開採各種礦石，用於鑄造武器。\n礦石是製作裝備的必要材料。',
            smithing: '將礦石鍛造成武器和工具。\n需要採礦技能配合。',
            tailoring: '縫製衣物和飾品。\n皮革可用於製作護甲。'
        };
        return descriptions[skillId] || '';
    }

    showAuctionMenu(panel, overlay) {
        this.add.text(640, 220, '🏪 拍賣行', {
            fontSize: '28px', color: '#ffd700', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const listings = dataManager.data.auction.listings;
        let y = 270;

        if (listings.length === 0) {
            this.add.text(640, 350, '目前沒有拍賣物品', {
                fontSize: '18px', color: '#888888', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);
        } else {
            listings.forEach((listing, i) => {
                const itemBg = this.add.rectangle(640, y, 350, 35, 0x2a2a4a).setStrokeStyle(1, 0x444444);
                this.add.text(450, y, listing.itemId, { fontSize: '14px', color: '#ffffff', fontFamily: 'Microsoft JhengHei' });
                this.add.text(640, y, listing.price + ' 銀兩', { fontSize: '14px', color: '#ffd700', fontFamily: 'Arial' }).setOrigin(0.5);
                this.add.text(830, y, '[' + listing.seller + ']', { fontSize: '12px', color: '#888888', fontFamily: 'Arial' }).setOrigin(0, 0.5);

                const buyBtn = this.add.rectangle(950, y, 60, 28, 0x228b22)
                    .setStrokeStyle(1, 0x32cd32)
                    .setInteractive({ useHandCursor: true });
                const buyText = this.add.text(950, y, '購買', { fontSize: '12px', color: '#ffffff', fontFamily: 'Microsoft JhengHei' }).setOrigin(0.5);

                buyBtn.on('pointerdown', () => {
                    if (dataManager.removeSilver(listing.price)) {
                        dataManager.addItem(listing.itemId, 1);
                        listings.splice(i, 1);
                        this.showAuctionMenu(panel, overlay);
                    }
                });
                y += 40;
            });
        }

        const closeBtn = this.add.rectangle(640, 480, 120, 40, 0x8b0000)
            .setStrokeStyle(2, 0xff4444)
            .setInteractive({ useHandCursor: true });
        this.add.text(640, 480, '關閉', { fontSize: '18px', color: '#ffffff', fontFamily: 'Microsoft JhengHei' }).setOrigin(0.5);

        closeBtn.on('pointerdown', () => this.closePanel([panel, overlay]));
    }

    closePanel(objects) {
        this.tweens.add({
            targets: objects,
            alpha: 0,
            duration: 200,
            onComplete: () => objects.forEach(o => o.destroy())
        });
    }

    updateHUD() {
        const p = dataManager.data.player;
        this.hpBar.width = Math.max(0, (p.hp / p.maxHp) * 156);
        this.mpBar.width = Math.max(0, (p.mp / p.maxMp) * 156);
        this.hpText.setText(`${p.hp}/${p.maxHp}`);
        this.silverText.setText('💰 ' + p.silver);
        this.levelText.setText('Lv.' + p.level);
        this.expText.setText('EXP: ' + p.exp);
    }

    update() {
        if (!this.player) return;

        const container = this.player.getData('container');
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

        if (container) {
            container.setPosition(this.player.x, this.player.y);

            if (vx < 0) container.setScale(-1, 1);
            else if (vx > 0) container.setScale(1, 1);
        }

        if (this.currentMap !== 'xianyang' && this.grassArea) {
            const bounds = this.grassArea.getBounds();
            if (bounds.contains(this.player.x, this.player.y)) {
                if (Math.random() < 0.003) {
                    this.startRandomBattle();
                }
            }
        }

        this.updateHUD();
    }

    startRandomBattle() {
        const maps = {
            zhongnan: ['quanzhen_disciple', 'taoist'],
            guangming: ['mingjiao_member', 'persian']
        };
        const enemies = maps[this.currentMap] || ['quanzhen_disciple'];
        const enemyId = enemies[Math.floor(Math.random() * enemies.length)];

        dataManager.data.inBattle = true;
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('BattleScene', { enemyId });
        });
    }
}