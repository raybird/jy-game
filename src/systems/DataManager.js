class DataManager {
    constructor() {
        this.data = {
            player: {
                name: '',
                characterId: 'guojing',
                level: 1,
                exp: 0,
                hp: 100,
                maxHp: 100,
                mp: 50,
                maxMp: 50,
                strength: 10,
                constitution: 10,
                agility: 10,
                innerPower: 10,
                skillPoints: 3,
                silver: 1000,
                skills: [0, 0, 0, 0],
                skillExp: [0, 0, 0, 0],
                inventory: [],
                equipped: { weapon: null, armor: null, accessory: null }
            },
            lifeSkills: {
                herbalism: { level: 1, exp: 0 },
                mining: { level: 1, exp: 0 },
                smithing: { level: 1, exp: 0 },
                tailoring: { level: 1, exp: 0 }
            },
            auction: { listings: [] },
            wallet: { transactions: [] },
            currentMap: 'xianyang',
            inBattle: false
        };
    }

    resetPlayer() {
        this.data.player = {
            name: '',
            characterId: 'guojing',
            level: 1,
            exp: 0,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            strength: 10,
            constitution: 10,
            agility: 10,
            innerPower: 10,
            skillPoints: 3,
            silver: 1000,
            skills: [0, 0, 0, 0],
            skillExp: [0, 0, 0, 0],
            inventory: [],
            equipped: { weapon: null, armor: null, accessory: null }
        };
    }

    setCharacter(charId, charData) {
        this.data.player.characterId = charId;
        this.data.player.strength = charData.str;
        this.data.player.constitution = charData.con;
        this.data.player.agility = charData.agi;
        this.data.player.innerPower = charData.ip;
        this.data.player.maxHp = charData.baseHp;
        this.data.player.hp = charData.baseHp;
        this.data.player.maxMp = charData.baseMp;
        this.data.player.mp = charData.baseMp;
    }

    addItem(itemId, amount = 1) {
        const inv = this.data.player.inventory;
        const existing = inv.find(i => i.id === itemId);
        if (existing) {
            existing.amount += amount;
        } else {
            inv.push({ id: itemId, amount });
        }
    }

    removeItem(itemId, amount = 1) {
        const inv = this.data.player.inventory;
        const idx = inv.findIndex(i => i.id === itemId);
        if (idx !== -1) {
            inv[idx].amount -= amount;
            if (inv[idx].amount <= 0) inv.splice(idx, 1);
            return true;
        }
        return false;
    }

    getItemCount(itemId) {
        const item = this.data.player.inventory.find(i => i.id === itemId);
        return item ? item.amount : 0;
    }

    addSilver(amount) {
        this.data.player.silver += amount;
    }

    removeSilver(amount) {
        if (this.data.player.silver >= amount) {
            this.data.player.silver -= amount;
            return true;
        }
        return false;
    }

    checkLevelUp() {
        const p = this.data.player;
        const expNeeded = p.level * 100;
        while (p.exp >= expNeeded && p.level < 15) {
            p.exp -= expNeeded;
            p.level++;
            p.skillPoints += 3;
            console.log(p.name + ' 等級提升到 ' + p.level + '！');
        }
    }

    getData() {
        return this.data;
    }

    setData(data) {
        this.data = data;
    }
}

export const dataManager = new DataManager();