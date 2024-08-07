import User from "../../../libs/blablaland/User"
import { FXEvent, Packet } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties";
import SocketMessage from "../../../libs/blablaland/network/SocketMessage";
import Chest from "../../../libs/helper/Chest"

class MagicCauldron {

    /**
     *
     * @param user
     * @param event
     */
    async execute(user: User, event: FXEvent): Promise<void> {
        const type: number = event.packet.bitReadUnsignedInt(3)

        if (type === 1) { // Open
            const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
            const channelId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)
            const startOfDay: number = new Date().setHours(0, 0, 0, 0)
            const canOpen: boolean = !user.rewarded_at || user.rewarded_at < startOfDay

            const packetSender: Packet = {
                type: 1,
                subType: 16
            }
            const socketMessage: SocketMessage = new SocketMessage(packetSender)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, channelId)
            socketMessage.bitWriteUnsignedInt(3, 1)
            socketMessage.bitWriteBoolean(canOpen)
            if (canOpen) {
                socketMessage.bitWriteString(Chest.reward(user))

                user.rewarded_at = Date.now()
                await global.db('players').where('user_id', user.id).update({ rewarded_at: global.db.fn.now() })
            }
            user.socketManager.send(socketMessage)
        } else if (type === 2) {
            if (user.mapId != 350) {
                user.getCamera()?.gotoMap(350, {
                    method: 4
                })
            }
        }
    }
}

export default MagicCauldron