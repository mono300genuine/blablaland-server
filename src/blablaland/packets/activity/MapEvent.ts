import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../../libs/manager/UniverseManager"
import FileLoader from "../../../libs/FileLoader"
import ServerManager from "../../../libs/manager/ServerManager"
import { MapEvent as Event } from "../../../interfaces/blablaland"
import Maps from "../../../json/events/maps.json"

class MapEvent {

    private readonly fileLoader: FileLoader<any>

    constructor() {
        this.fileLoader = new FileLoader<any>(__dirname + '/../../events/maps')
    }
    /**
     * Event management of maps environments
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @param  {UniverseManager} universeManager
     * @param serverManager
     * @returns void
     */
    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const type: number = packet.bitReadUnsignedInt(3)
        const mapEvent = Maps.find((event) => event.mapId === user.mapId)

        if (mapEvent) {
            const event: Event = {
                mapId: mapEvent.mapId,
                callback: mapEvent.callback,
                type: type,
                packet: packet
            }
            await this.loadEvent(user, event, universeManager, serverManager)
        } else {
            console.warn('\x1b[31m%s\x1b[0m', `MapEvent ${user.mapId} not found`)
        }
    }

    private async loadEvent(user: User, event: Event, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        try {
            await this.fileLoader.loadAndExecute(`${event.callback}.js`, user, event, universeManager, serverManager)
            if (process.env.DEBUG === 'true') {
                console.info('\x1b[32m%s\x1b[0m', `Load MapEvent ${event.mapId} (${event.callback})`)
            }
        } catch (e) {
            console.warn('\x1b[31m%s\x1b[0m', `Error loading MapEvent ${event.mapId}`)
        }
    }
}

export default MapEvent