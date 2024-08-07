import User from "../../../libs/blablaland/User"
import { SkinEvent } from "../../../interfaces/blablaland"
import UniverseManager from "../../../libs/manager/UniverseManager"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class DragonSylvain {

    /**
     *
     * @param user
     * @param event
     * @param universeManager
     */
    execute(user: User, event: SkinEvent, universeManager: UniverseManager): void {
        let isGrew: boolean = false
        const item: User = user
        const isAllowGrew: number[] = [102, 140, 182, 183, 184, 269, 332]

        for (let FX of universeManager.getMapById(user.mapId).mapFX.getListFX()) {
            if (FX.memory && FX.memory[0] === `FLOWER` && !FX.memory[1] && isAllowGrew.includes(FX.data[1])) {
                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteBinary(FX.memory[2])

                FX.memory[1] = true
                isGrew = true
                universeManager.getMapById(user.mapId).mapFX.writeChange(user, {
                    id: 5,
                    sid: FX.sid,
                    data: [FX.data[0], FX.data[1], socketMessage],
                    memory: FX.memory,
                    duration: 7200,
                })
            }
        }

        if (isGrew) {
            item.interface.addInfoMessage(`Grâce à toi les fleurs de la map vont vivre 1h de plus :)`, {
                isMap: false
            })
        }
    }
}

export default DragonSylvain