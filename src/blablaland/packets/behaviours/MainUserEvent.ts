import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { Packet } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"
import Camera from "../../../libs/blablaland/Camera"

class MainUserEvent {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        const cameraFound: Camera|undefined = user.getCamera()
        if (!cameraFound || !cameraFound.mapReady) return

        const mapId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_MAP_ID)
        user.time = packet.bitReadUnsignedInt(32)

        user.walker.readStateFromMessage(packet)

        const packetSender: Packet = {
            type: 5,
            subType: 4
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, mapId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_SERVER_ID, user.serverId)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
        socketMessage.bitWriteUnsignedInt(32, user.time)
        socketMessage = user.walker.writeStateToMessage(socketMessage)

        socketMessage.bitWriteUnsignedInt(2, packet.bitReadUnsignedInt(2))
        socketMessage.bitWriteUnsignedInt(24, packet.bitReadUnsignedInt(24))
        socketMessage.bitWriteUnsignedInt(8, packet.bitReadUnsignedInt(8))
        socketMessage.bitWriteSignedInt(18, packet.bitReadSignedInt(18))
        socketMessage.bitWriteSignedInt(18, packet.bitReadSignedInt(18))

        user.socketManager.sendAll(socketMessage)
        user.socketManager.send(new SocketMessage({ type: 1, subType: 11 }))
        user.clearIntervalDodo(user.walker.jump != 0 || user.walker.walk != 0)
    }
}

export default MainUserEvent