const Contacto = require("../models/contactoModel");

exports.index = (req, res) => {
  return res.render("contacto", { contacto: {} });
};

exports.read = async (req, res) => {
  const userID = req.session.user.email;
  const user = req.session.user;

  const contactos = await Contacto.getContactos(userID);
  res.render("contactos-list", { contactos, user });
};

exports.register = async (req, res) => {
  const userID = req.session.user.email;

  try {
    const contacto = new Contacto(req.body);
    await contacto.register(userID);

    if (contacto.errors.length > 0) {
      req.flash("errors", contacto.errors);
      req.session.save(() => res.redirect("back"));
      return;
    }

    req.flash("success", "Contacto registado com sucesso.");
    req.session.save(() => res.redirect(`/contacto/list`));
    return;
  } catch (error) {
    console.log(error);
    return res.send("ERRO DE CONEXAO");
  }
};

exports.editIndex = async (req, res) => {
  if (!req.params.id) return res.send("ERRO");

  const userID = req.session.user.email;
  const contactoID = req.params.id;

  try {
    const contacto = await Contacto.getId(contactoID, userID);
    if (!contacto) return res.send("ERRO");

    res.render("contacto", { contacto });
  } catch (error) {
    console.log(error);
    return res.send("ERRO");
  }
};

exports.edit = async (req, res) => {
  const userID = req.session.user.email;
  const contactoID = req.params.id;

  try {
    if (!contactoID) return res.send("ERRO");

    const contacto = new Contacto(req.body);

    await contacto.edit(contactoID, userID);

    if (contacto.errors.length > 0) {
      req.flash("errors", contacto.errors);
      req.session.save(() => res.redirect("back"));
      return;
    }

    req.flash("success", "Contacto editado com sucesso.");
    req.session.save(() => res.redirect(`/contacto/list`));
    return;
  } catch (error) {
    console.log(error);
    res.send("ERRO DE CONEXAO");
  }
};

exports.delete = async (req, res) => {
  const userID = req.session.user.email;
  const contactoID = req.params.id;

  if (!contactoID) return res.send("ERRO");

  const contacto = await Contacto.delete(contactoID, userID);
  if (!contacto) return res.send("ERRO");

  req.flash("success", "Contacto apagado com sucesso.");
  req.session.save(() => res.redirect("back"));
};
