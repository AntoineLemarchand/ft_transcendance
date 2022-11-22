export default class User {
  constructor(private name: string) {}

  getName() {
    return this.name;
  }

  getPassword() {
    return 'test';
  }

  toJson(): JSON {
    // return {name: this.name};
    return JSON.parse(JSON.stringify(this));
  }
}
