import User from "../../../libs/blablaland/User"
import { MapEvent, ParamsFX } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import StatGame, { Game }  from "../../../libs/blablaland/games/StatGame"

class Pyramid {

    /**
     *
     * @param user
     * @param event
     */
    async execute(user: User, event: MapEvent): Promise<void> {
        if (event.type === 0) {
            const FX: ParamsFX|undefined = user.hasFX(4, `PHARAOH`)
            if (FX) {
                user.userFX.dispose(FX)

                const dateServer: number = Date.now()
                const timePyramid: number = Math.floor(dateServer / 1000) - FX.memory
                const pyramidToken: number = Math.max(0, Math.floor(25 - ((25/300) * timePyramid)))

                if (pyramidToken > 0) {
                    const socketMessage: SocketMessage = new SocketMessage
                    socketMessage.bitWriteUnsignedInt(3, 0)
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(32, timePyramid)
                    socketMessage.bitWriteUnsignedInt(16, pyramidToken)

                    user.userFX.writeChange({
                        id: 8,
                        data: socketMessage,
                        isPersistant: false,
                        isMap: false
                    })
                    await StatGame.upsertPlayerStats(Game.PYRAMID, user.id, pyramidToken, 1, 0, pyramidToken)
                }

                user.interface.addInfoMessage(`${user.pseudo} vient de traverser la pyramide en ${timePyramid} secondes et gagne ${pyramidToken} jetons !!`, {
                    isMap: true
                })
            }
        } else if (event.type === 1) { //JetonList
            const FX: ParamsFX|undefined = user.hasFX(4, `PHARAOH`)
            if (!FX) {
                user.transform.pharaoh()
            }
            if (Math.floor(Math.random() * 11) >= 8) { // 20% Chance
                const socketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(3, 1)
                socketMessage.bitWriteBoolean(true)

                user.userFX.writeChange({
                    id: 8,
                    data: socketMessage,
                    duration: 20
                })
            }
        } else if (event.type === 2) { //jetonEnterFrameEvt
            const FX: ParamsFX|undefined = user.hasFX(4, `PHARAOH`)
            if (FX) {
                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(3, 1)
                socketMessage.bitWriteBoolean(false)
                user.userFX.writeChange({
                    id: 8,
                    data: socketMessage,
                    isMap: false
                })
                await StatGame.upsertPlayerStats(Game.PYRAMID, user.id, 0,  0,  0, 1)
            }
        }
    }
}

export default Pyramid