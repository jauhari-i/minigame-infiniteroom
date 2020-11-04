const { transactionServices } = require('../../services/v1');
const { validationResult } = require('express-validator');

const transaksiService = transactionServices;

module.exports = transaksiController = {
  createTransaction: async (req, res) => {
    const { cart } = req.body;
    const query = await transaksiService.checkoutTransaction(cart, req.decoded);
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
  uploadBukti: async (req, res) => {
    const photo = req.file;
    const photoUrl = photo.path;
    const { token } = req.body;
    const query = await transaksiService.addBukti({ photoUrl, token }, req.decoded);
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
  confirmTransaction: async (req, res) => {
    const { id } = req.params;
    const query = await transaksiService.acceptTransaction(id, req.decoded);
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
  rejectTransaction: async (req, res) => {
    const err = validationResult(req);
    if (err.errors.length) {
      let messages = err.errors.map((m) => ({
        message: m.msg,
      }));
      res.status(400).json(messages);
    } else {
      const { id } = req.params;
      const { reason } = req.body;
      if (!reason) {
        return res.status(400).json({
          code: 400,
          message: 'Reason Rejected is required',
        });
      }
      const query = await transaksiService.rejectTransaction(id, reason, req.decoded);
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
  listTransactionAll: async (req, res) => {
    const query = await transaksiService.listTransaction();
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
  detailTransaction: async (req, res) => {
    const { id } = req.params;
    const query = await transaksiService.detailTransaction(id);
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
  deleteTranaction: async (req, res) => {
    const { id } = req.params;
    const query = await transaksiService.deleteTransaction(id);
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
  userTransaction: async (req, res) => {
    const query = await transaksiService.userTransaction(req.decoded);
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
};
