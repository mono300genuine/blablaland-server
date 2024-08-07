import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import UniverseManager from "../../libs/manager/UniverseManager"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import SkinColor from "../../libs/blablaland/SkinColor"
import Map from "../../libs/blablaland/Map"

class AstralBody {

    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager) {
        const isActive: boolean = item.packet.bitReadBoolean()
        const name: string = item.packet.bitReadString()
        const colors: number[] = SkinColor.readBinaryColor(item.packet)

        let FX: ParamsFX|undefined = user.hasFX(6, `ASTRALBODY`)
        if (!FX && !user.walker.underWater) {
            if (universeManager.getMapById(user.mapId).isSpecial()) {
                return user.interface.addInfoMessage(`Impossible d'utiliser ce pouvoir dans une maison ou une map spéciale !!`)
            }
            const dateServer: number = Date.now()
            const launcherAt: number = Math.floor(dateServer / 1000)
            let socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(32, item.database.quantity)
            socketMessage.bitWriteUnsignedInt(32, launcherAt)
            user.transform.clear()

            user.userFX.writeChange( {
                id: 6,
                identifier: `ASTRALBODY`,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                memory: [user.walker.positionX, user.walker.positionY, user.walker.direction, user.mapId],
                launchedAt: launcherAt,
                duration: item.database.quantity
            })

            socketMessage = new SocketMessage()
            user.walker.writeStateToMessage(socketMessage, false, false)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SKIN_ID, user.skinId)
            socketMessage.bitWriteString(user.pseudo)
            socketMessage.bitWriteString(name)
            SkinColor.exportBinaryColor(socketMessage, colors)

            universeManager.getMapById(user.mapId).mapFX.writeChange(user, {
                id: 5,
                identifier: `ASTRALBODY_${user.id}`,
                data: [item.type.fxFileId, 22, socketMessage],
                duration: item.database.quantity,
                launchedAt: launcherAt
            })
            setTimeout((): void => {
                this.dispose(user, universeManager)
            }, item.database.quantity * 1000)
        } else {
            this.dispose(user, universeManager)
        }
    }

    /**
     * @param user
     * @param universeManager
     * @private
     */
    private dispose(user: User, universeManager: UniverseManager): void {
        let FX: ParamsFX|undefined = user.hasFX(6, `ASTRALBODY`)
        if (!FX) return

        user.userFX.dispose(FX)
        const [positionX, positionY, direction, mapId]: [number, number, boolean, number] = FX.memory
        if (mapId !== user.mapId) {
            user.getCamera()?.gotoMap(mapId, {
                method: 0,
                positionX: positionX,
                positionY: positionY,
                direction: direction
            })
        } else {
            user.walker.positionX = positionX
            user.walker.positionY = positionY
            user.walker.direction = direction
            user.walker.underWater = false
            user.walker.grimpe = false
            user.walker.accroche = false
            user.walker.speedY = 0
            user.walker.speedY = 0
            user.walker.reloadState({
                method: 0,
                loadSkin: true
            })
        }
        let map: Map|undefined = universeManager.getMapById(mapId)
        FX = map.hasFX(5, `ASTRALBODY_${user.id}_`)
        if (FX) {
            map.mapFX.dispose(user, FX)
        }
    }
}

export default AstralBody