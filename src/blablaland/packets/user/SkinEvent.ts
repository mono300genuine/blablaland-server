import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import UniverseManager from "../../../libs/manager/UniverseManager"
import ServerManager from "../../../libs/manager/ServerManager"
import FileLoader from "../../../libs/FileLoader"
import { SkinEvent as Event } from "../../../interfaces/blablaland"
import User from "../../../libs/blablaland/User"
import Skins from "../../../json/events/skins.json"

class SkinEvent {

    private readonly fileLoader: FileLoader<any>

    constructor() {
        this.fileLoader = new FileLoader<any>(__dirname + '/../../events/skins')
    }

    /**
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const skinId: number = packet.bitReadUnsignedInt(GlobalProperties.BIT_SKIN_ID)
        const type: number = packet.bitReadUnsignedInt(3)
        const skinEvent = Skins.find((event) => event.skinId === skinId)

        if (skinEvent) {
            if (user.mapId !== 10) {
                const event: Event = {
                    skinId: skinEvent.skinId,
                    callback: skinEvent.callback,
                    type: type,
                    packet: packet
                }
                await this.loadEvent(user, event, universeManager, serverManager)
            }
        } else {
            console.warn('\x1b[31m%s\x1b[0m', `SkinEvent ${skinId} not found`)
        }
    }

    private async loadEvent(user: User, event: Event, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        try {
            await this.fileLoader.loadAndExecute(`${event.callback}.js`, user, event, universeManager, serverManager)
            if (process.env.DEBUG === 'true') {
                console.info('\x1b[32m%s\x1b[0m', `Load SkinEvent ${event.skinId} (${event.callback})`)
            }
        } catch (e) {
            console.warn('\x1b[31m%s\x1b[0m', `Error loading SkinEvent ${event.skinId}`)
        }
    }
}

export default SkinEvent