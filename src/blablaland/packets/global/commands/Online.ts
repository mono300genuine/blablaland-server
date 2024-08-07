import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"
import ServerManager from "../../../../libs/manager/ServerManager"

class Size extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            let message: string = ``
            if (params[1]) {
                const userFound: User|undefined = serverManager.getUserByPseudo(params[1], {
                    inConsole: false
                })

                if (userFound) {
                    message = this.formatMessage(userFound)
                } else {
                    message = 'Blabla introuvable !!'
                }
            } else {
                const countUsers: number = serverManager.getListUser().length
                serverManager.getListUser().forEach((user: User, index: number): void => {
                    message += this.formatMessage(user)
                    if (index !== countUsers - 1) {
                        message += `\n`
                    }
                })
                user.interface.addInfoMessage(`Total de ${countUsers} blabla(s) :`)
            }

            return user.interface.addInfoMessage(message)
        }
    }

    private formatMessage(user: User): string {
        return `${user.pseudo} ${user.inConsole ? '(console)' : ''} => mapId : ${user.mapId}, serverId: ${user.serverId}`
    }
}

export default Size