import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import User from "../../../libs/blablaland/User"
import ExternalFiles from "../../../json/externalFiles.json"

class ExternalFileLoaded {

    /**
     * @param user
     * @param packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        const type: number = packet.bitReadUnsignedInt(4)
        const fileId: number = packet.bitReadUnsignedInt(16)
        const bytes: number = packet.bitReadUnsignedInt(32)

        const loadFile = ExternalFiles.find(file => file.fileId === fileId && file.type === type)
        if (!loadFile || loadFile.bytes !== bytes) {
            return user.socketManager.close(`Le GrandSage n'apprécie pas vos méthodes !`)
        }
        user.isGameUnmodified = true
    }
}

export default ExternalFileLoaded