const { getProductById, getUserById } = require("./serviceCommunicator");

const enrichOffers = async (offers) => {
    return Promise.all(
        offers.map(async (offer) => {
            let product = await getProductById(offer.product);
            if (!product || product.error) {
                product = {
                    name: "Product Information Unavailable (Fallback)",
                    price: 0,
                    _id: offer.product
                };
            }
            const retailer = await getUserById(offer.retailer);
            return { ...offer.toObject(), product, retailer };
        })
    );
};

module.exports = enrichOffers;
