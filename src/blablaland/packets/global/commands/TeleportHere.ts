import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"
import ServerManager from "../../../../libs/manager/ServerManager"

class TeleportHere extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            for (let i = 1; i < params.length; i++) {
                const userFound: User|undefined = serverManager.getUserByPseudo(params[i], {
                    inConsole: false
                })

                if (userFound) {
                    userFound.getCamera()?.gotoMap(user.mapId, {
                        serverId: userFound.serverId !== user.serverId ? user.serverId : undefined,
                        isTeleportForce: true
                    })
                } else {
                    user.interface.addInfoMessage(`Le blabla ${params[i]} n'est pas connecté ou n'existe pas.`)
                }
            }
        }
    }
}

export default TeleportHere