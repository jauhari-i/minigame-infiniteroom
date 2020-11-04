const Cart = require('../../../models/v2/Cart');
const CartItem = require('../../../models/v2/CartItem');
const Game = require('../../../models/v2/Games');
const User = require('../../../models/v2/Users');
const { v4: uuid } = require('uuid');

module.exports = services = {
  addToCart: async (dateTime, members, gameId, decoded) => {
    const { sub } = decoded;
    try {
      const game = await Game.findOne({ gameId: gameId, deletedAt: null });
      if (!game)
        throw {
          code: 404,
          message: 'Game not found',
        };
      const items = await CartItem.create({
        cartItemId: uuid(),
        cartGameId: game.gameId,
        cartGameData: game,
        dateTimePlay: dateTime,
        members: members,
        membersCount: members.length ? members.length : 0,
        price: game.price,
      });
      if (items) {
        const userCart = await Cart.findOne({ userId: sub, deletedAt: null });
        if (!userCart) {
          const newCart = await Cart.create({
            cartId: uuid(),
            items: [items.cartItemId],
            total: items.price,
            userId: sub,
          });
          if (newCart) {
            return {
              code: 201,
              message: 'Item added to cart',
            };
          } else {
            throw {
              code: 500,
              message: 'Internal server error',
            };
          }
        } else {
          const oldItems = userCart.items;
          if (oldItems.length > 0) {
            const oldItemsData = await Promise.all(
              oldItems.map(async (itemId) => {
                const cartItemData = await CartItem.findOne({ cartItemId: itemId });
                if (cartItemData) {
                  if (cartItemData.cartGameId === items.cartGameId) {
                    return {
                      error: 1,
                    };
                  } else {
                    let allItems = oldItems;
                    allItems.push(items.cartItemId);
                    const updateCart = await Cart.updateOne(
                      {
                        cartId: userCart.cartId,
                      },
                      {
                        items: allItems,
                        total: items.price + cartItemData.price,
                      }
                    );
                    if (updateCart) {
                      return updateCart;
                    } else {
                      return {
                        error: 3,
                      };
                    }
                  }
                } else {
                  return {
                    error: 2,
                  };
                }
              })
            );
            console.log(oldItemsData);
          } else {
            const updateCart = await Cart.updateOne(
              { cartId: userCart.cartId },
              {
                items: [items.cartItemId],
                total: items.price,
              }
            );
            if (updateCart) {
              return {
                code: 201,
                message: 'Item added to cart',
              };
            } else {
              throw {
                code: 500,
                message: 'Internal server error',
              };
            }
          }
        }
      } else {
        throw {
          code: 500,
          message: 'Internal server error',
        };
      }
    } catch (error) {
      return error;
    }
  },
  removeFromCart: async () => {},
  getUserCart: async () => {},
};
