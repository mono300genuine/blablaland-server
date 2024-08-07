import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class SkinAction {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        if(!user.walker.isDodo) {
            user.walker.setDodo(true)
            user.nbAFK = 4
        }
    }
}

export default SkinAction