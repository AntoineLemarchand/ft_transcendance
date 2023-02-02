export class User{
  name: string;
	friends: {name: string, status: string}[];
    constructor() {
        this.name = ''
        this.friends = []
    }
}
