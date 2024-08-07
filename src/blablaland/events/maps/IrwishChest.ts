import User from "../../../libs/blablaland/User"
import { MapEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import Chest from "../../../libs/helper/Chest"

class IrwishChest {

    /**
     *
     * @param user
     * @param event
     */
    async execute(user: User, event: MapEvent): Promise<void> {
        const MILLIS_IN_75_MINUTES: number = 75 * 60 * 1000
        const isEven75MinutesPeriod: boolean = Math.floor(Date.now() / MILLIS_IN_75_MINUTES) % 2 === 0
        const startOfDay: number = new Date().setHours(0, 0, 0, 0)

        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteUnsignedInt(3, event.type)

        if (isEven75MinutesPeriod && (!user.rewarded_at || user.rewarded_at < startOfDay)) {
            if (event.type === 0) {
                socketMessage.bitWriteSignedInt(32, 0)
            } else if (event.type === 1) {
                socketMessage.bitWriteSignedInt(32, Math.floor(Date.now() / 1000))
                socketMessage.bitWriteUnsignedInt(3, 0)
                socketMessage.bitWriteString(Chest.reward(user))

                user.rewarded_at = Date.now()
                await global.db('players').where('user_id', user.id).update({ rewarded_at: global.db.fn.now() })
            }

            user.userFX.writeChange({
                id: 8,
                data: socketMessage,
                isPersistant: false,
                isMap: false
            })
        }
    }
}

export default IrwishChest