const Login = require("../models/loginModel");

/**
 * Renderiza a tela index (login) caso o usuário não esteja logado (em secção)
 */
exports.index = (req, res) => {
  if (req.session.user) {
    req.session.save(() => res.redirect(`/contacto/list`));
    return;
  }

  return res.render("index");
};

exports.register = async (req, res) => {
  try {
    const login = new Login(req.body);
    await login.register();

    if (login.errors.length > 0) {
      req.flash("errors", login.errors);
      req.session.save(() => {
        return res.redirect("back");
      });

      return;
    }

    req.flash("success", "Conta criada com sucesso.");
    req.session.save(() => {
      return res.redirect("back");
    });
  } catch (error) {
    console.log(error);
    return res.render("erro");
  }
};

exports.login = async (req, res) => {
  try {
    const login = new Login(req.body);
    await login.loginUser();

    if (login.errors.length > 0) {
      req.flash("errors", login.errors);
      req.session.save(() => {
        return res.redirect("back");
      });

      return;
    }

    req.session.user = login.user;
    req.session.save(() => {
      return res.redirect("back");
    });
  } catch (error) {
    console.log(error);
    return res.render("erro");
  }
};

exports.logout = async (req, res) => {
  await req.session.destroy();
  res.redirect("/");
};

exports.passwordIndex = (req, res) => {
  const id = req.session.user._id;
  return res.render("password", { id });
};

exports.passwordEdit = async (req, res) => {
  try {
    const sessionUser = req.session.user;
    const login = new Login(req.body);
    await login.changePassword(sessionUser);

    if (login.errors.length > 0) {
      req.flash("errors", login.errors);
      req.session.save(() => {
        return res.redirect("back");
      });

      return;
    }

    req.flash("success", `Senha alterada com sucesso!`);
    req.session.save(() => {
      return res.redirect(`/contacto/list`);
    });
  } catch (error) {
    console.log(error);
    return res.render("erro");
  }
};
