import { Knex } from "knex"

declare global {
    namespace NodeJS {
    }

    /* Global variables follow. They *must* use var to work.
        and cannot be initialized here. */

    var db: Knex
}

export { }