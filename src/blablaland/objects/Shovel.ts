import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import { ObjectDatabase } from "../../interfaces/database"

class Shovel {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const FX: ParamsFX|undefined = user.hasFX(6, `SHOVEL`)
        const type: number = item.packet.bitReadUnsignedInt(2)

        const socketMessage: SocketMessage = new SocketMessage()
        if (type === 0) {
            if (FX) {
                user.userFX.dispose(FX)
            }

            const duration: number = 3
            const dateServer: number = Date.now()
            socketMessage.bitWriteUnsignedInt(2, 0)
            socketMessage.bitWriteUnsignedInt(5, duration - 1)
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))

            const params : ParamsFX = {
                id: 6,
                identifier: 'SHOVEL',
                data: [item.type.fxFileId, item.type.id, socketMessage],
                duration: duration,
            }
            user.userFX.writeChange(params)
        } else if (type === 2) {
            if (FX) user.userFX.dispose(FX)
        } else if (type === 3) {
            const isNotFound: number = item.packet.bitReadUnsignedInt(2)
            if (user.mapId !== user.mapPearl) {
                user.interface.addInfoMessage(`Tu es map sur la mauvaise map, cherche encore !`)
            } else if (isNotFound === 1) { // Pearl not found
                socketMessage.bitWriteUnsignedInt(2, 2)
                const params : ParamsFX = {
                    id: 6,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    isPersistant: false,
                    isMap: false,
                }
                user.userFX.writeChange(params)
                user.interface.addInfoMessage(`Tu te rapproches !`)
            } else { // Pearl found
                const nbPearl: number = this.getRandomNumber(1, 5)
                socketMessage.bitWriteUnsignedInt(2, 1)
                socketMessage.bitWriteUnsignedInt(5, nbPearl)
                let params : ParamsFX = {
                    id: 6,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    isPersistant: false,
                    isMap: false,
                }
                const pealCard: ObjectDatabase|undefined = user.inventory.getObject(231)
                const shovel: ObjectDatabase|undefined = user.inventory.getObject(232)
                if (pealCard) user.inventory.removeObject(pealCard).then()
                if (shovel) user.inventory.removeObject(shovel).then()
                user.inventory.reloadOrInsertObject(233, { isSubtraction: false}, nbPearl)
                user.userFX.writeChange(params)
                user.interface.addInfoMessage(`Bravo tu as trouvé ${nbPearl} perles !`)
            }
        }
    }

    /**
     * @param min
     * @param max
     * @private
     */
    private getRandomNumber(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
}

export default Shovel