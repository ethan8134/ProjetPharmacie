export class Medicament {
  constructor(id, denomination, formepharmaceutique, qte, photo) {
    this._id = id;
    this._denomination = denomination;
    this._formepharmaceutique = formepharmaceutique;
    this._qte = qte;
    this._photo = photo;
  }

  get id() {
    return this._id;
  }

  get denomination() {
    return this._denomination;
  }

  get formepharmaceutique() {
    return this._formepharmaceutique;
  } 

  get quantite() {
    return this._qte;
  }

  get photo() {
    return this._photo;
  }

  toString() {
    return `--> ${this._denomination} `;
  }
}
