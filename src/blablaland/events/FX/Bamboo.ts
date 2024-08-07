import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import {FXEvent, ParamsFX} from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"

class Bamboo {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: FXEvent, universeManager: UniverseManager): void {
        const type: number = event.packet.bitReadUnsignedInt(3)

        if (type === 0) {
            const FX_SID: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_SID)
            const direction: boolean = event.packet.bitReadBoolean()
            const map = universeManager.getMapById(user.mapId)

            const FX: ParamsFX|undefined = map.mapFX.getListFX().find((FX) => FX.id === 5 && FX.sid === FX_SID)

            if (FX && FX.memory && FX.memory[0] === `FLOWER` && FX.data[1] === 287) {
                if (user.hasEnemy(FX.memory[3])) return
                const dateServer: number = Date.now()
                const socketMessage: SocketMessage = new SocketMessage
                socketMessage.bitWriteBinary(FX.memory[2])
                socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_PID, user.pid)
                socketMessage.bitWriteBoolean(direction)

                map.mapFX.writeChange(user, {
                    id: 5,
                    sid: FX.sid,
                    data: [FX.data[0], FX.data[1], socketMessage],
                    memory: FX.memory,
                    duration: FX.duration,
                    isPersistant: false
                })
            }
        }
    }
}

export default Bamboo