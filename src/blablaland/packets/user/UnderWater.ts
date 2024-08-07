import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class UnderWater {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        for (let FX of user.userFX.getListFX()) {
            if (FX.id == 3) {
                user.userFX.dispose(FX)
            }
        }
    }
}

export default UnderWater