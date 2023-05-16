const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const foundUser = await User.findOne({ _id: context.user._id });
        return foundUser;
      } else {
        throw new AuthenticationError('You should log in first!');
      }
    },
  },
  Mutation: {
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email, password });
      if (!user) {
        throw new AuthenticationError('Incorrect credentials!');
      }
      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials!');
      } else {
        const token = signToken(user);
        return { token, user };
      }
    },
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { bookData }, context) => {
      if (context.user) {
        const user = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: bookData } },
          { runValidators: true, new: true }
        );
        return user;
      } else {
        throw new AuthenticationError('You need to be logged in!');
      }
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const user = await User.findByIdAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
        return user;
      }
    },
  },
};

module.exports = resolvers;
