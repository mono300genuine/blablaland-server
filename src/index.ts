import Database from "./libs/Database"
import RateLimiter from "./libs/network/RateLimiter"
import ServerManager from "./libs/manager/ServerManager"
import FlashSocket from "./libs/network/FlashSocket"
import Universe from "./libs/network/Universe"
import Universes from "./json/universes.json"
const { execSync } = require('child_process')
import 'dotenv/config'


const database: Database = new Database({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database:process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD
})
global.db = database.connect()

const rateLimiter: RateLimiter = new RateLimiter()
const serverManager: ServerManager = new ServerManager()
Universes.forEach(universe => {
    serverManager.push(new Universe(universe, serverManager, rateLimiter))
})
new FlashSocket()

global.db('players').update({ online: 0 }).then()

process.on('uncaughtException', (err: Error) => console.error(err))

process.env.BRANCH = executeGitCommand('git rev-parse --abbrev-ref HEAD')
process.env.COMMIT_SHA = executeGitCommand('git rev-parse HEAD')
process.env.COMMIT_DATE = executeGitCommand('git show -s --format=%cI')

function executeGitCommand(command: string) {
    return execSync(command)
        .toString('utf8')
        .replace(/[\n\r\s]+$/, '')
}

setInterval((): void => {rateLimiter.clearInactiveRequests()}, 300000)