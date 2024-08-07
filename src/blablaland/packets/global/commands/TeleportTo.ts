import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"
import ServerManager from "../../../../libs/manager/ServerManager"

class TeleportTo extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const userFound: User|undefined = serverManager.getUserByPseudo(params[1], {
                inConsole: false
            })

            if (userFound) {
                const mapFound = universeManager.getMapById(userFound.mapId)
                if (!mapFound.isGame() && (!mapFound.isHouse() || user.isAdmin())) {
                    user.getCamera()?.gotoMap(userFound.mapId, {
                        serverId: userFound.serverId !== user.serverId ? userFound.serverId : undefined,
                        mapFileId: mapFound.fileId != mapFound.id ? mapFound.fileId : undefined,
                        isTeleportForce: true
                    })
                } else user.interface.addInfoMessage(`Impossible de se téléporter à la map de ${userFound.pseudo}.`)
            } else {
                user.interface.addInfoMessage(`Le joueur n'est pas connecté ou n'existe pas.`)
            }
        }
    }
}

export default TeleportTo