import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { ParamsFX } from "../../../interfaces/blablaland"

class CatchGift {

    /**
     * @param user
     * @param packet
     * @param universeManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager): Promise<void> {
        const FX_SID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
        const map = universeManager.getMapById(user.mapId)
        let FX: ParamsFX|undefined = undefined

         for (let mapFX of map.mapFX.getListFX()) {
             if (mapFX.sid === FX_SID) FX = mapFX
         }
         if (!FX) return

        if (FX.identifier?.includes(`FAKEGIFT`)) {
            user.interface.addInfoMessage(`Cadeau piégé posé par ${FX.memory[1]} ^^`, {
                isMap: true
            })
            map.mapFX.dispose(user, FX)
        } else if (FX.identifier?.includes(`GIFT`)) {
            const [type, value]: [number, number] = FX.memory
            let socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, FX_SID)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            socketMessage.bitWriteUnsignedInt(8, type)
            socketMessage.bitWriteString(`${value} BBL !`)
            if (type != 6) {
                socketMessage.bitWriteBoolean(true)
            }

            user.interface.addInfoMessage(`${user.pseudo} vient de ramasser un cadeau contenant ${value} bbl !! :D`, {
                isMap: true
            })

            const userBBL: number = await user.updateBBL(value, false)
            if (userBBL) {
                map.mapFX.writeChange(user, {
                    id: 5,
                    data: [7, 2, socketMessage],
                    isPersistant: false
                })
            }
            map.mapFX.dispose(user, FX)
        }
    }
}

export default CatchGift