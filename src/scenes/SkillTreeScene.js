import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { sectManager } from '../systems/SectManager.js';

export default class SkillTreeScene extends Phaser.Scene {
    constructor() {
        super('SkillTreeScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const p = dataManager.data.player;
        const cx = 400;
        let iy = 30;

        this.add.text(cx, iy, '武功管理', {
            fontSize: '26px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 35;

        this.add.text(cx, iy, `學點：${p.studyPoints}  實戰：${p.combatExp}`, {
            fontSize: '16px', fill: '#aaa', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 25;

        this.add.text(cx, iy, '--- 已學武功 ---', {
            fontSize: '18px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 28;

        if (p.martialArts.length === 0) {
            this.add.text(cx, iy, '尚未學習任何武功', {
                fontSize: '16px', fill: '#666', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 30;
        } else {
            p.martialArts.forEach(entry => {
                const artDef = sectManager.getArtDefinition(entry.id);
                if (!artDef) return;

                const nameText = `Lv.${entry.level} ${artDef.name} [${artDef.tier === 'basic' ? '初' : artDef.tier === 'mid' ? '中' : '絕'}]`;
                const row = this.add.text(cx, iy, nameText, {
                    fontSize: '15px', fill: '#fff', fontFamily: 'serif',
                    backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });

                row.on('pointerdown', () => {
                    if (entry.level < 5) {
                        const result = sectManager.upgradeArt(entry.id);
                        if (result.ok) {
                            row.setText(`Lv.${result.newLevel} ${artDef.name} [${artDef.tier === 'basic' ? '初' : artDef.tier === 'mid' ? '中' : '絕'}]`);
                        } else {
                            row.setColor('#ff6666');
                            const reason = result.reason || '無法升級';
                            row.setText(`Lv.${entry.level} ${artDef.name} — ${reason}`);
                            this.time.delayedCall(2000, () => {
                                row.setColor('#fff');
                                row.setText(`Lv.${entry.level} ${artDef.name} [${artDef.tier === 'basic' ? '初' : artDef.tier === 'mid' ? '中' : '絕'}]`);
                            });
                        }
                    }
                });
                iy += 30;
            });
        }

        iy += 10;
        this.add.text(cx, iy, '--- 裝備欄位 (1-4) ---', {
            fontSize: '18px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 28;

        for (let slot = 0; slot < 4; slot++) {
            const equippedId = p.equippedSkills[slot];
            let slotLabel;
            if (equippedId) {
                const artDef = sectManager.getArtDefinition(equippedId);
                slotLabel = `欄${slot + 1}: ${artDef?.name || equippedId}`;
            } else {
                slotLabel = `欄${slot + 1}: 空`;
            }

            const slotText = this.add.text(cx, iy, slotLabel, {
                fontSize: '16px', fill: equippedId ? '#00ffcc' : '#666', fontFamily: 'serif',
                backgroundColor: '#333', padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            slotText.on('pointerdown', () => {
                this.showSkillPicker(slot);
            });
            iy += 30;
        }

        iy += 20;
        const closeBtn = this.add.text(cx, iy, '[ 關閉 (V) ]', {
            fontSize: '18px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.close());
        this.input.keyboard.on('keydown-V', () => this.close());
    }

    showSkillPicker(slotIndex) {
        const p = dataManager.data.player;
        const cx = 400;
        const overlay = this.add.rectangle(0, 0, 1280, 720, 0x000000, 0.8).setInteractive().setDepth(10);
        const panel = this.add.rectangle(cx, 360, 350, 400, 0x1a1a2e).setStrokeStyle(2, 0xc9a227).setDepth(10);
        const elements = [overlay, panel];

        let iy = 160;
        const title = this.add.text(cx, iy, `選擇欄位 ${slotIndex + 1} 武功`, {
            fontSize: '20px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5).setDepth(10);
        elements.push(title);
        iy += 35;

        const clearBtn = this.add.text(cx, iy, '[ 清空 ]', {
            fontSize: '16px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
        elements.push(clearBtn);
        clearBtn.on('pointerdown', () => {
            p.equippedSkills[slotIndex] = null;
            elements.forEach(e => e.destroy());
            this.scene.restart();
        });
        iy += 35;

        p.martialArts.forEach(entry => {
            const artDef = sectManager.getArtDefinition(entry.id);
            if (!artDef) return;
            if (artDef.type === 'passive') return;

            const label = `Lv.${entry.level} ${artDef.name}`;
            const row = this.add.text(cx, iy, label, {
                fontSize: '15px', fill: '#fff', fontFamily: 'serif',
                backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
            elements.push(row);

            row.on('pointerdown', () => {
                p.equippedSkills[slotIndex] = entry.id;
                elements.forEach(e => e.destroy());
                this.scene.restart();
            });
            iy += 28;
        });

        iy += 20;
        const closeBtn = this.add.text(cx, iy, '[ 取消 ]', {
            fontSize: '16px', fill: '#888', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).setDepth(10);
        elements.push(closeBtn);
        closeBtn.on('pointerdown', () => elements.forEach(e => e.destroy()));
    }

    close() {
        this.scene.resume('WorldScene');
        this.scene.stop();
    }
}