const { buildSchema } = require("graphql");

module.exports = `
  type Offer {
    id: ID!
    product: ID!
    retailer: ID!
    title: String!
    description: String
    discountPercent: Float!
    originalPrice: Float!
    offerPrice: Float!
    validFrom: String!
    validTill: String!
    city: String!
    area: String!
    isPremium: Boolean
    createdAt: String
    updatedAt: String
  }

  type Query {
    getOffers(
      city: String
      area: String
      minDiscount: Float
      maxPrice: Float
      isPremium: Boolean
      page: Int
      limit: Int
      sort: String
    ): OfferResponse
    getOffer(id: ID!): Offer
  }

  type OfferResponse {
    success: Boolean!
    count: Int
    total: Int
    page: Int
    totalPages: Int
    offers: [Offer]
  }

  type Mutation {
    createOffer(
      product: ID!
      title: String!
      description: String
      discountPercent: Float!
      originalPrice: Float!
      offerPrice: Float!
      validFrom: String!
      validTill: String!
      city: String!
      area: String!
      isPremium: Boolean
    ): Offer
    updateOffer(
      id: ID!
      title: String
      description: String
      discountPercent: Float
      originalPrice: Float
      offerPrice: Float
      validFrom: String
      validTill: String
      city: String
      area: String
      isPremium: Boolean
    ): Offer
    deleteOffer(id: ID!): MessageResponse
  }

  type MessageResponse {
    success: Boolean!
    message: String!
  }
`;
