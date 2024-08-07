import User from "../../libs/blablaland/User"
import { MapDefinition, ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import Map from "../../libs/blablaland/Map"
import Maps from "../../json/maps.json"

class Flower {

    /**
     * @param user
     * @param item
     * @param universeManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager): void {
        const errorMessage: string = `On trouve trop souvent cet objet sur la map, attends un peu !`
        const map: Map = universeManager.getMapById(user.mapId)
        let isWatered: boolean = false
        let userID: number = 0

        if (item.type.fxFileId === 42) {
            userID = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        } else {
            isWatered = item.packet.bitReadBoolean()
        }

        if ([140, 287].includes(item.type.id)) {
            if (!this.checkMaxItemsOnMap(map, item.type.id, 5)) {
                return user.interface.addInfoMessage(errorMessage)
            }
        }

        const positionX: number = item.packet.bitReadSignedInt(16)
        const positionY: number = item.packet.bitReadSignedInt(16)
        const surfaceBody: number = item.packet.bitReadUnsignedInt(8)
        const name: string = item.packet.bitReadString()
        const colorModel: number = item.packet.bitReadUnsignedInt(5)

        if ([269, 287].includes(item.type.id)) {
            const mapFound: MapDefinition|undefined = Maps.find((m): boolean => m.id == user.mapId)
            if (mapFound && mapFound.respawnX !== null && mapFound.respawnY !== null && map.isProtected() &&
                mapFound.respawnX / 100 >= positionX - 25 && mapFound.respawnX / 100  <= positionX + 25) {
                return user.interface.addInfoMessage(`Impossible de placer cet objet près d'un spawn sur une map protégée !`)
            }
        }

        const dateServer: number = Date.now()
        const socketMessage: SocketMessage = new SocketMessage
        if (item.type.fxFileId === 42) {
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, userID)
        }
        socketMessage.bitWriteSignedInt(16, positionX)
        socketMessage.bitWriteSignedInt(16, positionY)
        socketMessage.bitWriteUnsignedInt(8, surfaceBody)
        socketMessage.bitWriteString(name)
        if (item.type.fxFileId === 29) {
            socketMessage.bitWriteUnsignedInt(5, colorModel)
        }
        socketMessage.bitWriteString(user.pseudo)
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000) + 3600)

        item.packet = new SocketMessage
        if (item.type.fxFileId !== 42) {
            item.packet.bitWriteBoolean(isWatered)
        }
        item.packet.bitWriteBinary(socketMessage)

        const params: ParamsFX = {
            id: 5,
            data: [item.type.fxFileId, item.type.id, item.packet],
            memory: [`FLOWER`, isWatered, socketMessage, user.id],
            isPersistant: true,
            duration: 3600
        }
        map.mapFX.writeChange(user, params)

        item.database.quantity--
        user.inventory.reloadObject(item.database)
    }

    /**
     * @param map
     * @param itemId
     * @param maxAllowed
     */
    checkMaxItemsOnMap(map: Map, itemId: number, maxAllowed: number): boolean {
        let nbItems: number = 0
        for (let FX of map.mapFX.getListFX()) {
            if (FX.data[1] === itemId) {
                nbItems++
            }
        }
        return nbItems < maxAllowed
    }
}

export default Flower