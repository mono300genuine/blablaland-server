import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import SkinColor from "../../../libs/blablaland/SkinColor"

class Paint {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        user.transform.paint(SkinColor.readBinaryColor(packet))
    }
}

export default Paint