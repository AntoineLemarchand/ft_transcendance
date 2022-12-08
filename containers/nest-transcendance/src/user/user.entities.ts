export default class User {
	private friends: string[] = [];
	private channels: string[] = ['welcome'];
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

	removeFriend(friendname: string) {
		for (let i = 0; i < this.friends.length; i++) {
			if (this.friends[i] === friendname) {
				this.friends.splice(i);
				return;
			}
		}
	throw new Error("not your friend");
	}

  toJson(): JSON {
    // return {name: this.name};
    return JSON.parse(JSON.stringify(this));
  }
}
