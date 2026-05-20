// @ts-check
import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { sectManager } from '../systems/SectManager.js';
import { fusionSystem } from '../systems/FusionSystem.js';

export class FusionScene extends Phaser.Scene {
    constructor() {
        super('FusionScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const cx = 400;
        let iy = 30;

        this.add.text(cx, iy, '自創武功 — 融會貫通', {
            fontSize: '24px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 30;

        const check = fusionSystem.canFuse();
        if (!check.ok) {
            this.add.text(cx, iy, check.reason, {
                fontSize: '16px', fill: '#ff6666', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 30;
        }

        iy += 10;

        const arts = fusionSystem.getFuseableArts();
        this.selectedBase = null;
        this.selectedSub = null;
        this.customName = '';

        if (arts.length >= 2) {
            this.add.text(cx, iy, '--- 選擇基底武功 ---', {
                fontSize: '16px', fill: '#aaa', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 22;

            arts.forEach(a => {
                const def = sectManager.getArtDefinition(a.id);
                if (!def) return;
                const row = this.add.text(cx, iy, `Lv.${a.level} ${def.name}`, {
                    fontSize: '14px', fill: '#fff', fontFamily: 'serif',
                    backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                row.on('pointerdown', () => {
                    this.selectedBase = a.id;
                    if (this.baseText) this.baseText.setText(`基底: ${def.name}`);
                });
                iy += 24;
            });

            iy += 8;
            this.baseText = this.add.text(cx, iy, '基底: 未選擇', {
                fontSize: '15px', fill: '#888', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 25;

            this.add.text(cx, iy, '--- 選擇副武功 ---', {
                fontSize: '16px', fill: '#aaa', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 22;

            arts.forEach(a => {
                const def = sectManager.getArtDefinition(a.id);
                if (!def) return;
                const row = this.add.text(cx, iy, `Lv.${a.level} ${def.name}`, {
                    fontSize: '14px', fill: '#fff', fontFamily: 'serif',
                    backgroundColor: '#2a2a4a', padding: { x: 8, y: 4 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                row.on('pointerdown', () => {
                    this.selectedSub = a.id;
                    if (this.subText) this.subText.setText(`副: ${def.name}`);
                });
                iy += 24;
            });

            iy += 8;
            this.subText = this.add.text(cx, iy, '副: 未選擇', {
                fontSize: '15px', fill: '#888', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 25;

            this.add.text(cx, iy, '武功名稱:', {
                fontSize: '14px', fill: '#aaa', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 18;
            this.nameText = this.add.text(cx, iy, '點此輸入名稱', {
                fontSize: '18px', fill: '#ffd700', fontFamily: 'serif',
                backgroundColor: '#333', padding: { x: 12, y: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.nameText.on('pointerdown', () => {
                this.customName = prompt('輸入自創武功名稱 (最多 8 字):', this.customName) || this.customName;
                if (this.customName) {
                    this.nameText.setText(this.customName.slice(0, 8));
                }
            });

            iy += 35;

            const fuseBtn = this.add.text(cx, iy, '[ 融合覺醒 ]', {
                fontSize: '22px', fill: '#ffd700', fontFamily: 'serif',
                backgroundColor: '#444', padding: { x: 16, y: 8 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            fuseBtn.on('pointerdown', () => {
                if (!this.selectedBase || !this.selectedSub) return;
                if (this.selectedBase === this.selectedSub) return;
                const result = fusionSystem.fuse(this.selectedBase, this.selectedSub, this.customName);
                if (result.ok) {
                    this.scene.restart();
                }
            });
            iy += 50;
        }

        const closeBtn = this.add.text(cx, iy, '[ 關閉 ]', {
            fontSize: '16px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => {
            this.scene.resume('WorldScene');
            this.scene.stop();
        });
    }
}