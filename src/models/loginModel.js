const mongoose = require("mongoose");
const validator = require("validator");
const bcryptjs = require("bcryptjs");

const loginSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  creationDate: { type: Date, default: Date.now },
});

const loginModel = mongoose.model("user", loginSchema);

class Login {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  /**
   * Regista o usuário na Base de Dados
   *
   * 1º Valida o formulário
   * 2º Verifica se o usuário já existe na BD
   * 3º Encripta a senha do usuário e faz o registo na BD
   *
   * Caso alguma dessas etapas falhe, a função retorna null
   */
  async register() {
    this.validate("register");

    if (this.errors.length > 0) return;

    await this.userExists();

    if (this.errors.length > 0) return;

    const salt = bcryptjs.genSaltSync();
    this.body.password = bcryptjs.hashSync(this.body.password, salt);
    this.user = await loginModel.create(this.body);
  }

  /**
   * Verifica se o usuário já existe na BD, com base no email fornecido no formulário
   *
   * O email serve de ID para cada usuário
   *
   * Caso já exista um usuário registado na BD com esse email, a função acrescenta um erro no this.errors
   */
  async userExists() {
    this.user = await loginModel.findOne({ email: this.body.email });

    if (this.user) this.errors.push("Usuario ja existe.");
  }

  /**
   * Faz a validação dos formulários
   *
   * Caso haja um campo mal preenchido, a função acrescenta um erro no this.errors
   *
   * @param v_Type tipo de formulário
   */
  validate(v_Type) {
    this.cleanUp();

    if (v_Type === "register") {
      if (
        !this.body.name ||
        !this.body.lastname ||
        !this.body.email ||
        !this.body.password
      )
        this.errors.push("Preencha todos os campos.");
    }

    if (v_Type === "login") {
      if (!this.body.email || !this.body.password)
        this.errors.push("Preencha todos os campos.");
    }

    if (this.body.email && !validator.isEmail(this.body.email))
      this.errors.push("Email invalido");

    if (
      this.body.password &&
      (this.body.password.length < 5 || this.body.password.length > 50)
    )
      this.errors.push("A senha deve ter entre 5 a 50 caracteres");
  }

  /**
   * Organiza os campos do formulário
   *
   * Para todo campo que não conter uma String o seu valor será "apagado" (inteiros do formulário chegam como String)
   *
   * Captaliza os nomes e limpa espaços em branco
   */
  cleanUp() {
    for (const key in this.body) {
      if (typeof this.body[key] !== "string") {
        this.body[key] = "";
      }
      this.body[key] = this.body[key].trim();
    }

    if (this.body.name)
      this.body.name =
        this.body.name.charAt(0).toUpperCase() + this.body.name.slice(1);

    if (this.body.lastname)
      this.body.lastname =
        this.body.lastname.charAt(0).toUpperCase() +
        this.body.lastname.slice(1);
  }

  /**
   * Responsável pelo login do usuário
   *
   * Verifica se na BD existe um usuário com esse email (ID)
   *
   * Caso não exista, acrescenta um erro no this.errors e retorna null
   *
   * Caso exista, verifica se as senhas são compatíveis
   */
  async loginUser() {
    this.validate("login");

    if (this.errors.length > 0) return;

    this.user = await loginModel.findOne({ email: this.body.email });

    if (!this.user) {
      this.errors.push("Usuario ou senha invalidos.");
      return;
    }

    if (!bcryptjs.compareSync(this.body.password, this.user.password)) {
      this.errors.push("Usuario ou senha invalidos.");
      this.user = null; // para limpar a resposta do loginModel.findOne()
      return;
    }
  }

  /**
   * Faz a validação do formulário de editar senha
   */
  validatePassword() {
    for (const key in this.body) {
      if (typeof this.body[key] !== "string") {
        this.body[key] = "";
      }
      this.body[key] = this.body[key].trim();
    }

    if (
      !this.body.oldpassword ||
      !this.body.newpassword ||
      !this.body.checkpassword
    )
      this.errors.push("Preencha todos os campos.");

    if (
      this.body.newpassword &&
      (this.body.newpassword.length < 5 || this.body.newpassword.length > 50)
    )
      this.errors.push("A senha deve ter entre 5 a 50 caracteres");

    if (this.body.newpassword !== this.body.checkpassword)
      this.errors.push("Senha de confirmacao deve ser igual a nova.");
  }

  /**
   * Responsável por alterar a senha do usuário na BD
   *
   * Se a senha de verificação for igual a senha na BD a nova senha é encriptada e enviada á BD, substituindo a antiga
   *
   * @param sessionUser Objecto que contém os dados do usuário em secção
   */
  async changePassword(sessionUser) {
    this.validatePassword();

    if (this.errors.length > 0) return;

    if (!bcryptjs.compareSync(this.body.oldpassword, sessionUser.password)) {
      this.errors.push("Senha actual invalida.");
      return;
    }

    const salt = bcryptjs.genSaltSync();
    sessionUser.password = bcryptjs.hashSync(this.body.newpassword, salt);

    this.user = await loginModel.findByIdAndUpdate(
      sessionUser._id.trim(),
      sessionUser,
      {
        new: true,
      }
    );
  }
}

module.exports = Login;
