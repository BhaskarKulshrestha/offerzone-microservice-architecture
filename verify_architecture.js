const axios = require("axios");

const GATEWAY_URL = "http://localhost:8085/offerzone";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verify() {
    try {
        console.log("Starting verification...");

        // 1. Create User
        console.log("Creating User...");
        const userRes = await axios.post(`${GATEWAY_URL}/users/`, {
            name: "Test User",
            email: `test${Date.now()}@example.com`,
            password: "password123",
            role: "retailer",
            phone: "1234567890",
            city: "Test City"
        });
        const token = userRes.data.token;
        const user = userRes.data.user;
        console.log("User created:", user.id);

        // 2. Create Product
        console.log("Creating Product...");
        const productRes = await axios.post(
            `${GATEWAY_URL}/products`,
            {
                name: "Test Product",
                brand: "Test Brand",
                category: "Electronics",
                price: 100,
                city: "Test City",
                area: "Test Area",
                description: "Test Description",
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const product = productRes.data.product;
        console.log("Product created:", product._id);

        // 3. Create Offer
        console.log("Creating Offer...");
        const offerRes = await axios.post(
            `${GATEWAY_URL}/offers`,
            {
                product: product._id,
                title: "Test Offer",
                discountPercent: 10,
                originalPrice: 100,
                offerPrice: 90,
                validFrom: new Date(),
                validTill: new Date(Date.now() + 86400000),
                city: "Test City",
                area: "Test Area",
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const offer = offerRes.data.offer;
        console.log("Offer created:", offer._id);

        // 4. Get Offer (Verify Product Details are fetched)
        console.log("Fetching Offer to verify details...");
        const fetchedOfferRes = await axios.get(`${GATEWAY_URL}/offers/${offer._id}`);
        const fetchedOffer = fetchedOfferRes.data.offer;

        if (fetchedOffer.product && fetchedOffer.product.name === "Test Product") {
            console.log("SUCCESS: Offer fetched with Product details!");
        } else {
            console.error("FAILURE: Offer missing Product details:", fetchedOffer.product);
        }

        if (fetchedOffer.retailer && fetchedOffer.retailer.name === "Test User") {
            console.log("SUCCESS: Offer fetched with Retailer details!");
        } else {
            console.error("FAILURE: Offer missing Retailer details:", fetchedOffer.retailer);
        }

        // 5. Add to Favorites
        console.log("Adding to Favorites...");
        await axios.post(
            `${GATEWAY_URL}/favorites/`,
            {
                userId: user.id,
                productId: product._id,
                offerId: offer._id,
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Added to favorites");

        // 6. Get Favorites (Verify details)
        console.log("Fetching Favorites...");
        const favRes = await axios.get(`${GATEWAY_URL}/favorites/${user.id}`);
        const favorites = favRes.data.data;

        if (favorites.length > 0 && favorites[0].productId && favorites[0].productId.name === "Test Product") {
            console.log("SUCCESS: Favorite fetched with Product details!");
        } else {
            console.error("FAILURE: Favorite missing Product details:", favorites[0]);
        }

    } catch (error) {
        console.error("Verification Failed:", error);
        if (error.response) {
            console.error("Response Data:", error.response.data);
            console.error("Response Status:", error.response.status);
        }
    }
}

verify();
