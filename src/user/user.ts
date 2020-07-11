export class User {
    id: string;
    email: string;
    name: string;
    password: string;

    constructor(data) {
        this.id = data.rid || data.id || null;
        this.email = data.email || null;
        this.name = data.name || null;
        this.password = data.password || null;

        this.id = this.id ? this.id.toString().replace('#', '') : null;
    }
}

export default User;