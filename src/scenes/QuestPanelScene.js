import Phaser from 'phaser';
import { questManager } from '../systems/QuestManager.js';

export class QuestPanelScene extends Phaser.Scene {
    constructor() {
        super('QuestPanelScene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        const cx = 400;
        let iy = 40;
        const quests = questManager.getActiveQuests();

        this.add.text(cx, iy, '任務追蹤', {
            fontSize: '26px', fill: '#ffd700', fontFamily: 'serif'
        }).setOrigin(0.5);
        iy += 40;

        if (quests.length === 0) {
            this.add.text(cx, iy, '沒有進行中的任務', {
                fontSize: '18px', fill: '#666', fontFamily: 'serif'
            }).setOrigin(0.5);
            iy += 40;
        } else {
            quests.forEach(q => {
                this.add.text(cx, iy, `【${this.getTypeLabel(q.type)}】${q.title}`, {
                    fontSize: '18px', fill: '#ffd700', fontFamily: 'serif'
                }).setOrigin(0.5);
                iy += 28;

                q.objectives.forEach(obj => {
                    const done = obj.current >= obj.count;
                    const line = `  ${done ? '✅' : '▫'} ${obj.label}: ${obj.current}/${obj.count}`;
                    this.add.text(cx, iy, line, {
                        fontSize: '15px', fill: done ? '#88ff88' : '#fff', fontFamily: 'serif'
                    }).setOrigin(0.5);
                    iy += 24;
                });

                const abandonBtn = this.add.text(cx + 160, iy - 24 * q.objectives.length + 12, '[放棄]', {
                    fontSize: '13px', fill: '#ff6666', fontFamily: 'serif',
                    backgroundColor: '#333', padding: { x: 4, y: 2 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                abandonBtn.on('pointerdown', () => {
                    questManager.abandonQuest(q.id);
                    this.scene.restart();
                });

                iy += 10;
            });
        }

        iy += 30;
        const closeBtn = this.add.text(cx, iy, '[ 關閉 (J) ]', {
            fontSize: '18px', fill: '#ff6666', fontFamily: 'serif',
            backgroundColor: '#333', padding: { x: 12, y: 6 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.close());
        this.input.keyboard.on('keydown-J', () => this.close());
    }

    getTypeLabel(type) {
        return { escort: '鏢局', bounty: '賞金', sect: '門派', story: '劇情' }[type] || type;
    }

    close() {
        this.scene.resume('WorldScene');
        this.scene.stop();
    }
}