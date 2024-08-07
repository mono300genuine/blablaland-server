import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager";
import ServerManager from "../../../../libs/manager/ServerManager";

class Size extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const userFound: User|undefined = serverManager.getUserByPseudo(params[1], {
                inConsole: false
            })

            if (userFound) {
                userFound.interface.addLocalMessage(params.slice(2).join(' '), {
                    isMap: true
                })
            } else {
                user.interface.addInfoMessage(`Blabla introuvable !!`)
            }
        }
    }
}

export default Size