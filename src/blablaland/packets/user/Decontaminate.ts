import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { ParamsFX } from "../../../interfaces/blablaland"

class Decontaminate {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    execute(user: User, packet: SocketMessage): void {
        const type: number = packet.bitReadUnsignedInt(16)

        let FX: ParamsFX|undefined = user.hasFX(4, `4`)
        if (FX) {
            user.userFX.dispose(FX)
        }
    }
}

export default Decontaminate