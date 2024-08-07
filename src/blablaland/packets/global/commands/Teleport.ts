import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import Maps from "../../../../json/maps.json"
import UniverseManager from "../../../../libs/manager/UniverseManager"

class Teleport extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const mapFound = Maps.find(map => map.id == parseInt(params[1]))
            if (mapFound) {
                const map = universeManager.getMapById(mapFound.id)
                if (!map.isHouse() && !map.isGame() && user.grade >= mapFound.gradeId) {
                    user.getCamera()?.gotoMap(parseInt(params[1]), {
                        serverId: params[2] !== undefined ? parseInt(params[2]) : undefined,
                        isTeleportForce: true
                    })
                }
            }
        }
    }
}

export default Teleport