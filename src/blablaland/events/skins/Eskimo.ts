import User from "../../../libs/blablaland/User"
import { ParamsFX, SkinEvent } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import Map from "../../../libs/blablaland/Map"

class Eskimo {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        if (event.type === 0) {
            const positionX: number = event.packet.bitReadSignedInt(17)
            const positionY: number = event.packet.bitReadSignedInt(17)
            const map = universeManager.getMapById(user.mapId)
            let nbItem: number = 0

            const mapFX: ParamsFX = {
                id: 5,
                identifier: `SNOWMAN`,
                data: [16, 69, new SocketMessage()],
                memory: {
                    x: positionX,
                    y: positionY,
                    step: 0,
                    ended: false
                }
            }

            for (let FX of map.mapFX.getListFX()) {
                if (FX.id === 5 && FX.identifier?.includes(`SNOWMAN`)) {
                    if (FX.memory.x >= positionX - 50 && FX.memory.x <= positionX + 50 &&
                        FX.memory.y >= positionY - 50 && FX.memory.y <= positionY + 50) {

                        if (FX.memory.step < 6)
                            FX.memory.step++;

                        mapFX.sid = FX.sid
                        mapFX.memory = FX.memory
                    }
                    nbItem++
                }
            }

            if (nbItem >= 5 && mapFX.sid === undefined) {
                return user.interface.addInfoMessage(`Il y a trop de bonhommes de neige sur cette map pour le moment !`)
            }

            if (mapFX.memory.step == 6 && !mapFX.memory.ended)
                mapFX.memory.ended = true

            mapFX.data[2] = this.writeEvolution(mapFX)
            const paramsFX: ParamsFX = map.mapFX.writeChange(user, mapFX)

            clearTimeout(paramsFX.memory.decrement)
            mapFX.memory.decrement = setTimeout((): void => {
                this.decrementCount(user, map, paramsFX.sid!)
            }, 60000)
        }
    }

    /**
     *
     * @param FX
     * @private
     */
    private writeEvolution(FX: ParamsFX): SocketMessage {
        const dateServer: number = Date.now()
        const socketMessage: SocketMessage = new SocketMessage()
        socketMessage.bitWriteSignedInt(17, FX.memory.x)
        socketMessage.bitWriteSignedInt(17, FX.memory.y)
        socketMessage.bitWriteBoolean(FX.memory.ended)
        socketMessage.bitWriteUnsignedInt(8, Math.floor(FX.memory.step * 255 / 6))
        socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
        socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
        return socketMessage
    }

    private decrementCount(user: User, map: Map, sid: number): void {
        const FX: ParamsFX|undefined = map.mapFX.getListFX().find((item: ParamsFX) => item.id === 5 && item.sid == sid)
        if (FX) {
            FX.memory.step -= 1
            console.log(FX.memory.step)
            clearTimeout(FX.memory.decrementCount)
            if (FX.memory.step > 0) {
                FX.memory.decrement = setTimeout((): void => {
                    this.decrementCount(user, map, sid)
                }, 60000)

                FX.data[2] = this.writeEvolution(FX)
                map.mapFX.writeChange(user, FX)
            } else {
                map.mapFX.dispose(user, FX)
            }
        }
    }
}

export default Eskimo