class User {
    constructor(_fullName, _email, _password) {
        this.id = crypto.randomUUID();
        this.fullName = _fullName;
        this.email = _email;
        this.password = _password;
    }
}
export default User;