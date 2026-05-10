import { dataManager } from './DataManager.js';

class AuctionSystem {
    listItem(itemId, price) {
        const playerName = dataManager.data.player.name || '玩家';
        const listing = {
            itemId,
            price,
            seller: playerName
        };
        dataManager.data.auction.listings.push(listing);
        return true;
    }

    buyItem(index) {
        const listings = dataManager.data.auction.listings;
        if (index < 0 || index >= listings.length) return false;

        const listing = listings[index];
        if (listing.seller === dataManager.data.player.name) return false;

        if (dataManager.removeSilver(listing.price)) {
            dataManager.addItem(listing.itemId, 1);
            listings.splice(index, 1);
            return true;
        }
        return false;
    }

    getListings() {
        return dataManager.data.auction.listings;
    }
}

export const auctionSystem = new AuctionSystem();