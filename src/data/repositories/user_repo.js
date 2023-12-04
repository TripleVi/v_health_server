import { userProperties } from "../neo4j/neo4j_properties.js";
import Neo4jService from "../neo4j/neo4j_service.js";
import User from "../../models/user.js";

class UserRepo {
    #driver

    constructor() {
        this.#driver = Neo4jService.instance.driver
    }

    #toUser(neo4jUser) {
        return new User(
            neo4jUser[userProperties.uid], neo4jUser[userProperties.username], neo4jUser[userProperties.email], neo4jUser[userProperties.firstName], neo4jUser[userProperties.lastName], neo4jUser[userProperties.dateOfBirth], neo4jUser[userProperties.gender], neo4jUser[userProperties.weight], neo4jUser[userProperties.height], neo4jUser[userProperties.avatarUrl],
        )
    }

    #toNeo4jUser(user) {
        const neo4jUser = {}
        neo4jUser[userProperties.uid] = user.uid
        neo4jUser[userProperties.username] = user.username
        neo4jUser[userProperties.password] = user.password
        neo4jUser[userProperties.email] = user.email
        neo4jUser[userProperties.firstName] = user.firstName
        neo4jUser[userProperties.lastName] = user.lastName
        neo4jUser[userProperties.dateOfBirth] = user.dateOfBirth
        neo4jUser[userProperties.gender] = user.gender
        neo4jUser[userProperties.weight] = user.weight
        neo4jUser[userProperties.height] = user.height
        neo4jUser[userProperties.avatarUrl] = user.avatarUrl
        return neo4jUser
    }

    async getUsers(options) {
        const session = this.#driver.session()
        const emailParam = options.email;
        const usernameParam = options.username;
        let result;
        try {
            if(emailParam != undefined) {
                result = await session.run(`
                    MATCH (user:User {email: $emailParam})
                    RETURN user`,
                    { emailParam },
                )
            }else if(usernameParam != undefined) {
                result = await session.run(`
                    MATCH (user:User {username: $usernameParam})
                    RETURN user`,
                    { usernameParam },
                )
            }else {
                result = await session.run(`
                    MATCH (user:User)
                    RETURN user`,
                )
            }
            return result.records.map(record => {
                const neo4jUser = record.get('user')['properties']
                return this.#toUser(neo4jUser)
            })
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async getUserById(uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH (user:User {uid: $uidParam})
                RETURN user`,
                { uidParam: uid },
            )
            const neo4jUser = result.records[0].get('user')['properties']
            return this.#toUser(neo4jUser)
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async userExists(uid) {
        const session = this.#driver.session()
        try {
            const result = await session.run(`
                MATCH(user:User {uid: $uidParam})
                RETURN user`,
                { uidParam: uid },
            )
            return result.records.length === 1
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async createUser(user) {
        if(!(user instanceof User)) {
            throw new TypeError('"user" must be an instance of User')
        }
        const session = this.#driver.session()
        try {
            const neo4jUser = this.#toNeo4jUser(user)
            const result = await session.run(`
                CREATE (user:User $props)
                RETURN user`,
                { props: neo4jUser }
            )
            const createdNeo4jUser = result.records[0].get('user')['properties']
            return this.#toUser(createdNeo4jUser)
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }

    async deleteUser(userId) {
        if(!(userId instanceof String)) {
            throw new TypeError('"userId" must be an instance of string')
        }
        const session = this.#driver.session()
        try {
            return await session.run(`
                MATCH (u:User {userId: $userIdParam})
                SET u.isDeleted = 1`,
                { userIdParam: userId }
            )
        } catch (error) {
            throw error
        } finally {
            session.close()
        }
    }
}

export default UserRepo;