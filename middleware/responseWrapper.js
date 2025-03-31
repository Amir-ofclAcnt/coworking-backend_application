module.exports = (req, res, next) => {
    const oldJson = res.json;
    res.json = function (data) {
      oldJson.call(this, {
        success: true,
        data,
      });
    };
    next();
  };
  