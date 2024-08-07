import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"

class Car {

    /**
     * @param user
     * @param item
     */
    execute(user: User, item: ObjectDefinition): void {
        const type: number = item.packet.bitReadUnsignedInt(2)
        const FX: ParamsFX|undefined = user.hasFX(4, `CAR`)
        let skinId: number = 0

        switch (item.type.id) {
            case 94:
                skinId = 357
                break
            case 35:
                skinId = 234
                break
            default:
                skinId = 7
                break
        }

        const dateServer: number =  Date.now()
        const launchedAt: number = Math.floor(dateServer / 1000)

        if (type === 0) {
            if (!FX) {
                const color: number = item.packet.bitReadUnsignedInt(5)
                const socketMessage: SocketMessage = new SocketMessage
                socketMessage.bitWriteUnsignedInt(5, color)

                let params: ParamsFX = {
                    id: 4,
                    sid: 10,
                    data: {
                        skinId: skinId,
                        binary: socketMessage
                    },
                    duration: item.database.quantity,
                    launchedAt: launchedAt,
                    identifier: `CAR`,
                    memory: item.type.id,
                    isYourself: true
                }
                user.userFX.writeChange(params)
            } else {
                if (FX.data.skinId !== skinId) {
                    item.packet.bitPosition = 0
                    user.userFX.dispose(FX)
                    this.execute(user, item)
                } else {
                    user.userFX.dispose(FX)
                }
            }
        } else if (type === 2) {
            const FX: ParamsFX|undefined = user.hasFX(4, `CAR`)
            if (FX) {
                user.userFX.dispose(FX)
            }
        }
    }
}

export default Car