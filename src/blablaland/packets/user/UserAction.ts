import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class UserAction {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        const FX_ID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_ID)
        const FX_SID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)

        user.transform.paint([2, 10, 2, 2, 2, 2, 2, 2, 2, 2])
    }
}

export default UserAction