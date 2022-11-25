export default class User {
	private friends: string[] = [];
  constructor(
		private name: string,
		private password: string,
	) {}

  getName() {
    return this.name;
  }

  getPassword() {
    return this.password;
  }

	getFriends() {
		return this.friends;
	}

	addFriend(friendname: string) {
		this.friends.forEach((name: string) => {
			if (name === friendname)
				throw new Error("already a friend");
		});
		this.friends.push(friendname);
	}

  toJson(): JSON {
    // return {name: this.name};
    return JSON.parse(JSON.stringify(this));
  }
}
