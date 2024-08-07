import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage";

class SecretWarrior {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        const socketMessage: SocketMessage = new SocketMessage
        socketMessage.bitWriteUnsignedInt(8, 15)

        user.userFX.writeChange({
            id: 6,
            data: [30, 4, socketMessage],
            duration: 15
        })
    }
}

export default SecretWarrior