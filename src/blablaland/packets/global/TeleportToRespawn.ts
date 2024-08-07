import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { MapDefinition } from "../../../interfaces/blablaland"
import Maps from "../../../json/maps.json"

class TeleportToRespawn {

    /**
     * @param user
     */
    execute(user: User): void {
        const map: MapDefinition|undefined = Maps.find(m => m.id == user.id)
        if (map && map.respawnX && map.respawnY) {
            user.walker.positionX = map.respawnX
            user.walker.positionY = map.respawnY
        } else {
            user.walker.positionX = 5000
            user.walker.positionY = 35000
        }
        user.walker.underWater = false
        user.walker.grimpe = false
        user.walker.accroche = false
        user.walker.speedY = 0
        user.walker.speedY = 0
        user.walker.reloadState()
    }
}

export default TeleportToRespawn