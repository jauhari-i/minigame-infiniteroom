const Cart = require('../../../models/v2/Cart');
const CartItem = require('../../../models/v2/CartItem');
const Game = require('../../../models/v2/Games');
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
        cartGameData: {
          gameId: game.gameId,
          title: game.title,
          posterUrl: game.posterUrl,
          imageUrl: game.imageUrl,
          genre: game.genre,
          price: game.price,
          description: game.description,
          difficulty: game.difficulty,
          duration: game.duration,
          capacity: game.capacity,
          rating: game.rating,
          createdAt: game.createdAt,
          createdBy: game.createdBy,
        },
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
                return cartItemData;
              })
            );
            const duplicated = oldItemsData.find((g) => g.cartGameId === items.cartGameId);
            if (duplicated) {
              const deleteItems = await CartItem.deleteOne({ cartItemId: items.cartItemId });
              if (deleteItems) {
                throw {
                  code: 409,
                  message: 'Item alaready added on cart',
                };
              }
            } else {
              let allItems = oldItems;
              allItems.push(items.cartItemId);
              const updateCart = await Cart.updateOne(
                {
                  cartId: userCart.cartId,
                },
                {
                  items: allItems,
                  total: userCart.total + items.price,
                }
              );
              if (updateCart) {
                return {
                  code: 201,
                  message: 'Item added to cart',
                };
              } else {
                return {
                  code: 500,
                  message: 'Internal server error',
                };
              }
            }
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
      console.log(error);
      return error;
    }
  },
  removeFromCart: async (cartItemId, decoded) => {
    const { sub } = decoded;
    try {
      const userCart = await Cart.findOne({ userId: sub, deletedAt: null });
      const items = userCart.items;
      const newItems = items.filter((i) => i !== cartItemId);
      const updateCart = await Cart.updateOne(
        { cartId: userCart.cartId },
        {
          editedAt: Date.now(),
          items: newItems,
        }
      );
      if (updateCart) {
        const deleteItems = await CartItem.findOneAndDelete({ cartItemId: cartItemId });
        if (deleteItems) {
          const updateTotal = await Cart.updateOne(
            { cartId: userCart.cartId },
            {
              total: userCart.total - deleteItems.price,
              editedAt: Date.now(),
            }
          );
          return {
            code: 200,
            message: 'Items removed from cart',
          };
        } else {
          throw {
            code: 500,
            message: 'Internal server error',
          };
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
  getUserCart: async (decoded) => {
    const { sub } = decoded;
    try {
      const userCart = await Cart.findOne({ userId: sub, deletedAt: null });
      if (!userCart) {
        const newCart = await Cart.create({
          cartId: uuid(),
          items: [],
          total: 0,
          userId: sub,
        });
        if (newCart) {
          return {
            code: 200,
            message: 'Get cart success',
            data: {
              cartId: newCart.cartId,
              items: newCart.items,
              total: newCart.total,
              userId: newCart.userId,
            },
          };
        } else {
          throw {
            code: 500,
            message: 'Internal server error',
          };
        }
      } else {
        const items = userCart.items;
        const itemsData = await Promise.all(
          items.map(async (itemId) => {
            const cartItemData = await CartItem.findOne({ cartItemId: itemId });
            return {
              cartItemId: cartItemData.cartItemId,
              cartGameId: cartItemData.cartGameId,
              cartGameData: cartItemData.cartGameData,
              members: cartItemData.members,
              membersCount: cartItemData.membersCount,
              dateTimePlay: cartItemData.dateTimePlay,
              price: cartItemData.price,
              createdAt: cartItemData.createdAt,
            };
          })
        );
        if (itemsData.length) {
          return {
            code: 200,
            message: 'Get cart success',
            data: {
              cartId: userCart.cartId,
              items: itemsData,
              total: userCart.total,
              userId: userCart.userId,
            },
          };
        }
      }
    } catch (error) {
      return error;
    }
  },
};
