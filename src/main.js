import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import CharacterSelectScene from './scenes/CharacterSelectScene.js';
import WorldScene from './scenes/WorldScene.js';
import BattleScene from './scenes/BattleScene.js';
import SkillTreeScene from './scenes/SkillTreeScene.js';
import { PlayerInfoScene } from './scenes/PlayerInfoScene.js';
import { QuestPanelScene } from './scenes/QuestPanelScene.js';
import { FusionScene } from './scenes/FusionScene.js';
import { soundManager } from './systems/SoundManager.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#1a1a2e',
    scene: [BootScene, MenuScene, CharacterSelectScene, WorldScene, BattleScene, SkillTreeScene, PlayerInfoScene, QuestPanelScene, FusionScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);

document.addEventListener('click', () => {
    soundManager.ensureContext();
}, { once: true });

export default game;