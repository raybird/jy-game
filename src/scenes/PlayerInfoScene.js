// @ts-check
import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { sectManager } from '../systems/SectManager.js';
import { FIVE_ATTRS } from '../data/GameData.js';

export class PlayerInfoScene extends Phaser.Scene {
    constructor() {
        super('PlayerInfoScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const p = dataManager.getPlayer();

        const cx = 400;
        let iy = 40;

        this.add.text(cx, iy, '角色資訊', {
            fontSize: '28px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 50;

        const info = [
            `名稱：${p.name || '少俠'}`,
            `等級：${p.level} (Lv)`,
            `HP：${p.hp} / ${p.maxHp}`,
            `MP：${p.mp} / ${p.maxMp}`,
        ];
        info.forEach(line => {
            this.add.text(cx, iy, line, {
                fontSize: '18px', fill: '#ffffff', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 30;
        });

        iy += 10;

        const expLines = [
            `實戰經驗：${p.combatExp || 0} / ${dataManager.getLevelExpRequirement()}`,
            `學點：${p.studyPoints || 0}`,
        ];
        expLines.forEach(line => {
            this.add.text(cx, iy, line, {
                fontSize: '18px', fill: '#ffffff', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 30;
        });

        iy += 10;

        const karmaTitle = dataManager.getKarmaTitle();
        const statusLines = [
            `名聲：${p.fame || 0}`,
            `善惡：${p.karma || 0} （${karmaTitle}）`,
        ];
        statusLines.forEach(line => {
            this.add.text(cx, iy, line, {
                fontSize: '18px', fill: '#ffffff', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 30;
        });

        iy += 10;

        const sectName = p.sect || '無門派';
        const rank = p.sect ? sectManager.getRank().name : '';
        const sectLine = `門派：${sectName}${p.sect ? '  [' + rank + ']' : ''}${p.sect ? '  聲望：' + (p.sectReputation || 0) : ''}`;
        this.add.text(cx, iy, sectLine, {
            fontSize: '18px', fill: '#ffffff', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 30;

        iy += 10;

        const weapon = (p.equipped && p.equipped.weapon) ? p.equipped.weapon : '無';
        const armor = (p.equipped && p.equipped.armor) ? p.equipped.armor : '無';
        const accessory = (p.equipped && p.equipped.accessory) ? p.equipped.accessory : '無';

        const equipLines = [
            `武器：${weapon}`,
            `護甲：${armor}`,
            `飾品：${accessory}`,
        ];
        equipLines.forEach(line => {
            this.add.text(cx, iy, line, {
                fontSize: '18px', fill: '#00ccff', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 30;
        });

        iy += 10;

        this.add.text(cx, iy, '--- 裝備武功 ---', {
            fontSize: '20px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 28;

        const equippedSkills = p.equippedSkills || [];
        for (let slot = 0; slot < 4; slot++) {
            const artId = equippedSkills[slot];
            let label;
            if (artId) {
                const artDef = sectManager.getArtDefinition(artId);
                label = artDef ? artDef.name : artId;
            } else {
                label = '空';
            }
            this.add.text(cx, iy, `招式${slot + 1}：${label}`, {
                fontSize: '16px', fill: artId ? '#00ffcc' : '#666', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 26;
        }

        iy += 10;

        this.add.text(cx, iy, '--- 五圍屬性 ---', {
            fontSize: '20px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 30;

        const attrs = p.attributes || {};
        Object.entries(FIVE_ATTRS).forEach(([key, cfg]) => {
            const val = attrs[key] !== undefined ? attrs[key] : 10;
            this.add.text(cx, iy, `${cfg.label} ${cfg.short}：${val}`, {
                fontSize: '18px', fill: '#ffffff', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 30;
        });

        iy += 40;

        const closeBtn = this.add.text(cx, iy, '[ 關閉 (C) ]', {
            fontSize: '20px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeBtn.on('pointerdown', () => this.closePanel());
        this.input.keyboard.on('keydown-C', () => this.closePanel());
    }

    closePanel() {
        this.scene.resume('WorldScene');
        this.scene.stop();
    }
}