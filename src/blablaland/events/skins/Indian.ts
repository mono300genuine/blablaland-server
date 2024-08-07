import User from "../../../libs/blablaland/User"
import  {ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage";
import SkinColor from "../../../libs/blablaland/SkinColor";
import UniverseManager from "../../../libs/manager/UniverseManager"

class Indian {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        if (event.type === 0) {
            const map = universeManager.getMapById(user.mapId)

            const nbTotem = map.mapFX.getListFX().filter(FX => FX.identifier?.includes(`INDIAN_TOTEM`)).length
            if (nbTotem < 3) {
                const positionX: number = event.packet.bitReadSignedInt(17)
                const positionY: number = event.packet.bitReadSignedInt(17)

                const socketMessage: SocketMessage = new SocketMessage
                socketMessage.bitWriteSignedInt(17, positionX)
                socketMessage.bitWriteSignedInt(17, positionY)
                SkinColor.exportBinaryColor(socketMessage, user.skinColor)

                let params: ParamsFX = {
                    id: 5,
                    identifier: `INDIAN_TOTEM`,
                    data: [34, 5, socketMessage],
                    duration: 60
                }
                map.mapFX.writeChange(user, params)
            }
        }
    }
}

export default Indian