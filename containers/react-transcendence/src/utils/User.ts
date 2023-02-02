export async function updateUserInfo(setter: Function) {
		fetch('http://' + process.env.REACT_APP_SERVER_IP + '/api/user/info/', {
				credentials: 'include',
				method: 'GET',
				headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
				},
		}).then((result) => {
			result.text().then((text)=> {
				setter(JSON.parse(text).userInfo);
			});
		})
}

export class User{
  name: string;
	friends: {name: string, status: string}[];
    constructor() {
        this.name = ''
        this.friends = []
    }
}
