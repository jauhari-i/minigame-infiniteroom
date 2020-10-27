const { v4: uuid } = require('uuid');
const Cart = require('../../models/Cart');
const Game = require('../../models/Games');

module.exports = cartService = {
  getCart: async (decoded) => {
    try {
      const cartUser = await Cart.findOne({ userId: decoded.sub });
      if (!cartUser) {
        const cart = await Cart.create({
          cartId: uuid(),
          games: [],
          userId: decoded.sub,
        });
        return {
          code: 200,
          message: 'Get cart success',
          data: {
            cartId: cart.cartId,
            games: cart.games,
            total: 0,
          },
        };
      } else {
        let data = await Promise.all(
          cartUser.games.map(async (item) => {
            total = 0;
            const games = await Game.findOne({ gameId: item.gameId });
            total = total + games.price;
            const gameData = {
              gameId: games.gameId,
              imageUrl: games.imageUrl,
              posterUrl: games.posterUrl,
              title: games.title,
              genre: games.genre,
              price: games.price,
            };
            return gameData;
          })
        );
        if (data.length === 0) {
          return {
            code: 200,
            message: 'Get cart success',
            data: {
              cartId: cartUser.cartId,
              games: [],
              total: 0,
            },
          };
        } else {
          let total = await Promise.all(
            data.map((item) => {
              let price = 0;
              return price + item.price;
            })
          );
          return {
            code: 200,
            message: 'Get cart success',
            data: {
              cartId: cartUser.cartId,
              games: data,
              total: total.reduce((a, b) => a + b, 0),
            },
          };
        }
      }
    } catch (error) {
      return error;
    }
  },
  addItem: async (id, decoded) => {
    try {
      const game = await Game.findOne({ gameId: id, deletedAt: null });
      if (!game) {
        throw {
          code: 404,
          message: 'Game not found',
        };
      }
      const cart = await Cart.findOne({ userId: decoded.sub, deletedAt: null });
      if (!cart) {
        return {
          code: 500,
          message: 'Internal server error',
        };
      }
      let games = cart.games;
      const duplicated = games.find((g) => g.gameId === id);
      if (duplicated) {
        return {
          code: 400,
          message: 'Item already added to cart',
        };
      } else {
        games.push({
          gameId: id,
        });
        const query = await Cart.updateOne(
          { cartId: cart.cartId },
          { games: games, editedAt: Date.now() }
        );
        if (query) {
          return {
            code: 200,
            message: 'Add item success',
          };
        } else {
          return {
            code: 500,
            message: 'Internal server error',
          };
        }
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  removeItem: async (id, decoded) => {
    try {
      const game = await Game.findOne({ gameId: id, deletedAt: null });
      if (!game) {
        throw {
          code: 404,
          message: 'Game not found',
        };
      }
      const cart = await Cart.findOne({ userId: decoded.sub, deletedAt: null });
      if (!cart) {
        return {
          code: 500,
          message: 'Internal server error',
        };
      }
      if (cart.games.length === 0) {
        return {
          code: 400,
          message: 'Cart is empty',
        };
      }
      const games = cart.games.filter((obj) => {
        return obj.gameId !== id;
      });
      const query = await Cart.updateOne(
        { cartId: cart.cartId },
        { games: games, editedAt: Date.now() }
      );
      if (query) {
        return {
          code: 200,
          message: 'Remove item success',
        };
      } else {
        return {
          code: 500,
          message: 'Internal server error',
        };
      }
    } catch (error) {
      return error;
    }
  },
};
