import User from "../../../libs/blablaland/User"
import { Packet, ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

interface FlowerData {
    [key: number]: { itemId: number; message: string; condition?: () => boolean }
}
class Druid {

    /**
     *
     * @param user
     * @param event
     */
    execute(user: User, event: SkinEvent): void {
        if (event.skinId === 518 || event.skinId === 520) {
            if (event.type === 0) {
                user.transform.wolf()
            } else if (event.type === 1) {
                const winPID: number = event.packet.bitReadSignedInt(16)

                const FX: ParamsFX|undefined = user.hasFX(6, `FLOWER`)
                if (FX) {
                    const quantity: number = Math.floor(Math.random() * 3) + 1

                    const flowerData: FlowerData = {
                        0: { itemId: 175, message: "pétales de lys" },
                        1: { itemId: 174, message: "pétales de rose" },
                        2: { itemId: 176, message: "pétales de tulipe" },
                        3: { itemId: 177, message: "trèfle(s)", condition: () => Math.random() < 0.5 },
                    }

                    const colorModel = FX?.memory || 0
                    const selectedFlower = flowerData[colorModel]
                    let itemId: number = selectedFlower.itemId
                    let itemMessage: string = `${quantity} ${selectedFlower.message}`

                    if (selectedFlower.condition && selectedFlower.condition()) {
                        itemId = 178
                        itemMessage = `${quantity} brin(s) d'herbe`
                    }

                    user.inventory.reloadOrInsertObject(itemId, { isSubtraction: false }, quantity)

                    let packetSender: Packet = {
                        type: 1,
                        subType: 13
                    }

                    const message: string = `Tu as ajouté \n${itemMessage} dans ton sac d'herboriste !`

                    const socketMessage: SocketMessage = new SocketMessage(packetSender)
                    socketMessage.bitWriteUnsignedInt(16, winPID)
                    socketMessage.bitWriteString(message)
                    user.socketManager.send(socketMessage)
                    user.interface.addInfoMessage(message)
                }
            }
        } else {
            const FX: ParamsFX|undefined = user.hasFX(4, `WOLF`)
            if (FX) {
                user.userFX.dispose(FX)
            }
        }
    }
}

export default Druid