import Phaser from 'phaser';

const SHEET_KEY_PREFIX = 'sprite_';

const SPRITE_REGISTRY = {
    guojing:      { path: 'assets/sprites/guojing/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'guojing' },
    yangguo:      { path: 'assets/sprites/yangguo/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'yangguo' },
    xiaolongnu:   { path: 'assets/sprites/xiaolongnu/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'xiaolongnu' },
    zhangwuji:    { path: 'assets/sprites/zhangwuji/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'zhangwuji' },
    linghu:       { path: 'assets/sprites/linghu/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'linghu' },
    quanzhen_disciple:  { path: 'assets/sprites/quanzhen-dizi/sheet-transparent.png',  key: SHEET_KEY_PREFIX + 'quanzhen_disciple' },
    taoist:       { path: 'assets/sprites/daoshi/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'taoist' },
    mingjiao_member:    { path: 'assets/sprites/mingjiao-jiaotu/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'mingjiao_member' },
    persian:      { path: 'assets/sprites/bosi-ren/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'persian' },
    shaolin:      { path: 'assets/sprites/shaolin-master/sheet-transparent.png',  key: SHEET_KEY_PREFIX + 'shaolin' },
    wudang:       { path: 'assets/sprites/wudang-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'wudang' },
    emei:         { path: 'assets/sprites/emei-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'emei' },
    huashan:      { path: 'assets/sprites/huashan-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'huashan' },
    gaibang:      { path: 'assets/sprites/gai-bang-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'gaibang' },
    mingjiao:     { path: 'assets/sprites/mingjiao-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'mingjiao' },
    gumu:         { path: 'assets/sprites/gumu-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'gumu' },
    quanzhen:     { path: 'assets/sprites/quanzhen-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'quanzhen' },
    xiaoyao:      { path: 'assets/sprites/xiaoyao-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'xiaoyao' },
    xingxiu:      { path: 'assets/sprites/xingxiu-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'xingxiu' },
    xuedao:       { path: 'assets/sprites/xuedao-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'xuedao' },
    riyue:        { path: 'assets/sprites/ri-yue-master/sheet-transparent.png', key: SHEET_KEY_PREFIX + 'riyue' },
};

const SECT_SPRITE_MAP = {
    shaolin:  'shaolin',
    wudang:   'wudang',
    emei:     'emei',
    huashan:  'huashan',
    gaibang:  'gaibang',
    mingjiao: 'mingjiao',
    gubai:    'gumu',
    quanzhen: 'quanzhen',
    xiaoyao:  'xiaoyao',
    riyue:    'riyue',
    xingxiu:  'xingxiu',
    xuedao:   'xuedao',
};

const WALK_SHEET_PREFIX = 'walk_';

const WALK_REGISTRY = {
    guojing:    { path: 'assets/sprites/guojing-walk/sheet-transparent.png',    key: WALK_SHEET_PREFIX + 'guojing' },
    yangguo:    { path: 'assets/sprites/yangguo-walk/sheet-transparent.png',    key: WALK_SHEET_PREFIX + 'yangguo' },
    xiaolongnu: { path: 'assets/sprites/xiaolongnu-walk/sheet-transparent.png', key: WALK_SHEET_PREFIX + 'xiaolongnu' },
    zhangwuji:  { path: 'assets/sprites/zhangwuji-walk/sheet-transparent.png',  key: WALK_SHEET_PREFIX + 'zhangwuji' },
    linghu:     { path: 'assets/sprites/linghu-walk/sheet-transparent.png',     key: WALK_SHEET_PREFIX + 'linghu' },
};

const DIR_FRAME_RANGES = {
    down:  { start: 0,  end: 3 },
    left:  { start: 4,  end: 7 },
    right: { start: 8,  end: 11 },
    up:    { start: 12, end: 15 },
};

class SpriteManager {
    preload(scene) {
        if (this._preloaded) return;
        Object.values(SPRITE_REGISTRY).forEach(({ path, key }) => {
            scene.load.spritesheet(key, path, { frameWidth: 128, frameHeight: 128 });
        });
        Object.values(WALK_REGISTRY).forEach(({ path, key }) => {
            scene.load.spritesheet(key, path, { frameWidth: 96, frameHeight: 96 });
        });
        this._preloaded = true;
    }

    createAnimations(scene) {
        if (this._animsCreated) return;
        Object.keys(SPRITE_REGISTRY).forEach(charId => {
            const { key } = SPRITE_REGISTRY[charId];
            if (!scene.anims.exists(key + '_idle')) {
                scene.anims.create({
                    key: key + '_idle',
                    frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 8 }),
                    frameRate: 6,
                    repeat: -1,
                });
            }
        });
        this._animsCreated = true;
    }

    staticSheetKey(charId) {
        const entry = SPRITE_REGISTRY[charId];
        return entry ? entry.key : null;
    }

    sectSheetKey(sectKey) {
        const mappedId = SECT_SPRITE_MAP[sectKey];
        return mappedId ? SPRITE_REGISTRY[mappedId]?.key : null;
    }

    enemySheetKey(enemyId) {
        return SPRITE_REGISTRY[enemyId]?.key || null;
    }

    createPlayerAnimated(scene, charId, x, y) {
        const key = this.staticSheetKey(charId);
        if (!key) return this._fallbackSprite(scene, x, y);
        const sprite = scene.add.sprite(x, y, key);
        sprite.setOrigin(0.5, 0.8);
        sprite.setScale(2.0);
        if (!scene.anims.exists(key + '_idle')) {
            scene.anims.create({
                key: key + '_idle',
                frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 8 }),
                frameRate: 6,
                repeat: -1,
            });
        }
        sprite.play(key + '_idle');
        return sprite;
    }

    createNPCAnimated(scene, spriteId, x, y, scale = 1.8) {
        const key = this.staticSheetKey(spriteId) || this.enemySheetKey(spriteId);
        if (!key) return this._fallbackSprite(scene, x, y);
        const sprite = scene.add.sprite(x, y, key);
        sprite.setOrigin(0.5, 0.8);
        sprite.setScale(scale);
        if (!scene.anims.exists(key + '_idle')) {
            scene.anims.create({
                key: key + '_idle',
                frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 8 }),
                frameRate: 6,
                repeat: -1,
            });
        }
        sprite.play(key + '_idle');
        return sprite;
    }

    createEnemyAnimated(scene, enemyId, x, y, scale = 2.5) {
        const key = this.enemySheetKey(enemyId);
        if (!key) return this._fallbackSprite(scene, x, y);
        const sprite = scene.add.sprite(x, y, key);
        sprite.setOrigin(0.5, 0.8);
        sprite.setScale(scale);
        if (!scene.anims.exists(key + '_idle')) {
            scene.anims.create({
                key: key + '_idle',
                frames: scene.anims.generateFrameNumbers(key, { start: 0, end: 8 }),
                frameRate: 6,
                repeat: -1,
            });
        }
        sprite.play(key + '_idle');
        return sprite;
    }

    createPlayerWalkSprite(scene, charId, x, y) {
        const entry = WALK_REGISTRY[charId];
        const key = entry ? entry.key : null;
        if (!key) return this._fallbackSprite(scene, x, y);

        ['down', 'left', 'right', 'up'].forEach(dir => {
            const animKey = key + '_walk_' + dir;
            if (!scene.anims.exists(animKey)) {
                const range = DIR_FRAME_RANGES[dir];
                scene.anims.create({
                    key: animKey,
                    frames: scene.anims.generateFrameNumbers(key, range),
                    frameRate: 8,
                    repeat: -1,
                });
            }
        });

        const sprite = scene.add.sprite(x, y, key);
        sprite.setOrigin(0.5, 0.8);
        sprite.setScale(2.5);
        sprite.play(key + '_walk_down');
        sprite.setData('direction', 'down');
        sprite.setData('moving', false);
        return sprite;
    }

    updateWalkAnimation(sprite, vx, vy) {
        if (!sprite || !sprite.anims) return;

        let dir = sprite.getData('direction') || 'down';

        if (vx === 0 && vy === 0) {
            if (sprite.getData('moving')) {
                sprite.setData('moving', false);
                sprite.anims.pause();
                const key = sprite.texture.key;
                const range = DIR_FRAME_RANGES[dir];
                sprite.setFrame(range.start);
            }
            return;
        }

        if (Math.abs(vx) >= Math.abs(vy)) {
            dir = vx > 0 ? 'right' : 'left';
        } else {
            dir = vy > 0 ? 'down' : 'up';
        }

        const animKey = sprite.texture.key + '_walk_' + dir;
        if (dir !== sprite.getData('direction') || !sprite.getData('moving')) {
            sprite.setData('direction', dir);
            sprite.setData('moving', true);
            sprite.play(animKey);
        }
    }

    _fallbackSprite(scene, x, y) {
        const gfx = scene.add.graphics();
        gfx.fillStyle(0x4488ff, 1);
        gfx.fillRect(-16, -24, 32, 48);
        gfx.fillStyle(0xffdbac, 1);
        gfx.fillCircle(0, -24, 12);
        gfx.setPosition(x, y);
        return gfx;
    }
}

export const spriteManager = new SpriteManager();
export { SPRITE_REGISTRY, SECT_SPRITE_MAP };