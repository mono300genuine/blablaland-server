import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import Map from "../../libs/blablaland/Map"

class Earthquake {

    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const positionX: number = item.packet.bitReadSignedInt(16)
        const positionY: number = item.packet.bitReadSignedInt(16)
        const duration: number = 15

        const map: Map = universeManager.getMapById(user.mapId)
        if (map.hasFX(5, 'EARTHQUAKE')) {
            return
        }

        const dateServer: number = Date.now()
        const launchedAt: number =  Math.floor(dateServer / 1000)
        item.packet.bitWriteSignedInt(32, launchedAt)
        item.packet.bitWriteSignedInt(7, duration)

        let params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, item.packet],
            identifier: `EARTHQUAKE`,
            duration: duration
        }
        map.mapFX.writeChange(user, params)
        params = {
            id: 4,
            data: [launchedAt, 50, duration],
            duration: duration
        }
        map.mapFX.writeChange(user, params)
        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }
}

export default Earthquake