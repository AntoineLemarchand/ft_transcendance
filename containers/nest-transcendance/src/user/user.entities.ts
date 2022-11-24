export default class User {
  constructor(private name: string, private password: string) {}

  getName() {
    return this.name;
  }

  getPassword() {
    return this.password;
  }

  toJson(): JSON {
    // return {name: this.name};
    return JSON.parse(JSON.stringify(this));
  }
}
