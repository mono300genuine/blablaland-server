import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"
import net from 'net'

class BanIP {

    /**
     * @param user
     * @param packet
     */
    async execute(user: User, packet: SocketMessage): Promise<void> {
        if (!user.hasRight('MASSBAN')) return
        const type: number = packet.bitReadUnsignedInt(10)

        switch (type) {
            case 1:
                const channelId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)
                const IPAddress: string = packet.bitReadString()
                let status: number = 0

                if (['::1', '127.0.0.1'].includes(IPAddress)) {
                    status = 3
                } else if (net.isIP(IPAddress)) {
                    await global.db.insert({
                        ip_address: IPAddress,
                        player_id: user.id,
                        created_at: global.db.fn.now(),
                        updated_at: global.db.fn.now()
                    }).into('bans')
                } else {
                    status = 1
                }

                const packetSender: Packet = {
                    type: 1,
                    subType: 16
                }
                const socketMessage: SocketMessage = new SocketMessage(packetSender)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, channelId)
                socketMessage.bitWriteUnsignedInt(8, status)
                user.socketManager.send(socketMessage)
        }
    }
}

export default BanIP