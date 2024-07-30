module.exports = (req, res, next) => {
    if (req.session && req.session.userId) {
      next();
    } else {
      res.status(401).json({ error: 'No autorizado' });
    }
  };
  