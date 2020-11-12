const {
  checkoutTransaction,
  userTransaction,
  detailTransaction,
  deleteTransaction,
  allTransaction,
  uploadTransactionPayment,
  acceptTransaction,
  rejectTransaction,
} = require('../../services/v2/transaction');
const { validationResult } = require('express-validator');

module.exports = controller = {
  checkoutTransactionUser: async (req, res) => {
    const { decoded } = req;
    const { cartId } = req.body;
    if (!cartId) {
      res.status(400).json({
        code: 400,
        message: 'Cart id is required',
      });
    } else {
      const query = await checkoutTransaction(cartId, decoded);
      if (query) {
        if (!query.code) {
          return res.status(500).json({
            code: 500,
            message: 'Internal server error',
          });
        }
        return res.status(query.code).json(query);
      }
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
      });
    }
  },
  getUserTransaction: async (req, res) => {
    const { decoded } = req;
    const query = await userTransaction(decoded);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  deleteTransactionData: async (req, res) => {
    const { id } = req.params;
    const query = await deleteTransaction(id);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  getDetailTransaction: async (req, res) => {
    const { id } = req.params;
    const query = await detailTransaction(id);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  getListTransaction: async (req, res) => {
    const query = await allTransaction();
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  uploadTransaction: async (req, res) => {
    const file = req.file;
    const { id } = req.params;
    const query = await uploadTransactionPayment(id, file, req.decoded);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  acceptUserTransaction: async (req, res) => {
    const { decoded } = req;
    const { id } = req.params;
    const query = await acceptTransaction(id, decoded);
    if (query) {
      if (!query.code) {
        return res.status(500).json({
          code: 500,
          message: 'Internal server error',
        });
      }
      return res.status(query.code).json(query);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });
  },
  rejectUserTransaction: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const { decoded } = req;
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({
          code: 400,
          message: 'Rejected reason is required',
        });
      }
      const query = await rejectTransaction(id, reason, decoded);
      if (query) {
        if (!query.code) {
          return res.status(500).json({
            code: 500,
            message: 'Internal server error',
          });
        }
        return res.status(query.code).json(query);
      }
      res.status(500).json({
        code: 500,
        message: 'Internal server error',
      });
    }
  },
};
