import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import UniverseManager from "../../../../libs/manager/UniverseManager"
import Maps from "../../../../json/maps.json"

class TeleportMap extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const map = universeManager.getMapById(user.mapId)
            const mapFound = Maps.find(map => map.id == parseInt(params[1]))

            if (mapFound && user.grade >= mapFound.gradeId) {
                for (let item of map.getListUser()) {
                    item.getCamera()?.gotoMap(parseInt(params[1]), {
                        serverId: params[2] !== undefined ? parseInt(params[2]) : undefined,
                        isTeleportForce: true
                    })
                }
            }
        }
    }
}

export default TeleportMap