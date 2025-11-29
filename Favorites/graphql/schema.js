const { buildSchema } = require("graphql");

module.exports = `
  type Favorite {
    id: ID!
    userId: ID!
    productId: ID
    offerId: ID
    createdAt: String
    updatedAt: String
  }

  type Query {
    getFavorites: [Favorite]
  }

  type Mutation {
    addFavorite(productId: ID, offerId: ID): Favorite
    removeFavorite(id: ID!): MessageResponse
  }

  type MessageResponse {
    success: Boolean!
    message: String!
  }
`;
