import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import { ObjectDatabase } from "../../interfaces/database"

class Sword {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const type: number = item.packet.bitReadUnsignedInt(2)

        if (item.type.id === 238 || item.type.id === 313) { // inflatable
            item.packet.bitReadUnsignedInt(2)
        }

        const FX: ParamsFX|undefined = user.hasFX(6, `SWORD`)
        if (type === 0) {
            if (!FX) {
                let params: ParamsFX = {
                    id: 6,
                    data: [item.type.fxFileId, item.type.id],
                    identifier: `SWORD`
                }
                user.userFX.writeChange(params)
            } else {
                user.userFX.dispose(FX)
                if (item.type.id !== FX.data[1]) {
                    item.packet.bitPosition = 0
                    this.execute(user, item)
                }
            }
        } else if (type == 2) {
            if (FX) user.userFX.dispose(FX)
        } else if (type == 3) {
            const socketMessage: SocketMessage = new SocketMessage()
            if (item.type.id === 223) {
                this.animateStove(user, item, socketMessage)
            } else if (item.type.id === 299) { // Horia
                const type: number = item.packet.bitReadUnsignedInt(3)
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(2, type)
            } else {
                const isActive: boolean = item.packet.bitReadBoolean()
                socketMessage.bitWriteBoolean(isActive)
            }

            const params: ParamsFX = {
                id: 6,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                isPersistant: false,
            }
            user.userFX.writeChange(params)
        }
    }

    private animateStove(user: User,  item: ObjectDefinition, socketMessage: SocketMessage) {
        const type: number = item.packet.bitReadUnsignedInt(3)
        const sirop: ObjectDatabase|undefined = user.inventory.getObject(280)
        socketMessage.bitWriteBoolean(true)
        if (type == 1) {
            let dateServer: number = Date.now()
            socketMessage.bitWriteUnsignedInt(2, 0)
            socketMessage.bitWriteBoolean(true)
            socketMessage.bitWriteBoolean(!!(sirop && sirop.quantity > 0))
            socketMessage.bitWriteUnsignedInt(5, 5)
            socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
            socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
        } else if (type == 2) {
            socketMessage.bitWriteUnsignedInt(2, 1)
        }  else if (type == 3) {
            const sirop: ObjectDatabase|undefined = user.inventory.getObject(280)
            if(sirop && sirop.quantity) {
                sirop.quantity--
                user.inventory.reloadObject(sirop)
                // Give Crepe
                user.inventory.reloadOrInsertObject(222, {
                    isSubtraction: false
                })
            }
        }
    }
}

export default Sword