exports.globalMid = (req, res, next) => {
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");
  res.locals.user = req.session.user;
  console.log(req.session.user);
  next();
};

/**
 * Verifica se o formulário tem um CSURF válido
 */
exports.checkCsrfError = (err, req, res, next) => {
  if (err) {
    console.log(err);
    return res.render("erro");
  }
  next();
};

/**
 * Cria um código CSURF nos formulários do app
 */
exports.csrfMiddleware = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};
