export class User {
    id: string;
    email: string;
    name: string;
    password: string;

    constructor(data) {
        this.id = data['@rid'] || data.id || null;
        this.email = data.email || null;
        this.name = data.name || null;
        this.password = data.password || null;
    }
}

export default User;