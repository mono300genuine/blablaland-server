import User from "../../../libs/blablaland/User"
import { MapEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { ObjectDatabase } from "../../../interfaces/database"

class PirateQuest {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: MapEvent): void {
        const socketMessage: SocketMessage = new SocketMessage()

        if (event.type === 1) {
            socketMessage.bitWriteUnsignedInt(3, 0)
            socketMessage.bitWriteUnsignedInt(9, 2) // Elexir
            socketMessage.bitWriteSignedInt(8, 50)
            socketMessage.bitWriteBoolean(true)
        } else if (event.type === 0) {
            const pealCard: ObjectDatabase|undefined = user.inventory.getObject(231)
            const shovel: ObjectDatabase|undefined = user.inventory.getObject(232)
            const elexir: ObjectDatabase|undefined = user.inventory.getObject(203)
            const isDone: boolean = (elexir && elexir.quantity >= 2) ?? false

            socketMessage.bitWriteUnsignedInt(3, 1)
            socketMessage.bitWriteBoolean(isDone)
            if (isDone && elexir) {
                if (!pealCard) {
                    user.inventory.reloadOrInsertObject(231)
                }
                if (!shovel) {
                    user.inventory.reloadOrInsertObject(232)
                }
                elexir.quantity = elexir.quantity - 2
                user.inventory.reloadObject(elexir)
            }
        }
        user.userFX.writeChange({
            id: 8,
            data: socketMessage,
            isMap: false,
            isPersistant: false
        })
    }
}

export default PirateQuest