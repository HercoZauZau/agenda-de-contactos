const mongoose = require("mongoose");
const validator = require("validator");

const ContactoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lastname: { type: String, required: false, default: "" },
  email: { type: String, required: false, default: "" },
  number: { type: String, required: false, default: "" },
  creationDate: { type: Date, default: Date.now },
});

const ContactoModel = (userID) => {
  return mongoose.model(`contactos by ${userID}`, ContactoSchema);
};

class Contacto {
  constructor(body) {
    this.body = body;
    this.errors = [];
    this.contacto = null;
  }

  /**
   * Resgista o contacto na BD
   *
   * @param userID ID do usuário em secção
   */
  async register(userID) {
    this.validate();
    if (this.errors.length > 0) return;
    this.contacto = await ContactoModel(userID).create(this.body);
  }

  /**
   * Faz a validação do formulário
   */
  validate() {
    this.cleanUp();

    if (this.body.email && !validator.isEmail(this.body.email))
      this.errors.push("Email invalido");
    if (!this.body.name) this.errors.push("Nome e um campo obrigatorio");
    if (!this.body.email && !this.body.number)
      this.errors.push("Registe o email ou telefone no minimo.");
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
   * Atualiza os dados do contacto na BD
   *
   * @param contactoID ID do contacto
   * @param userID ID do usuário
   */
  async edit(contactoID, userID) {
    try {
      if (typeof contactoID !== "string") return;

      this.validate();

      if (this.errors.length > 0) return;

      this.contacto = await ContactoModel(userID).findByIdAndUpdate(
        contactoID.trim(),
        this.body,
        {
          new: true,
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
}

// Métodos Estáticos

/**
 * Busca os dados do contacto com base no ID
 *
 * @param contactoID ID do contacto
 * @param userID ID do usuário
 * @returns Objecto com dados do contacto
 */
Contacto.getId = async (contactoID, userID) => {
  if (typeof contactoID !== "string") return;
  const contacto = await ContactoModel(userID).findById(contactoID);
  return contacto;
};

/**
 * Busca a lista de todos contactos do usuário na BD com base no ID do usuário
 *
 * @param userID ID do usuário
 * @returns Lista de objectos com dados dos contactos
 */
Contacto.getContactos = async (userID) => {
  const contactos = await ContactoModel(userID).find().sort({ name: 1 });
  return contactos;
};

/**
 * Apaga o contacto da BD
 *
 * @param contactoID ID do contacto
 * @param userID ID do usuário
 * @returns objecto com dados do contacto apagado
 */
Contacto.delete = async (contactoID, userID) => {
  if (typeof contactoID !== "string") return;
  const contacto = await ContactoModel(userID).findOneAndDelete({
    _id: contactoID,
  });
  return contacto;
};

module.exports = Contacto;
