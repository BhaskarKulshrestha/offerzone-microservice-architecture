const { getProductById, getUserById } = require("./serviceCommunicator");

const enrichOffers = async (offers) => {
    return Promise.all(
        offers.map(async (offer) => {
            const product = await getProductById(offer.product);
            const retailer = await getUserById(offer.retailer);
            return { ...offer.toObject(), product, retailer };
        })
    );
};

module.exports = enrichOffers;
