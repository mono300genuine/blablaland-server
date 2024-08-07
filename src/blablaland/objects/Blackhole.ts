import User from "../../libs/blablaland/User"
import { MapDefinition, ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import Map from "../../libs/blablaland/Map"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import Maps from "../../json/maps.json"

class Blackhole {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const positionX: number = item.packet.bitReadSignedInt(16)
        const positionY: number = item.packet.bitReadSignedInt(16)
        const mapId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        const mapSender: Map = universeManager.getMapById(user.mapId)
        const mapReceived: Map = universeManager.getMapById(mapId)
        const mapParadis: MapDefinition|undefined = Maps.find((m): boolean => m.paradisId == mapId)

        if (mapSender.hasFX(5, `BLACKHOLE`) ||
            mapReceived.hasFX(5, `BLACKHOLE`)) {
            return user.interface.addInfoMessage(`Impossible d'ajouter ce trou noir, aucun trou noir ne doit être présent dans votre map ou celle de destination.`)
        } else if (mapId === user.mapId || mapReceived.isSpecial() || mapParadis) {
            return user.interface.addInfoMessage(`Impossible d'ajouter un trou noir sur cette map !`)
        } else if (mapReceived.isSpecial()) {
            return
        }

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, this.generateBlackHole(true, mapId, positionX, positionY, false), mapId],
            identifier: `BLACKHOLE`,
            duration: 30
        }
        mapSender.mapFX.writeChange(user, params)

        const mapFound: MapDefinition|undefined  = Maps.find((m): boolean => m.id == mapId)
        if (mapFound) {
            params.data[2] = this.generateBlackHole(false, mapId, mapFound.respawnX ? mapFound.respawnX / 100 : 475, mapFound.respawnY ? mapFound.respawnY / 100 : 212, false)
            mapReceived.mapFX.writeChange(user, params)

            item.database.quantity--
            user.inventory.reloadObject(item.database)
        }
    }

    private generateBlackHole(isSource: boolean, mapId: number, positionX: number, positionY: number, isWhite: boolean): SocketMessage {
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteBoolean(isSource)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, mapId)
        socketMessage.bitWriteSignedInt(16, positionX)
        socketMessage.bitWriteSignedInt(16, positionY)
        socketMessage.bitWriteBoolean(isWhite)
        return socketMessage
    }
}

export default Blackhole