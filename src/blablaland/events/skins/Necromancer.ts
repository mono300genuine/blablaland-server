import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import Maps from "../../../json/maps.json"

class Necromancer {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        const map = universeManager.getMapById(user.mapId)
        if (event.type === 0) { // Bouclier
            if (map.hasFX(5, `SHIELD_NECRO_${user.id}_`)) return
            const positionX: number = event.packet.bitReadSignedInt(16)
            const positionY: number = event.packet.bitReadSignedInt(16)
            const dateServer: number = Date.now()

            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            socketMessage.bitWriteSignedInt(16, positionX)
            socketMessage.bitWriteSignedInt(16, positionY)
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))

            let params: ParamsFX = {
                id: 5,
                identifier: `SHIELD_NECRO_${user.id}`,
                data: [34, 1, socketMessage],
                duration: 120
            }
            map.mapFX.writeChange(user, params)
        } else if (event.type === 1) {
            const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
            const positionX: number = event.packet.bitReadSignedInt(16)
            const positionY: number = event.packet.bitReadSignedInt(16)

            const socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteSignedInt(16, positionX)
            socketMessage.bitWriteSignedInt(16, positionY)
            let params: ParamsFX = {
                id: 5,
                data: [34, 2, socketMessage],
                duration: 15
            }
            map.mapFX.writeChange(user, params)
        } else if (event.type === 2) { // Blackhole
            const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
            const positionX: number = event.packet.bitReadSignedInt(16)
            const positionY: number = event.packet.bitReadSignedInt(16)

            let mapFound = Maps.find(m => m.id == user.mapId)
            mapFound = Maps.find(m => m.id == mapFound?.paradisId ?? 253)

            if (mapFound) {
                let socketMessage: SocketMessage = new SocketMessage
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, mapFound.id)
                socketMessage.bitWriteSignedInt(16, positionX)
                socketMessage.bitWriteSignedInt(16, positionY)
                socketMessage.bitWriteBoolean(true)

                let params: ParamsFX = {
                    id: 5,
                    data: [8, 32, socketMessage, mapFound.id],
                    duration: 30
                }
                map.mapFX.writeChange(user, params)

                socketMessage = new SocketMessage
                socketMessage.bitWriteBoolean(false)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, mapFound.id)
                socketMessage.bitWriteSignedInt(16, mapFound.respawnX ? mapFound.respawnX / 100 : 475)
                socketMessage.bitWriteSignedInt(16, mapFound.respawnY ? mapFound.respawnY / 100 : 212)
                socketMessage.bitWriteBoolean(true)
                params.data[2] = socketMessage
                universeManager.getMapById(mapFound.id).mapFX.writeChange(user, params)
            }
        }
    }
}

export default Necromancer