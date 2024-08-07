import User from "../../../libs/blablaland/User"
import { SkinEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"

class FireFox {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        if (event.type === 0) {
            const positionX: number = event.packet.bitReadSignedInt(16)
            const positionY: number = event.packet.bitReadSignedInt(16)
            const surfaceBody: number = event.packet.bitReadUnsignedInt(8)
            const map = universeManager.getMapById(user.mapId)
            const dateServer: number = Date.now()

            let socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            socketMessage.bitWriteSignedInt(16, positionX)
            socketMessage.bitWriteSignedInt(16, positionY)
            socketMessage.bitWriteUnsignedInt(8, surfaceBody)
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
            socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
            socketMessage.bitWriteBoolean(user.walker.direction)

            const nbFire: number = map.mapFX.getListFX().filter(FX => FX.identifier?.includes(`FIRE`)).length
            if (nbFire < 4) {
                map.mapFX.writeChange(user, {
                    id: 5,
                    data: [30, 2, socketMessage],
                    isPersistant: false
                });
            } else {
                user.interface.addInfoMessage(`Tu dois attendre un peu, trop de flammes sur cette map !!`);
            }
        }
    }
}

export default FireFox