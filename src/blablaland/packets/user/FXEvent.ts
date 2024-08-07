import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import FileLoader from "../../../libs/FileLoader"
import { FXEvent as Event } from "../../../interfaces/blablaland"
import FX from "../../../json/events/FX.json"

class FXEvent {

    private readonly fileLoader: FileLoader<any>

    constructor() {
        this.fileLoader = new FileLoader<any>(__dirname + '/../../events/FX')
    }
    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const FX_ID: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_FX_ID)
        const FXEvent = FX.find((event) => event.FX_ID === FX_ID)

        if (FXEvent) {
            if (user.mapId !== 10) {
                const event: Event = {
                    FX_ID: FXEvent.FX_ID,
                    callback: FXEvent.callback,
                    packet: packet
                }
                await this.loadEvent(user, event, universeManager, serverManager)
            }
        } else {
            console.warn('\x1b[31m%s\x1b[0m', `FXEvent ${FX_ID} not found`)
        }
    }

    private async loadEvent(user: User, event: Event, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        try {
            await this.fileLoader.loadAndExecute(`${event.callback}.js`, user, event, universeManager, serverManager)
            if (process.env.DEBUG === 'true') {
                console.info('\x1b[32m%s\x1b[0m', `Load FXEvent ${event.FX_ID} (${event.callback})`)
            }
        } catch (e) {
            console.warn('\x1b[31m%s\x1b[0m', `Error loading FXEvent ${event.FX_ID}`)
        }
    }
}

export default FXEvent