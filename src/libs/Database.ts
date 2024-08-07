import knex, { Knex } from "knex"
import { Connection } from "../interfaces/server"

class Database {

    private params

    constructor(params: Connection) {
        this.params = params
    }

    /**
     * @returns knex
     */
    connect(): Knex {
        return knex({
            client: 'mysql',
            connection: {
                host: this.params.host,
                user: this.params.user,
                password: this.params.password,
                port: this.params.port,
                database: this.params.database
            }
        })
    }
}

export default Database