import BaseCommand from "./BaseCommand"
import User from "../../../../libs/blablaland/User"
import { Command } from "../../../../interfaces/blablaland"
import SocketMessage from "../../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../../libs/manager/UniverseManager"

class SendGift extends BaseCommand {

    async execute(user: User, command: Command, params: string[], universeManager: UniverseManager): Promise<void> {
        if (this.validateArguments(user, command, params)) {
            const map = universeManager.getMapById(user.mapId)
            const kdo: number = [6, 1, 2, 5][parseInt(params[1])]
            if (kdo) {
                const dateServer: number = Date.now()

                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(32, Math.floor(dateServer / 1000))
                socketMessage.bitWriteUnsignedInt(10, dateServer % 1000)
                socketMessage.bitWriteUnsignedInt(8, kdo)

                map.mapFX.writeChange(user, {
                    id: 5,
                    identifier: `GIFT`,
                    data: [7, 1, socketMessage],
                    memory: [1, params[2] ? parseInt(params[2]) : [25, 50, 100, 200][ Math.floor(Math.random() * 4)]],
                    duration: 180
                })
            }
        }
    }
}

export default SendGift