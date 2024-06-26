import User from "../../models/user.js";

class UserResponseDto {
    constructor(user) {
        if(user instanceof User) {
            this.uid = user.uid
            this.username = user.username
            this.email = user.email
            this.name = user.name
            this.dateOfBirth = user.dateOfBirth
            this.gender = user.gender
            this.weight = user.weight
            this.height = user.height
            this.avatarUrl = user.avatarUrl
            return
        }
        throw new TypeError('"user" must be an instance of User')
    }
}

class UserCreationDto {
    constructor(body) {
        this.uid = body["uid"]
        this.username = body["username"]
        this.email = body["email"]
        this.name = body["name"]
        this.dateOfBirth = body["dateOfBirth"]
        this.gender = body["gender"]
        this.weight = body["weight"]
        this.height = body["height"]
        this.avatarUrl = body["avatarUrl"]
    }

    toUser() {
        return new User(this.uid, this.username, this.email, this.name, this.dateOfBirth, this.gender, this.weight, this.height, this.avatarUrl)
    }
}

export { UserCreationDto, UserResponseDto }