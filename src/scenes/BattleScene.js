import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { saveSystem } from '../systems/SaveSystem.js';
import { soundManager } from '../systems/SoundManager.js';
import { CHARACTERS, ENEMIES, CHARACTER_SKILLS, SKILL_TREE_CONFIG, ATTRIBUTE_CONFIG, RAGE_CONFIG, ULTIMATE_SKILLS, ATB_SPEEDS_CONFIG, ITEMS, ENEMY_TIERS, rollEnemyTier, LOOT_TABLES } from '../data/GameData.js';
import { sectManager } from '../systems/SectManager.js';

export default class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BattleScene' });
    }

    init(data) {
        this.enemyId = data.enemyId || 'quanzhen_disciple';
        this.enemyTier = rollEnemyTier();
    }

    create() {
        this.battleActive = true;
        this.playerTurn = false;
        this.playerAtb = 0;
        this.enemyAtb = 0;
        this.enemyReady = false;
        this.atbActive = true;
        const attrs = dataManager.data.player.attributes || {};
        const agility = attrs.bra !== undefined ? attrs.bra : (dataManager.data.player.agility || 10);
        this.playerSpeed = agility * ATB_SPEEDS_CONFIG.playerSpeedMultiplier;
        this.rage = 0;
        this.rageFullNotified = false;

        const charId = dataManager.data.player.characterId;
        const charData = CHARACTERS[charId];
        const enemyData = ENEMIES[this.enemyId];

        const equippedIds = dataManager.data.player.equippedSkills || [];
        this.equippedSkills = equippedIds.map(id => {
            if (!id) return null;
            const def = sectManager.getArtDefinition(id);
            if (!def) return null;
            const entry = dataManager.data.player.martialArts.find(a => a.id === id);
            return { id, def, level: entry ? entry.level : 1 };
        });
        while (this.equippedSkills.length < 4) this.equippedSkills.push(null);
        this.charSkills = this.equippedSkills.map(s => s ? s.def : null);
        this.skillLevels = this.equippedSkills.map(s => s ? s.level : 0);

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
        this.input.keyboard.on('keydown-R', () => this.useUltimate());
        this.input.keyboard.on('keydown-F', () => this.defend());

        this.statuses = { player: [], enemy: [] };
        this.statusIcons = { player: null, enemy: null };

        this.cameras.main.flash(300, 255, 255, 255);
        this.cameras.main.shake(200, 0.005);

        if (this.enemyTier === 'boss') {
            this.cameras.main.shake(400, 0.01);
        }
    }

    update(time, delta) {
        if (!this.battleActive || !this.atbActive) return;

        const fillRate = ATB_SPEEDS_CONFIG.fillRate;
        this.playerAtb = Math.min(ATB_SPEEDS_CONFIG.maxAtb, this.playerAtb + this.playerSpeed * delta * fillRate);
        this.enemyAtb = Math.min(ATB_SPEEDS_CONFIG.maxAtb, this.enemyAtb + this.enemySpeed * delta * fillRate);

        this.updateAtbBars();
        this.updateTurnPreview();

        if (this.playerAtb >= ATB_SPEEDS_CONFIG.maxAtb && !this.playerTurn && !this.enemyReady) {
            this.playerTurn = true;
            this.atbActive = false;
            this.log('選擇你的行動！');
        }

        if (this.enemyAtb >= ATB_SPEEDS_CONFIG.maxAtb && !this.enemyReady && !this.playerTurn) {
            this.enemyReady = true;
            this.atbActive = false;
            this.time.delayedCall(500, () => this.enemyTurn());
        }
    }

    updateTurnPreview() {
        const order = [];
        const pPct = this.playerAtb / ATB_SPEEDS_CONFIG.maxAtb;
        const ePct = this.enemyAtb / ATB_SPEEDS_CONFIG.maxAtb;

        if (this.playerTurn) {
            order.push('▶ 玩家（行動中）');
        } else if (this.enemyReady) {
            order.push('▶ ' + ENEMIES[this.enemyId].name + '（行動中）');
        } else {
            const fillFactor = ATB_SPEEDS_CONFIG.fillRate;
            const pTime = pPct >= 1 ? 0 : ((1 - pPct) * ATB_SPEEDS_CONFIG.maxAtb) / (this.playerSpeed * fillFactor) / 60;
            const eTime = ePct >= 1 ? 0 : ((1 - ePct) * ATB_SPEEDS_CONFIG.maxAtb) / (this.enemySpeed * fillFactor) / 60;

            if (pTime <= eTime) {
                order.push('① 玩家 (' + pTime.toFixed(1) + 's)');
                order.push('② ' + ENEMIES[this.enemyId].name + ' (' + eTime.toFixed(1) + 's)');
            } else {
                order.push('① ' + ENEMIES[this.enemyId].name + ' (' + eTime.toFixed(1) + 's)');
                order.push('② 玩家 (' + pTime.toFixed(1) + 's)');
            }
        }

        if (this.turnPreviewText) {
            this.turnPreviewText.setText(order.join('\n'));
        }
    }

    updateAtbBars() {
        const maxW = 296;
        this.playerAtbBar.width = (this.playerAtb / ATB_SPEEDS_CONFIG.maxAtb) * maxW;
        this.enemyAtbBar.width = (this.enemyAtb / ATB_SPEEDS_CONFIG.maxAtb) * maxW;

        this.playerAtbBar.setAlpha(this.playerAtb >= ATB_SPEEDS_CONFIG.maxAtb ? 1 : 0.6);
        this.enemyAtbBar.setAlpha(this.enemyAtb >= ATB_SPEEDS_CONFIG.maxAtb ? 1 : 0.6);
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
        const tierCfg = ENEMY_TIERS[this.enemyTier];
        const namePrefix = tierCfg.label ? tierCfg.label + ' ' : '';
        this.enemyHp = Math.floor(enemyData.hp * tierCfg.hpMul);
        this.enemyMaxHp = this.enemyHp;
        this.enemyAttack = Math.floor(enemyData.attack * tierCfg.atkMul);
        this.enemyDefense = Math.floor((enemyData.defense || 0) * tierCfg.defMul);
        this.enemySpeed = enemyData.speed || 10;

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
        this.add.text(950, 250, namePrefix + enemyData.name, {
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

        this.add.text(300, 88, 'ATB', { fontSize: '16px', color: '#ffffff', fontFamily: 'Arial' }).setOrigin(0.5);
        this.playerAtbBg = this.add.rectangle(500, 80, 300, 20, 0x333333).setStrokeStyle(1, 0x666666);
        this.playerAtbBar = this.add.rectangle(500, 80, 0, 16, 0x4488ff).setOrigin(0, 0.5);
        this.add.text(350, 80, '玩家', { fontSize: '12px', color: '#88bbff', fontFamily: 'Microsoft JhengHei' }).setOrigin(0, 0.5);

        this.enemyAtbBg = this.add.rectangle(500, 110, 300, 20, 0x333333).setStrokeStyle(1, 0x666666);
        this.enemyAtbBar = this.add.rectangle(500, 110, 0, 16, 0xff4444).setOrigin(0, 0.5);
        this.add.text(350, 110, ENEMIES[this.enemyId].name, { fontSize: '12px', color: '#ff8888', fontFamily: 'Microsoft JhengHei' }).setOrigin(0, 0.5);

        this.add.text(860, 75, '下一步', {
            fontSize: '14px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei'
        });
        this.turnPreviewText = this.add.text(860, 95, '', {
            fontSize: '12px', color: '#ffffff', fontFamily: 'Microsoft JhengHei',
            lineSpacing: 4
        });

        this.rageBg = this.add.rectangle(640, 140, 400, 18, 0x333333).setStrokeStyle(1, 0xff6600);
        this.rageBar = this.add.rectangle(440, 140, 0, 14, 0xff4400).setOrigin(0, 0.5);
        this.rageLabel = this.add.text(640, 158, '怒氣: 0 / ' + RAGE_CONFIG.maxRage, {
            fontSize: '11px', color: '#ff6600', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.battleLog = this.add.text(100, 560, '', {
            fontSize: '14px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei',
            lineSpacing: 6, wordWrap: { width: 1100 }
        });

        this.add.text(100, 590, '💡 數字鍵 1-4 招式　空白鍵普攻　F 防禦　R 絕招', {
            fontSize: '12px', color: '#666666', fontFamily: 'Microsoft JhengHei'
        });

        const playerStats = this.add.text(20, 20, '', {
            fontSize: '14px', color: '#ffffff', fontFamily: 'Arial'
        });
    }

    createSkillButtons() {
        const startX = 450;
        const y = 650;

        for (let i = 0; i < Math.max(4, this.charSkills.length); i++) {
            const skill = this.charSkills[i];
            const btn = this.add.rectangle(startX + i * 90, y, 80, 50, 0x1a1a4a)
                .setStrokeStyle(2, skill ? 0xc9a227 : 0x444444)
                .setInteractive({ useHandCursor: true });

            const skillName = skill ? skill.name : `空`;
            const skillCost = skill ? (skill.mp || skill.cost || 10) : 0;

            const label = this.add.text(startX + i * 90, y - 8, skillName, {
                fontSize: '13px', color: skill ? '#ffffff' : '#666666', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0.5);

            const cost = this.add.text(startX + i * 90, y + 12, `MP: ${skillCost}`, {
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

    defend() {
        if (!this.battleActive || !this.playerTurn) return;
        this.isDefending = true;
        this.playerTurn = false;
        this.log('🛡️ 進入防禦姿態！');
        this.addRage(RAGE_CONFIG.gainPerTurn);
        this.tickStatuses('enemy');
        if (this.enemyHp <= 0) {
            this.endBattle(true);
            return;
        }
        this.playerAtb = 0;
        this.atbActive = true;
    }

    attack() {
        if (!this.battleActive || !this.playerTurn) return;

        const attrs = dataManager.data.player.attributes || {};
        const str = attrs.str !== undefined ? attrs.str : (dataManager.data.player.strength || 10);
        const damage = 10 + Math.floor(str * 0.5);
        this.playerAttackAnimation();
        this.time.delayedCall(300, () => this.dealDamageToEnemy(damage));
    }

    useSkill(index) {
        if (!this.battleActive || !this.playerTurn) return;

        const skill = this.charSkills[index];
        if (!skill) return;
        const skillLevel = this.skillLevels[index] || 0;
        const mpCost = skill.mp || skill.cost || 10;

        if (this.playerMp < mpCost) {
            this.log('⚠️ MP不足！');
            this.flashText('MP不足！', 0xff0000);
            return;
        }

        this.playerMp -= mpCost;

        if (skill.mpRestore) {
            this.playerMp = Math.min(this.playerMaxMp, this.playerMp + Math.floor(this.playerMaxMp * skill.mpRestore));
            this.log(`✨ 使用 ${skill.name}，恢復 MP！`);
            this.endPlayerTurn();
            return;
        }

        if (skill.healRatio) {
            const heal = Math.floor(this.playerMaxHp * skill.healRatio);
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + heal);
            this.updatePlayerHpBar();
            this.log(`✨ 使用 ${skill.name}，恢復 HP ${heal}！`);
            this.endPlayerTurn();
            return;
        }

        if (skill.cleanse) {
            this.statuses.player = [];
            this.log(`✨ 使用 ${skill.name}，解除所有負面狀態！`);
            this.endPlayerTurn();
            return;
        }

        this.log(`✨ 使用 ${skill.name}！`);
        soundManager.play('skill');
        this.skillAnimation(index);
        this.time.delayedCall(400, () => {
            const damage = this.calculateSkillDamage(skill, skillLevel, index);
            this.dealDamageToEnemy(damage, skill);
        });
    }

    calculateSkillDamage(skill, skillLevel, skillIndex) {
        const attrs = dataManager.data.player.attributes || {};
        const str = attrs.str !== undefined ? attrs.str : (dataManager.data.player.strength || 10);
        const wis = attrs.wis !== undefined ? attrs.wis : (dataManager.data.player.innerPower || 10);
        const bra = attrs.bra !== undefined ? attrs.bra : 10;
        const baseAtk = 10 + str * 0.5;

        const damageRatio = skill.ratio || skill.damageRatio || 1.0;
        let damage = baseAtk * damageRatio;

        if (skill.type === 'inner') {
            damage += wis * 0.3;
        }

        damage *= (1 + (skillLevel - 1) * 0.08);

        let critRate = 0.1 + bra * 0.005;
        if (skill.critBonus) critRate += skill.critBonus;

        const isCrit = Math.random() < critRate;
        if (isCrit) {
            damage *= 1.5;
            soundManager.play('crit');
            this.hitFreeze(120);
            this.log('💥 暴擊！');
        }

        if (skill.selfDamage) {
            const selfDmg = Math.floor(this.playerMaxHp * skill.selfDamage);
            this.playerHp -= selfDmg;
            this.updatePlayerHpBar();
            this.log(`⚠️ 受到 ${selfDmg} 自損傷害！`);
        }

        if (skillIndex !== null && skillIndex !== undefined) {
            const charId = dataManager.data.player.characterId;
            const skillAttr = ATTRIBUTE_CONFIG.skillAttributes[charId];
            if (skillAttr && skillAttr[skillIndex]) {
                const attrBonus = this.getAttributeBonus(skillAttr[skillIndex], this.enemyId);
                damage = Math.floor(damage * attrBonus);
            }
        }

        return Math.floor(damage);
    }

    getAttributeBonus(skillAttr, enemyId) {
        if (!skillAttr) return 1.0;

        const enemyAttrMap = {
            quanzhen_disciple: 'yanggang',
            taoist: 'yinrou',
            mingjiao_member: 'gangmeng',
            persian: 'yanggang'
        };
        const enemyAttr = enemyAttrMap[enemyId] || 'gangmeng';

        if (ATTRIBUTE_CONFIG.advantages[skillAttr] === enemyAttr) {
            this.log('⚡ ' + ATTRIBUTE_CONFIG.icons[skillAttr] + ' ' + ATTRIBUTE_CONFIG.names[skillAttr] + ' 克制 ' + ATTRIBUTE_CONFIG.names[enemyAttr] + '！傷害 +30%');
            return ATTRIBUTE_CONFIG.damageMultiplier;
        }
        if (ATTRIBUTE_CONFIG.disadvantage[skillAttr] === enemyAttr) {
            this.log('⚠ ' + ATTRIBUTE_CONFIG.icons[skillAttr] + ' ' + ATTRIBUTE_CONFIG.names[skillAttr] + ' 被 ' + ATTRIBUTE_CONFIG.names[enemyAttr] + ' 克制！傷害 -30%');
            return (2 - ATTRIBUTE_CONFIG.damageMultiplier);
        }
        return 1.0;
    }

    addRage(amount) {
        if (!this.battleActive) return;
        const boost = this.getEquipmentStat('rageBoost', 1);
        this.rage = Math.min(RAGE_CONFIG.maxRage, this.rage + Math.floor(amount * boost));
        this.updateRageUI();
        if (this.rage >= RAGE_CONFIG.maxRage && !this.rageFullNotified) {
            this.rageFullNotified = true;
            this.log('🔥 怒氣已滿！按 R 釋放絕招！');
        }
    }

    updateRageUI() {
        const maxW = 396;
        if (this.rageBar) {
            this.rageBar.width = (this.rage / RAGE_CONFIG.maxRage) * maxW;
        }
        if (this.rageLabel) {
            this.rageLabel.setText('怒氣: ' + this.rage + ' / ' + RAGE_CONFIG.maxRage);
        }
    }

    useUltimate() {
        if (!this.battleActive || !this.playerTurn || this.rage < RAGE_CONFIG.maxRage) return;

        this.rage = 0;
        this.rageFullNotified = false;
        this.updateRageUI();

        const charId = dataManager.data.player.characterId;
        const ultimate = ULTIMATE_SKILLS[charId];
        if (!ultimate) return;
        this.log('🔥 釋放絕招：' + ultimate.name + '！');

        if (ultimate.damageRatio > 0) {
            const attrs = dataManager.data.player.attributes || {};
            const str = attrs.str !== undefined ? attrs.str : (dataManager.data.player.strength || 10);
            const baseAtk = 10 + str * 0.5;
            const weaponAtk = this.getEquipmentStat('attack', 0);
            const damage = Math.floor((baseAtk + weaponAtk) * ultimate.damageRatio);
            this.dealDamageToEnemy(damage, { ignoreDef: ultimate.ignoreDef || false, hits: ultimate.hits || 1 });
            return;
        }

        if (ultimate.healRatio) {
            this.playerHp = Math.min(this.playerMaxHp, this.playerHp + Math.floor(this.playerMaxHp * ultimate.healRatio));
            this.updatePlayerHpBar();
        }

        if (ultimate.reflect) {
            this.log('🛡️ 乾坤大挪移發動，反彈所有傷害 3 回合！');
        }

        if (ultimate.status) {
            this.applyStatus('enemy', ultimate.status.type, ultimate.status.duration);
        }

        this.endPlayerTurn();
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
        const charId = dataManager.data.player.characterId;

        const animations = {
            guojing: [
                () => this.animGuojingPalm(),
                () => this.animGuojingFist(),
                () => this.animDualStrike(0xffd700),
                () => this.animInnerWave(0x4488ff)
            ],
            yangguo: [
                () => this.animDarkSlash(0x8b0000),
                () => this.animHeavySlash(0x333333),
                () => this.animQuickShot(0x66ccff),
                () => this.animHealRing(0xff88ff)
            ],
            xiaolongnu: [
                () => this.animSwiftSlash(0xffffff),
                () => this.animDualSlash(0xccccff),
                () => this.animSpread(0x88ccff),
                () => this.animIceNeedle(0x88ddff)
            ],
            zhangwuji: [
                () => this.animShield(0xffd700),
                () => this.animFist(0xff3300),
                () => this.animFlame(0xff6600),
                () => this.animHealRing(0x44ff44)
            ],
            linghu: [
                () => this.animQuickSlash(0x4488ff),
                () => this.animVortex(0x9944ff),
                () => this.animCleanse(0x88ff88),
                () => this.animStunSlash(0x44aaff)
            ]
        };

        this.tweens.add({
            targets: this.playerContainer,
            x: this.playerContainer.x + 80,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });

        const charAnim = animations[charId];
        if (charAnim && charAnim[index]) {
            charAnim[index]();
        } else {
            this.genericSkillAnimation(index);
        }
    }

    genericSkillAnimation(index) {
        const colors = [0xffffff, 0x4169e1, 0x9400d3, 0xffd700];
        this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y, colors[index]);
    }

    animGuojingPalm() {
        this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y, 0xffd700, 8);
    }
    animGuojingFist() {
        this.launchHits(0x8b6914, 3);
    }
    animDualStrike(color) {
        this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y - 20, color, 3);
        this.time.delayedCall(200, () => this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y + 20, color, 3));
    }
    animInnerWave(color) {
        this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y, color, 6);
    }
    animDarkSlash(color) {
        this.createSlashEffect(this.playerContainer.x + 120, this.playerContainer.y, color, 2);
    }
    animHeavySlash(color) {
        this.createSlashEffect(this.playerContainer.x + 140, this.playerContainer.y - 20, color, 2.5);
    }
    animQuickShot(color) {
        this.launchOrbs(this.playerContainer.x + 100, this.playerContainer.y - 30, color, 1);
    }
    animHealRing(color) {
        const ring = this.add.circle(this.playerContainer.x, this.playerContainer.y, 20, color, 0.4);
        this.tweens.add({
            targets: ring, scaleX: 2.5, scaleY: 2.5, alpha: 0, duration: 600,
            onComplete: () => ring.destroy()
        });
    }
    animSwiftSlash(color) {
        this.createSlashEffect(this.playerContainer.x + 100, this.playerContainer.y, color, 1.2);
    }
    animDualSlash(color) {
        this.createSlashEffect(this.playerContainer.x + 100, this.playerContainer.y - 15, color, 1);
        this.time.delayedCall(150, () => this.createSlashEffect(this.playerContainer.x + 110, this.playerContainer.y + 15, color, 1));
    }
    animSpread(color) {
        for (let i = -2; i <= 2; i++) {
            this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y + i * 30, color, 1);
        }
    }
    animIceNeedle(color) {
        this.launchOrbs(this.playerContainer.x + 100, this.playerContainer.y - 10, color, 1, 3);
    }
    animShield(color) {
        const shield = this.add.circle(this.playerContainer.x + 50, this.playerContainer.y, 40, color, 0.3);
        this.tweens.add({
            targets: shield, scaleX: 2, scaleY: 2, alpha: 0, duration: 600,
            onComplete: () => shield.destroy()
        });
    }
    animFist(color) {
        this.launchHits(color, 5);
    }
    animFlame(color) {
        this.launchOrbs(this.playerContainer.x + 80, this.playerContainer.y, color, 6);
    }
    animQuickSlash(color) {
        this.createSlashEffect(this.playerContainer.x + 110, this.playerContainer.y - 10, color, 1.5);
    }
    animVortex(color) {
        const vortex = this.add.circle(this.playerContainer.x + 120, this.playerContainer.y, 10, color, 0.6);
        this.tweens.add({
            targets: vortex, scaleX: 5, scaleY: 5, alpha: 0, duration: 800,
            onComplete: () => vortex.destroy()
        });
    }
    animCleanse(color) {
        const ring = this.add.circle(this.playerContainer.x, this.playerContainer.y, 20, color, 0.5);
        this.tweens.add({
            targets: ring, scaleX: 3, scaleY: 3, alpha: 0, duration: 500,
            onComplete: () => ring.destroy()
        });
    }
    animStunSlash(color) {
        this.createSlashEffect(this.playerContainer.x + 100, this.playerContainer.y, color, 1.3);
    }

    launchHits(color, count) {
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * 100, () => {
                this.createSlashEffect(
                    this.playerContainer.x + 80 + Math.random() * 60,
                    this.playerContainer.y + (Math.random() - 0.5) * 40,
                    color, 1
                );
            });
        }
    }

    launchOrbs(x, y, color, count = 5, size = 12) {
        for (let i = 0; i < count; i++) {
            this.time.delayedCall(i * 80, () => {
                const orb = this.add.circle(x, y, size * (1 - i * 0.1), color);
                this.tweens.add({
                    targets: orb,
                    x: x + 200,
                    duration: 400 + i * 20,
                    onComplete: () => {
                        orb.destroy();
                        this.createImpact(x + 200, y, color);
                    }
                });
            });
        }
    }

    createSlashEffect(x, y, color = 0xffffff, scale = 1) {
        const symbols = ['💥', '⚔', '✦', '☆'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        const slash = this.add.text(x, y, symbol, { fontSize: String(36 * scale) + 'px' }).setOrigin(0.5);
        if (color) slash.setTint(color);
        this.tweens.add({
            targets: slash,
            x: x + 60 * scale,
            alpha: 0,
            scale: scale * 2,
            duration: 300,
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

    dealDamageToEnemy(damage, skill = null) {
        const enemyData = ENEMIES[this.enemyId];
        let defense = enemyData.defense || 0;

        if (skill && skill.ignoreDef) {
            defense = Math.floor(defense * (1 - skill.ignoreDef));
        }

        const hasDefDown = this.statuses.enemy.some(s => s.type === 'defDown');
        if (hasDefDown) defense = Math.floor(defense * 0.7);

        const actualDamage = Math.max(1, damage - defense);
        this.enemyHp -= actualDamage;

        this.log(`${enemyData.name} 受到 ${actualDamage} 傷害！`);
        soundManager.play('hit');
        const freezeDuration = (skill && skill.damageRatio > 2.5) ? 150 : (skill ? 80 : 50);
        this.hitFreeze(freezeDuration);
        this.addRage(RAGE_CONFIG.gainOnDamage);

        if (skill && skill.reflect) {
            const reflectDmg = Math.floor(actualDamage * skill.reflect);
            this.playerHp -= reflectDmg;
            this.updatePlayerHpBar();
            this.log(`🛡️ 反彈 ${reflectDmg} 傷害！`);
        }

        if (skill && skill.mpSteal) {
            const stolen = Math.min(skill.mpSteal, this.enemyMp || 0);
            this.playerMp = Math.min(this.playerMaxMp, this.playerMp + stolen);
            this.log(`💧 吸取 ${stolen} MP！`);
        }

        if (skill && skill.status) {
            this.applyStatus('enemy', skill.status.type, skill.status.duration);
        }

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

        if (skill && skill.hits && skill.hits > 1) {
            this.log('⚡ 連擊！第 2 段！');
            this.time.delayedCall(300, () => {
                const secondDmg = this.calculateSkillDamage(skill, 0, null);
                this.dealDamageToEnemy(secondDmg, null);
            });
            return;
        }

        if (this.enemyHp <= 0) {
            this.endBattle(true);
        } else {
            this.endPlayerTurn();
        }
    }

    updatePlayerHpBar() {
        this.tweens.add({
            targets: this.playerHpBar,
            width: Math.max(0, (this.playerHp / this.playerMaxHp) * 136),
            duration: 200
        });
        this.playerHpText.setText(`${Math.max(0, Math.floor(this.playerHp))}/${this.playerMaxHp}`);
        dataManager.data.player.hp = this.playerHp;
        dataManager.data.player.mp = this.playerMp;
    }

    endPlayerTurn() {
        dataManager.data.player.hp = this.playerHp;
        dataManager.data.player.mp = this.playerMp;
        this.addRage(RAGE_CONFIG.gainPerTurn);
        this.tickStatuses('enemy');
        if (this.enemyHp <= 0) {
            this.endBattle(true);
            return;
        }
        this.playerAtb = 0;
        this.playerTurn = false;
        this.atbActive = true;
    }

    dealDamageToPlayer(damage) {
        const attrs = dataManager.data.player.attributes || {};
        const agi = attrs.bra !== undefined ? attrs.bra : (dataManager.data.player.agility || 10);
        const dodgeChance = agi / (agi + 50);
        if (Math.random() < dodgeChance) {
            this.log('💨 閃避了攻擊！');
            return;
        }

        let actualDamage = Math.max(1, damage);
        if (this.isDefending) {
            actualDamage = Math.floor(actualDamage * 0.5);
            this.log('🛡️ 招架減傷 50%！');
            this.isDefending = false;
        }

        const dmgReduction = this.getEquipmentStat('dmgReduction', 0);
        actualDamage = Math.floor(actualDamage * (1 - dmgReduction));

        this.playerHp -= actualDamage;
        dataManager.data.player.hp = this.playerHp;

        this.log(`你受到 ${actualDamage} 傷害！`);
        soundManager.play('hurt');
        this.addRage(RAGE_CONFIG.gainOnHit);

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

    applyStatus(target, type, duration) {
        const list = this.statuses[target];
        const existing = list.find(s => s.type === type);
        if (existing) {
            existing.duration = duration;
        } else {
            list.push({ type, duration });
        }
        const targetName = target === 'enemy' ? ENEMIES[this.enemyId].name : '你';
        this.log(`⚡ ${targetName} 中了 ${this.getStatusName(type)}！`);
        this.updateStatusDisplay(target);
    }

    getStatusName(type) {
        const names = { stun: '封穴', bleed: '內傷', defDown: '減防' };
        return names[type] || type;
    }

    updateStatusDisplay(target) {
        const list = this.statuses[target];
        const x = target === 'player' ? 250 : 950;
        const y = target === 'player' ? 340 : 240;

        if (target === 'player' && this.statusIcons.player) {
            this.statusIcons.player.destroy();
        }
        if (target === 'enemy' && this.statusIcons.enemy) {
            this.statusIcons.enemy.destroy();
        }

        if (list.length === 0) return;

        const icons = list.map(s => {
            const symbols = { stun: '⏸', bleed: '🩸', defDown: '⬇' };
            return symbols[s.type] || '?';
        }).join(' ');

        const icon = this.add.text(x, y, icons, {
            fontSize: '20px'
        }).setOrigin(0.5);

        if (target === 'player') this.statusIcons.player = icon;
        else this.statusIcons.enemy = icon;
    }

    tickStatuses(target) {
        const list = this.statuses[target];
        const targetName = target === 'enemy' ? ENEMIES[this.enemyId].name : '你';
        for (let i = list.length - 1; i >= 0; i--) {
            const status = list[i];
            if (status.type === 'bleed') {
                const dmg = Math.floor((target === 'player' ? this.playerMaxHp : this.enemyMaxHp) * 0.05);
                if (target === 'player') {
                    this.playerHp -= dmg;
                    this.updatePlayerHpBar();
                } else {
                    this.enemyHp -= dmg;
                    this.tweens.add({
                        targets: this.enemyHpBar,
                        width: Math.max(0, (this.enemyHp / this.enemyMaxHp) * 136),
                        duration: 200
                    });
                    this.enemyHpText.setText(`${Math.max(0, this.enemyHp)}/${this.enemyMaxHp}`);
                }
                this.log(`🩸 ${targetName} 內傷發作，損失 ${dmg} 生命！`);
                this.createDamageNumber(
                    target === 'player' ? this.playerContainer.x : this.enemyContainer.x,
                    (target === 'player' ? this.playerContainer.y : this.enemyContainer.y) - 60,
                    dmg
                );
            }
            status.duration--;
            if (status.duration <= 0) {
                list.splice(i, 1);
                this.log(`✅ ${targetName} 的 ${this.getStatusName(status.type)} 已解除`);
            }
        }
        this.updateStatusDisplay(target);
    }

    checkPlayerStatus() {
        const hasStun = this.statuses.player.some(s => s.type === 'stun');
        if (hasStun) {
            this.log('⏸ 你被封穴了！跳過回合！');
            this.removeStatus('player', 'stun');
            this.tickStatuses('player');
            this.time.delayedCall(1000, () => this.enemyTurn());
        } else {
            this.time.delayedCall(1000, () => this.enemyTurn());
        }
    }

    removeStatus(target, type) {
        const list = this.statuses[target];
        const idx = list.findIndex(s => s.type === type);
        if (idx !== -1) {
            list.splice(idx, 1);
            this.updateStatusDisplay(target);
        }
    }

    getEquipmentStat(statName, defaultValue) {
        const equipped = dataManager.data.player.equipped;
        const slots = ['weapon', 'armor', 'accessory'];
        let total = defaultValue;
        for (const slot of slots) {
            const itemId = equipped[slot];
            if (itemId && ITEMS[itemId] && ITEMS[itemId].battleStats && ITEMS[itemId].battleStats[statName] !== undefined) {
                total += ITEMS[itemId].battleStats[statName];
            }
        }
        return total;
    }

    hitFreeze(duration = 80) {
        this.atbActive = false;
        this.time.delayedCall(duration, () => {
            this.atbActive = true;
        });
    }

    grantLoot() {
        const table = LOOT_TABLES[this.enemyId];
        if (!table) return;

        const tier = this.enemyTier;
        const dropped = [];

        for (const entry of table.common) {
            if (Math.random() < entry.chance) {
                const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
                dataManager.addItem(entry.id, amount);
                dropped.push(ITEMS[entry.id].name + '×' + amount);
            }
        }

        if (Math.random() < 0.15) {
            for (const entry of table.rare) {
                const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
                dataManager.addItem(entry.id, amount);
                dropped.push(ITEMS[entry.id].name + '×' + amount);
            }
        }

        if (tier === 'elite' || tier === 'boss') {
            for (const entry of table.eliteGuaranteed) {
                const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
                dataManager.addItem(entry.id, amount);
                dropped.push(ITEMS[entry.id].name + '×' + amount);
            }
        }

        if (tier === 'boss') {
            for (const entry of table.bossGuaranteed) {
                const amount = entry.min + Math.floor(Math.random() * (entry.max - entry.min + 1));
                dataManager.addItem(entry.id, amount);
                dropped.push(ITEMS[entry.id].name + '×' + amount);
            }
        }

        if (dropped.length > 0) {
            this.log('📦 獲得: ' + dropped.join(', '));
        }
    }

    enemyTurn() {
        if (!this.battleActive) return;

        const hasStun = this.statuses.enemy.some(s => s.type === 'stun');
        if (hasStun) {
            this.log(`⏸ ${ENEMIES[this.enemyId].name} 被封穴了！跳過回合！`);
            this.removeStatus('enemy', 'stun');
            this.enemyAtb = 0;
            this.enemyReady = false;
            this.atbActive = true;
            return;
        }

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
                    this.tickStatuses('player');
                    this.enemyAtb = 0;
                    this.enemyReady = false;
                    this.atbActive = true;
                });
            }
        });
    }

    endBattle(victory) {
        this.battleActive = false;

        if (victory) {
            this.log('🎉 戰鬥勝利！');
            this.cameras.main.flash(500, 255, 215, 0);
            soundManager.play('victory');

            this.tweens.add({
                targets: this.enemyContainer,
                y: 800,
                alpha: 0,
                duration: 500
            });

            const tierCfg = ENEMY_TIERS[this.enemyTier];
            const expGain = tierCfg.exp;
            const silverGain = tierCfg.silver;

            dataManager.data.player.exp += expGain;
            dataManager.addSilver(silverGain);
            dataManager.checkLevelUp();

            dataManager.addCombatExp(expGain);
            dataManager.addStudyPoints(Math.floor(expGain * 0.5));

            if (this.enemyTier === 'boss') dataManager.addFame(30);
            else if (this.enemyTier === 'elite') dataManager.addFame(10);
            else dataManager.addFame(2);
            dataManager.addKarma(2);

            this.log(`✨ 獲得 ${expGain} 經驗，${silverGain} 銀兩！`);
            this.log(`📖 +${Math.floor(expGain * 0.5)} 學點  ⭐ +${this.enemyTier === 'boss' ? 30 : this.enemyTier === 'elite' ? 10 : 2} 名聲`);

            this.grantLoot();
            dataManager.data.player.battleCount++;
            dataManager.data.player.killCount++;
            dataManager.checkAchievements();
        } else {
            this.log('💀 戰鬥失敗...');
            dataManager.data.player.battleCount++;
            dataManager.checkAchievements();
            this.cameras.main.flash(500, 255, 0, 0);
            soundManager.play('defeat');
            this.tweens.add({
                targets: this.playerContainer,
                alpha: 0.5,
                angle: 10,
                duration: 500
            });
        }

        if (!victory) {
            dataManager.data.player.hp = dataManager.data.player.maxHp;
            dataManager.data.player.mp = dataManager.data.player.maxMp;
        }

        saveSystem.save();

        this.time.delayedCall(2000, () => {
            dataManager.data.inBattle = false;
            this.cameras.main.fade(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('WorldScene', { map: dataManager.data.currentMap });
            });
        });
    }
}