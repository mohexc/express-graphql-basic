const graphql = require('graphql')
const _ = require('lodash')
const axios = require('axios')
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql

const CompanyType = new GraphQLObjectType({
  name: 'Compnay',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      resolve: async (parentValue, args) => {
        const { data } = await axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
        return data
      }
    }
  })
})

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve: async (parentValue, args) => {
        const { data } = await axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
        return data

      }
    }
  })
})

const query = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      resolve: async (parentValue, args) => {
        const { data } = await axios.get(`http://localhost:3000/users/${args.id}`)
        return data
      }
    },
    company: {
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve: async (parentValue, args) => {
        const { data } = await axios.get(`http://localhost:3000/companies/${args.id}`)
        return data
      }
    }
  })
})

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    addUser: {
      type: UserType,
      args: {
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve: async (parentValue, { firstName, age, companyId }) => {
        const { data } = await axios.post('http://localhost:3000/users', { firstName, age, companyId })
        return data
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve: async (parentValue, { id }) => {
        const { data } = await axios.delete(`http://localhost:3000/users/${id}`)
        return data
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve: async (parentValue, args) => {
        const { data } = await axios.patch(`http://localhost:3000/users/${args.id}`, args)
        return data
      }
    },

  })
})

module.exports = new GraphQLSchema({
  query,
  mutation
})