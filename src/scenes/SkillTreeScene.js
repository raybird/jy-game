import Phaser from 'phaser';
import { dataManager } from '../systems/DataManager.js';
import { CHARACTERS, CHARACTER_SKILLS, SKILL_TREE_CONFIG } from '../data/GameData.js';

export default class SkillTreeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SkillTreeScene' });
    }

    create() {
        const p = dataManager.data.player;
        const charId = p.characterId;
        const charData = CHARACTERS[charId];
        const skills = CHARACTER_SKILLS[charId];
        const tree = p.skillTree;

        this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.85);

        this.add.text(640, 40, charData.name + ' · 武功強化', {
            fontSize: '36px', color: '#ffd700', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.add.text(640, 80, '技能點：' + p.skillPoints, {
            fontSize: '20px', color: '#00ff00', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        const startY = 130;
        const skillH = 130;

        for (let si = 0; si < skills.length; si++) {
            const skill = skills[si];
            const y = startY + si * skillH;

            this.add.rectangle(640, y + 10, 900, 120, 0x1a1a2e, 0.8)
                .setStrokeStyle(1, 0x333366);

            this.add.text(220, y - 25, skill.name, {
                fontSize: '22px', color: '#ffffff', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0, 0.5);

            this.add.text(220, y + 5, skill.desc, {
                fontSize: '13px', color: '#aaaaaa', fontFamily: 'Microsoft JhengHei'
            }).setOrigin(0, 0.5);

            const nodeLabels = ['傷害+15%', '消耗-20%', '被動加成'];
            for (let ni = 0; ni < 3; ni++) {
                const nx = 520 + ni * 120;
                const isUnlocked = tree[si] && tree[si].nodes[ni];
                const canAfford = p.skillPoints >= SKILL_TREE_CONFIG.nodeCosts[ni];

                const nodeBg = this.add.rectangle(nx, y + 10, 100, 30, isUnlocked ? 0x006600 : 0x333333)
                    .setStrokeStyle(1, isUnlocked ? 0x00ff00 : 0x666666);

                if (isUnlocked) {
                    this.add.text(nx, y + 10, '✔ ' + nodeLabels[ni], {
                        fontSize: '12px', color: '#00ff00', fontFamily: 'Microsoft JhengHei'
                    }).setOrigin(0.5);
                } else if (canAfford) {
                    this.add.text(nx, y + 10, nodeLabels[ni] + ' (' + SKILL_TREE_CONFIG.nodeCosts[ni] + 'P)', {
                        fontSize: '12px', color: '#ffd700', fontFamily: 'Microsoft JhengHei'
                    }).setOrigin(0.5);

                    nodeBg.setInteractive({ useHandCursor: true });
                    nodeBg.on('pointerover', () => nodeBg.setFillStyle(0x444466));
                    nodeBg.on('pointerout', () => nodeBg.setFillStyle(0x333333));
                    nodeBg.on('pointerdown', () => {
                        if (dataManager.upgradeSkillNode(si, ni)) {
                            this.scene.restart();
                        }
                    });
                } else {
                    this.add.text(nx, y + 10, nodeLabels[ni] + ' (' + SKILL_TREE_CONFIG.nodeCosts[ni] + 'P)', {
                        fontSize: '12px', color: '#555555', fontFamily: 'Microsoft JhengHei'
                    }).setOrigin(0.5);
                }
            }

            if (tree[si] && tree[si].nodes[2]) {
                const passive = SKILL_TREE_CONFIG.passives[charId];
                this.add.text(900, y + 10, '被動: ' + passive.desc, {
                    fontSize: '12px', color: '#88ff88', fontFamily: 'Microsoft JhengHei'
                }).setOrigin(0, 0.5);
            }
        }

        this.add.text(640, 680, '按 ESC 或 V 關閉', {
            fontSize: '20px', color: '#888888', fontFamily: 'Microsoft JhengHei'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-ESC', () => this.close());
        this.input.keyboard.on('keydown-V', () => this.close());
    }

    close() {
        this.scene.resume('WorldScene');
        this.scene.stop();
    }
}