import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { saveSystem } from '../systems/SaveSystem.js';
import { CHARACTERS, CHARACTER_SKILLS, ENCOUNTER_CONFIG, ITEMS, SECTS, SKILL_COSTS } from '../data/GameData.js';
import { sectManager } from '../systems/SectManager.js';
import { questManager } from '../systems/QuestManager.js';
import { chatSystem } from '../systems/ChatSystem.js';

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
        questManager.onArriveMap(this.currentMap);
        questManager.checkCompletion();

        this.cameras.main.setBackgroundColor(0x1a1a2e);

        this.drawMap();
        this.drawDecorations();
        this.createPlayer();
        this.setupHUD();
        this.setupNPCs();
        this.setupQuestNPCs();
        this.setupSectNPCs();
        this.setupFusionNPC();
        this.setupExits();

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.encounterTimer = 0;
        this.setupChatUI();
        this.input.keyboard.on('keydown-V', () => {
            this.scene.pause();
            this.scene.launch('SkillTreeScene');
        });
        this.input.keyboard.on('keydown-C', () => {
            this.scene.pause();
            this.scene.launch('PlayerInfoScene');
        });
        this.input.keyboard.on('keydown-J', () => {
            this.scene.pause();
            this.scene.launch('QuestPanelScene');
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

        const eq = dataManager.data.player.equipped;
        this.equipText = this.add.text(280, 720, '武:' + (ITEMS[eq.weapon] ? ITEMS[eq.weapon].name : '無')
            + ' 防:' + (ITEMS[eq.armor] ? ITEMS[eq.armor].name : '無')
            + ' 飾:' + (ITEMS[eq.accessory] ? ITEMS[eq.accessory].name : '無'), {
            fontSize: '11px', color: '#888888', fontFamily: 'Microsoft JhengHei'
        });

        this.add.text(1200, 20, 'V: 武功', {
            fontSize: '14px', color: '#888888', fontFamily: 'Microsoft JhengHei'
        });

        const skillX = 900;
        this.add.text(skillX, 638, '【 招式 】', {
            fontSize: '18px', color: '#c9a227', fontFamily: 'Microsoft JhengHei'
        });

        this.skillLabels = [];
        const charId = dataManager.data.player.characterId;
        const skills = (CHARACTER_SKILLS && CHARACTER_SKILLS[charId]) || [];
        for (let i = 0; i < 4; i++) {
            const bg = this.add.rectangle(skillX + i * 85, 665, 75, 45, 0x1a1a4a)
                .setStrokeStyle(2, 0x4169e1);

            const skillName = skills[i] ? skills[i].name : `招式${i + 1}`;
            const mpCost = skills[i] ? skills[i].cost : 10;

            const label = this.add.text(skillX + i * 85, 660, skillName, {
                fontSize: '13px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);

            const cost = this.add.text(skillX + i * 85, 678, `MP: ${mpCost}`, {
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

    setupSectNPCs() {
        const sects = Object.entries(SECTS).filter(([key, s]) => s.map === this.currentMap);
        if (sects.length === 0) return;

        sects.forEach(([key, sect]) => {
            const x = sect.npcX || 640;
            const y = sect.npcY || 400;
            const container = this.add.container(x, y);

            const shadow = this.add.ellipse(0, 35, 50, 20, 0x000000, 0.3);
            const body = this.add.rectangle(0, 10, 40, 50, 0xc9a227);
            const head = this.add.circle(0, -20, 18, 0xffdbac);
            const label = this.add.text(0, -55, sect.npcName + ' [' + sect.name + ']', {
                fontSize: '14px', color: '#ffd700', fontFamily: 'serif',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5);
            const icon = this.add.text(0, 10, '👤', { fontSize: '24px' }).setOrigin(0.5);
            const interactHint = this.add.text(0, 60, '點擊互動', {
                fontSize: '12px', color: '#c9a227', fontFamily: 'serif'
            }).setOrigin(0.5).setAlpha(0);

            container.add([shadow, body, head, icon, label, interactHint]);

            const hitbox = this.add.rectangle(x, y, 60, 80, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hitbox.setData('npcId', 'sect_' + key);
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
            hitbox.on('pointerdown', () => this.interactWithSectNPC(key));
        });
    }

    setupFusionNPC() {
        const x = 150, y = 600;
        const container = this.add.container(x, y);
        const shadow = this.add.ellipse(0, 35, 50, 20, 0x000000, 0.3);
        const body = this.add.rectangle(0, 10, 40, 50, 0x9370db);
        const head = this.add.circle(0, -20, 18, 0xffdbac);
        const label = this.add.text(0, -55, '隱士高人', {
            fontSize: '14px', color: '#9370db', fontFamily: 'serif', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5);
        const icon = this.add.text(0, 10, '🧙', { fontSize: '24px' }).setOrigin(0.5);
        const interactHint = this.add.text(0, 60, '點擊互動', {
            fontSize: '12px', color: '#c9a227', fontFamily: 'serif'
        }).setOrigin(0.5).setAlpha(0);

        container.add([shadow, body, head, icon, label, interactHint]);

        const hitbox = this.add.rectangle(x, y, 60, 80, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });
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
        hitbox.on('pointerdown', () => {
            this.scene.pause();
            this.scene.launch('FusionScene');
        });
    }

    setupQuestNPCs() {
        if (this.currentMap !== 'xianyang') return;

        const npcs = [
            { id: 'escort', x: 500, y: 150, name: '鏢局', color: 0xdaa520, icon: '🛡' },
            { id: 'bounty', x: 380, y: 550, name: '告示板', color: 0x8b4513, icon: '📋' },
        ];

        npcs.forEach(npc => {
            const container = this.add.container(npc.x, npc.y);
            const shadow = this.add.ellipse(0, 35, 50, 20, 0x000000, 0.3);
            const body = this.add.rectangle(0, 10, 40, 50, npc.color);
            const head = this.add.circle(0, -20, 18, 0xffdbac);
            const label = this.add.text(0, -55, npc.name, {
                fontSize: '14px', color: '#ffd700', fontFamily: 'serif',
                stroke: '#000', strokeThickness: 2
            }).setOrigin(0.5);
            const icon = this.add.text(0, 10, npc.icon, { fontSize: '24px' }).setOrigin(0.5);
            const interactHint = this.add.text(0, 60, '點擊互動', {
                fontSize: '12px', color: '#c9a227', fontFamily: 'serif'
            }).setOrigin(0.5).setAlpha(0);

            container.add([shadow, body, head, icon, label, interactHint]);

            const hitbox = this.add.rectangle(npc.x, npc.y, 60, 80, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });
            hitbox.setData('npcId', 'quest_' + npc.id);
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
            hitbox.on('pointerdown', () => this.interactWithQuestNPC(npc.id));
        });
    }

    interactWithQuestNPC(npcId) {
        const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.7).setInteractive();
        const panel = this.add.rectangle(640, 360, 500, 420, 0x1a1a2e).setStrokeStyle(3, 0xc9a227);
        const elements = [overlay, panel];

        let iy = 120;
        const titles = { escort: '🛡 鏢局護送', bounty: '📋 賞金任務' };
        const title = this.add.text(640, iy, titles[npcId] || '任務', {
            fontSize: '26px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(title);
        iy += 45;

        const quests = {
            escort: [{ id: 'escort_1', name: '護送鏢物 → 光明頂', desc: '鏢局委託，將鏢物送至光明頂' }],
            bounty: [
                { id: 'bounty_1', name: '擊敗全真弟子 ×5', desc: '賞金：消除全真弟子的威脅' },
                { id: 'bounty_2', name: '擊敗明教教徒 ×3', desc: '賞金：消除明教教徒的威脅' },
            ],
        };

        const npcQuests = quests[npcId] || [];
        npcQuests.forEach(q => {
            const row = this.add.text(640, iy, `${q.name}`, {
                fontSize: '16px', fill: '#fff', fontFamily: 'serif',
                backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            row.on('pointerdown', () => {
                const result = questManager.startQuest(q.id);
                if (result.ok) {
                    row.setColor('#88ff88');
                    row.setText(`${q.name} ✅`);
                } else {
                    row.setColor('#ff6666');
                    this.time.delayedCall(2000, () => {
                        row.setColor('#fff');
                        row.setText(`${q.name}`);
                    });
                }
            });
            elements.push(row);
            iy += 32;
        });

        iy += 30;
        const closeBtn = this.add.rectangle(640, iy + 20, 100, 36, 0x8b0000)
            .setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true });
        const closeLabel = this.add.text(640, iy + 20, '關閉', {
            fontSize: '16px', fill: '#fff', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(closeBtn, closeLabel);
        closeBtn.on('pointerdown', () => this.closePanel(elements));
    }

    interactWithSectNPC(sectKey) {
        const p = dataManager.data.player;
        const sect = SECTS[sectKey];

        const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.7).setInteractive();
        const panel = this.add.rectangle(640, 360, 500, 400, 0x1a1a2e).setStrokeStyle(3, 0xc9a227);
        const elements = [overlay, panel];

        let iy = 140;
        const title = this.add.text(640, iy, `${sect.name} — ${sect.npcName}`, {
            fontSize: '26px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(title);
        iy += 40;

        const isMember = p.sect === sectKey;

        if (!p.sect) {
            const canJoin = sectManager.canJoin(sectKey);
            const joinText = canJoin
                ? `善惡要求：${sect.karmaRequirement}（當前：${p.karma}） ✅`
                : `善惡要求：${sect.karmaRequirement}（當前：${p.karma}） ❌`;
            const infoText = this.add.text(640, iy, joinText, {
                fontSize: '16px', fill: canJoin ? '#88ff88' : '#ff8888', fontFamily: 'serif'
            }).setOrigin(0.5);
            elements.push(infoText);
            iy += 30;

            const joinBtn = this.add.text(640, iy + 10, '[ 加入門派 ]', {
                fontSize: '20px', fill: canJoin ? '#ffd700' : '#666', fontFamily: 'serif',
                backgroundColor: '#333', padding: { x: 12, y: 6 }
            }).setOrigin(0.5);
            elements.push(joinBtn);

            if (canJoin) {
                joinBtn.setInteractive({ useHandCursor: true });
                joinBtn.on('pointerdown', () => {
                    const result = sectManager.joinSect(sectKey);
                    if (result.ok) {
                        this.closePanel(elements);
                        this.updateHUD();
                    }
                });
            }
            iy += 50;
        } else if (isMember) {
            const repText = this.add.text(640, iy, `門派聲望：${p.sectReputation}`, {
                fontSize: '18px', fill: '#fff', fontFamily: 'serif'
            }).setOrigin(0.5);
            elements.push(repText);
            iy += 35;

            const learnBtn = this.add.text(640, iy, '[ 學習武功 ]', {
                fontSize: '20px', fill: '#ffd700', fontFamily: 'serif',
                backgroundColor: '#333', padding: { x: 12, y: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            elements.push(learnBtn);
            learnBtn.on('pointerdown', () => {
                this.closePanel(elements);
                this.showArtLearningPanel(sectKey);
            });
            iy += 45;

            const leaveBtn = this.add.text(640, iy, '[ 叛離門派 ]', {
                fontSize: '18px', fill: '#ff6666', fontFamily: 'serif',
                backgroundColor: '#333', padding: { x: 12, y: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            elements.push(leaveBtn);
            leaveBtn.on('pointerdown', () => {
                const result = sectManager.leaveSect();
                if (result.ok) {
                    this.closePanel(elements);
                    this.updateHUD();
                }
            });
            iy += 45;
        } else {
            const otherText = this.add.text(640, iy, `你已是 ${SECTS[p.sect]?.name || '其他'} 門人`, {
                fontSize: '18px', fill: '#888', fontFamily: 'serif'
            }).setOrigin(0.5);
            elements.push(otherText);
            iy += 40;
        }

        iy += 30;
        const closeBtn = this.add.rectangle(640, iy + 20, 100, 36, 0x8b0000)
            .setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true });
        const closeLabel = this.add.text(640, iy + 20, '關閉', {
            fontSize: '16px', fill: '#fff', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(closeBtn, closeLabel);
        closeBtn.on('pointerdown', () => this.closePanel(elements));
    }

    showArtLearningPanel(sectKey) {
        const sect = SECTS[sectKey];
        const learnable = sectManager.getLearnableArts(sectKey);
        const p = dataManager.data.player;

        const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.7).setInteractive();
        const panel = this.add.rectangle(640, 360, 520, 480, 0x1a1a2e).setStrokeStyle(3, 0xc9a227);
        const elements = [overlay, panel];

        let iy = 100;
        const title = this.add.text(640, iy, `學習武功 — ${sect.name}  學點：${p.studyPoints}`, {
            fontSize: '22px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(title);
        iy += 40;

        if (learnable.length === 0) {
            const empty = this.add.text(640, iy, '暫無可學武功（檢查門派聲望或學點）', {
                fontSize: '16px', fill: '#888', fontFamily: 'serif'
            }).setOrigin(0.5);
            elements.push(empty);
        } else {
            learnable.forEach(art => {
                const cost = SKILL_COSTS.studyPointsLearn[art.tier];
                const tierLabel = { basic: '初階', mid: '中階', ultimate: '絕學' }[art.tier];
                const row = this.add.text(640, iy, `${tierLabel} ${art.name}  [${cost} 學點]`, {
                    fontSize: '16px', fill: '#fff', fontFamily: 'serif',
                    backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                row.on('pointerdown', () => {
                    const result = sectManager.learnArt(sectKey, art.id);
                    if (result.ok) {
                        this.closePanel(elements);
                    } else {
                        row.setText(`${art.name} - ${result.reason}`);
                        row.setColor('#ff6666');
                    }
                });
                elements.push(row);
                iy += 32;
            });
        }

        iy += 30;
        const closeBtn = this.add.rectangle(640, iy + 20, 100, 36, 0x8b0000)
            .setStrokeStyle(2, 0xff4444).setInteractive({ useHandCursor: true });
        const closeLabel = this.add.text(640, iy + 20, '關閉', {
            fontSize: '16px', fill: '#fff', fontFamily: 'serif'
        }).setOrigin(0.5);
        elements.push(closeBtn, closeLabel);
        closeBtn.on('pointerdown', () => this.closePanel(elements));
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

    update(time, delta) {
        if (!this.player || this.chatActive) return;

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
                const moving = vx !== 0 || vy !== 0;
                if (moving) {
                    this.encounterTimer += delta;
                    if (this.encounterTimer >= ENCOUNTER_CONFIG.interval) {
                        this.encounterTimer = 0;
                        if (Math.random() < ENCOUNTER_CONFIG.baseChance) {
                            this.startRandomBattle();
                        }
                    }
                }
            }
        }

        const p = dataManager.data.player;
        if (p.hp < p.maxHp) {
            p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.01 * delta / 1000);
        }
        if (p.mp < p.maxMp) {
            p.mp = Math.min(p.maxMp, p.mp + p.maxMp * 0.005 * delta / 1000);
        }

        this.updateHUD();
    }

    startRandomBattle() {
        const enemies = ENCOUNTER_CONFIG.mapEnemies[this.currentMap] || ['quanzhen_disciple'];
        const enemyId = enemies[Math.floor(Math.random() * enemies.length)];

        dataManager.data.inBattle = true;
        this.cameras.main.fade(300, 0, 0, 0);
        this.time.delayedCall(300, () => {
            this.scene.start('BattleScene', { enemyId });
        });
    }

    setupChatUI() {
        this.chatActive = false;
        this.chatMessages = [];
        this.chatChannel = 'all';

        this.chatBg = this.add.rectangle(0, 520, 300, 180, 0x000000, 0.5).setOrigin(0, 0).setStrokeStyle(1, 0x444444).setDepth(20);
        this.chatText = this.add.text(5, 525, '', {
            fontSize: '12px', fill: '#aaa', fontFamily: 'serif', lineSpacing: 2, wordWrap: { width: 290 }
        }).setDepth(20);

        this.inputText = '';
        this.chatInputBox = this.add.rectangle(5, 700, 290, 20, 0x222222, 0.9).setOrigin(0, 0).setStrokeStyle(1, 0x666666).setDepth(20).setVisible(false);
        this.chatInputText = this.add.text(8, 702, '', {
            fontSize: '13px', fill: '#fff', fontFamily: 'serif'
        }).setDepth(20).setVisible(false);

        this.chatChannelText = this.add.text(5, 500, '頻道: /綜合 /區域 /門派  |  Enter 聊天', {
            fontSize: '11px', fill: '#666', fontFamily: 'serif'
        }).setDepth(20);

        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.chatActive) {
                this.chatActive = true;
                this.chatInputBox.setVisible(true);
                this.chatInputText.setVisible(true);
                this.inputText = '';
            } else {
                if (this.inputText.startsWith('/')) {
                    const parts = this.inputText.slice(1).split(' ');
                    const cmd = parts[0];
                    if (cmd === '綜合') this.chatChannel = 'all';
                    else if (cmd === '區域') this.chatChannel = 'area';
                    else if (cmd === '門派') this.chatChannel = 'sect';
                    else this.chatChannel = 'all';
                } else if (this.inputText.trim()) {
                    this.addChatMessage(this.inputText);
                }
                this.chatActive = false;
                this.chatInputBox.setVisible(false);
                this.chatInputText.setVisible(false);
                this.inputText = '';
                this.chatInputText.setText('');
            }
        });

        this.input.keyboard.on('keydown-ESC', () => {
            if (this.chatActive) {
                this.chatActive = false;
                this.chatInputBox.setVisible(false);
                this.chatInputText.setVisible(false);
                this.inputText = '';
                this.chatInputText.setText('');
            }
        });

        this.input.keyboard.on('keydown', (event) => {
            if (!this.chatActive) return;
            if (event.key === 'Backspace') {
                this.inputText = this.inputText.slice(0, -1);
            } else if (event.key === 'Enter' || event.key === 'Escape') {
                return;
            } else if (event.key.length === 1) {
                this.inputText += event.key;
            }
            this.chatInputText.setText('> ' + this.inputText.slice(-38));
        });
    }

    addChatMessage(text) {
        this.chatMessages.push({ text, time: Date.now() });
        if (this.chatMessages.length > 20) this.chatMessages.shift();
        const lines = this.chatMessages.map(m => m.text).join('\n');
        this.chatText.setText(lines);
    }
}