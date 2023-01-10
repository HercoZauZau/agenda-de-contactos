const express = require("express");
const route = express.Router();
const loginController = require("./src/controllers/loginController");
const contactoController = require("./src/controllers/contactoController");

/**
 * Rota da Home
 */

route.get("/", loginController.index);

/**
 * Rotas de Login
 *
 * Registar (criar) conta de usuário
 * Fazer login na conta
 * Terminar secção (logout) na conta
 */

route.post("/register", loginController.register);
route.post("/login", loginController.login);
route.get("/logout", loginController.logout);

/**
 * Rotas de Contacto
 *
 * Criar contacto (formulário)
 * Listar contactos registados
 * Registar contacto criado
 * Editar contacto (formulário)
 * Registar contacto editado
 * Excluir contacto existente
 */

route.get("/contacto", contactoController.index);
route.get("/contacto/list", contactoController.read);
route.post("/contacto/register", contactoController.register);
route.get("/contacto/:id", contactoController.editIndex);
route.post("/contacto/edit/:id", contactoController.edit);
route.get("/contacto/delete/:id", contactoController.delete);

/**
 * Rotas de Senha
 *
 * Editar Senha (formulário)
 * Registar nova senha
 */

route.get("/password/:id", loginController.passwordIndex);
route.post("/password/edit/:id", loginController.passwordEdit);

module.exports = route;
