import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import universeManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import { Packet } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"

class Affinity {

    /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param  {ServerManager} serverManager
     * @returns void
     */
    execute(user: User, packet: SocketMessage, universeManager: universeManager, serverManager: ServerManager): void {
        const senderID: number = packet.bitReadUnsignedInt(24)
        const receivedID: number = packet.bitReadUnsignedInt(24)
        const type: number = packet.bitReadUnsignedInt(3)

        const receiver: User|undefined = serverManager.getUserById(receivedID, { inConsole: false })
        const sender: User|undefined = serverManager.getUserById(senderID, { inConsole: false })

        if (type === 1) {
            const pseudo: string = packet.bitReadString()

            if (receiver) {
                const packetSender: Packet = {
                    type: 2,
                    subType: 5
                }
                const socketMessage: SocketMessage = new SocketMessage(packetSender)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, senderID)
                socketMessage.bitWriteString(pseudo)
                receiver.socketManager.send(socketMessage)
            }
        } else if (type === 2 || type === 3) {
            const pseudoSender: string = packet.bitReadString()
            const pseudoReceiver: string = packet.bitReadString()

            const packetSender: Packet = {
                type: 2,
                subType: 7
            }
            packetSender.subType = type === 2 ? 7 : 8
            let socketMessage: SocketMessage = new SocketMessage(packetSender)

            if (receiver) {
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, senderID)
                socketMessage.bitWriteString(pseudoSender)
                receiver.socketManager.send(socketMessage)

                if (sender) {
                    type === 2
                        ? receiver.addListFriend({ userId: sender.id, isSender: true, pseudo: sender.pseudo, isAccepted: true })
                        : type === 3 && receiver.removeListFriend(sender.id)
                }
            }
            if (sender) {
                socketMessage = new SocketMessage(packetSender)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, receivedID)
                socketMessage.bitWriteString(pseudoReceiver)
                sender.socketManager.send(socketMessage)

                if (receiver) {
                    type === 2
                        ? sender.addListFriend({ userId: receiver.id, isSender: true, pseudo: receiver.pseudo, isAccepted: true })
                        : type === 3 && sender.removeListFriend(receiver.id)
                }
            }
        } else if (type === 4) { // Add Blacklist
            if (sender && receiver) {
                const packetSender: Packet = {
                    type: 2,
                    subType: 6
                }
                const socketMessage: SocketMessage = new SocketMessage(packetSender)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, receivedID)
                socketMessage.bitWriteString(receiver.pseudo)
                sender.socketManager.send(socketMessage)

                sender.addListEnemy({ userId: receiver.id, pseudo: receiver.pseudo })
            }
        } else if (type === 5) {  // Remove Blacklist
            if (sender && receiver) {
                const packetSender: Packet = {
                    type: 2,
                    subType: 9
                }
                const socketMessage: SocketMessage = new SocketMessage(packetSender)
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, receivedID)
                sender.socketManager.send(socketMessage)

                sender.removeListEnemy({ userId: receiver.id, pseudo: receiver.pseudo })
            }
        }
    }
}

export default Affinity