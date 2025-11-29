const { buildSchema } = require("graphql");

module.exports = `
  type Product {
    id: ID!
    name: String!
    brand: String!
    category: String!
    description: String!
    price: Float!
    city: String!
    area: String!
    image: String
    retailer: ID!
    createdAt: String
    updatedAt: String
  }

  type Query {
    getProducts(
      city: String
      area: String
      category: String
      brand: String
      minPrice: Float
      maxPrice: Float
      search: String
      page: Int
      limit: Int
      sort: String
    ): ProductResponse
    getProduct(id: ID!): Product
    getMyProducts: [Product]
  }

  type ProductResponse {
    success: Boolean!
    count: Int
    total: Int
    page: Int
    totalPages: Int
    products: [Product]
  }

  type Mutation {
    createProduct(
      name: String!
      brand: String!
      category: String!
      description: String!
      price: Float!
      city: String!
      area: String!
      image: String
    ): Product
    updateProduct(
      id: ID!
      name: String
      brand: String
      category: String
      description: String
      price: Float
      city: String
      area: String
      image: String
    ): Product
    deleteProduct(id: ID!): MessageResponse
  }

  type MessageResponse {
    success: Boolean!
    message: String!
  }
`;
