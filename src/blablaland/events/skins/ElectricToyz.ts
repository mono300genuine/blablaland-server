import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class ElectricToyz {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        if (event.type === 0) {
            const positionX: number = event.packet.bitReadSignedInt(17)
            const positionY: number = event.packet.bitReadSignedInt(17)
            const dateServer: number = Date.now()
            const duration: number = 10

            const launchedAt: number = Math.floor(dateServer / 1000)
            const socketMessage: SocketMessage = new SocketMessage()
            socketMessage.bitWriteSignedInt(16, positionX)
            socketMessage.bitWriteSignedInt(16, positionY)
            socketMessage.bitWriteSignedInt(32, launchedAt)
            socketMessage.bitWriteSignedInt(7, duration)

            const paramsEarthquake: ParamsFX = {
                id: 5,
                data: [2, 10, socketMessage],
                identifier: `EARTHQUAKE`,
                duration: duration
            }
            const params: ParamsFX = {
                id: 4,
                data: [launchedAt, 50, duration],
                duration: duration
            }

            universeManager.getMapById(user.mapId).mapFX.writeChange(user, paramsEarthquake)
            universeManager.getMapById(user.mapId).mapFX.writeChange(user, params)
        }
    }
}

export default ElectricToyz