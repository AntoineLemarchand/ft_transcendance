export class User {
  constructor(private name: string) {}

  getName() {
    return this.name;
  }

  toJson(): JSON {
    // return {name: this.name};
    return JSON.parse(JSON.stringify(this));
  }
}
