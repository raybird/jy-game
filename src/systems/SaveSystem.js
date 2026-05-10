import { dataManager } from './DataManager.js';

class SaveSystem {
    save() {
        const data = dataManager.getData();
        localStorage.setItem('jinyong_save', JSON.stringify(data));
        console.log('存檔成功！');
    }

    load() {
        const saved = localStorage.getItem('jinyong_save');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                dataManager.setData(data);
                console.log('讀檔成功！');
                return true;
            } catch (e) {
                console.error('讀檔失敗', e);
            }
        }
        return false;
    }

    hasSave() {
        return localStorage.getItem('jinyong_save') !== null;
    }

    deleteSave() {
        localStorage.removeItem('jinyong_save');
        console.log('存檔已刪除！');
    }
}

export const saveSystem = new SaveSystem();