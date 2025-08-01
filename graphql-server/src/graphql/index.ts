import { propertyResolvers } from './resolvers/queryResolvers.js';
import { typeDefs } from './schemas/querySchema.js';

export const resolvers = {
  Query: propertyResolvers.Query,
  Mutation: propertyResolvers.Mutation,
};

export const schema = typeDefs;
