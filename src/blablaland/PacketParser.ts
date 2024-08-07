import GlobalProperties from "../libs/blablaland/network/GlobalProperties"
import ServerManager from "../libs/manager/ServerManager"
import SocketMessage from "../libs/blablaland/network/SocketMessage"
import UniverseManager from "../libs/manager/UniverseManager"
import Packets from "../json/packets.json"
import User from "../libs/blablaland/User"
import FileLoader from "../libs/FileLoader"
import 'dotenv/config'

class PacketParser {

    private readonly user: User
    private readonly packet: SocketMessage
    private readonly universeManager: UniverseManager
    private readonly serverManager: ServerManager
    private readonly fileLoader: FileLoader<any>

    /**
     *
     * @param user
     * @param packet
     * @param universeManager
     * @param serverManager
     */
    constructor(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager) {
        this.user = user
        this.packet = packet
        this.universeManager = universeManager
        this.serverManager = serverManager
        this.fileLoader = new FileLoader<any>(__dirname + '/packets')
        this.parsePacket().then()
    }

    /**
     * @private
     */
    private async parsePacket(): Promise<void> {
        this.packet.type = this.packet.bitReadUnsignedInt(GlobalProperties.BIT_TYPE)
        this.packet.subType = this.packet.bitReadUnsignedInt(GlobalProperties.BIT_STYPE)
        await this.loadPacket(this.packet.type, this.packet.subType)
    }

    /**
     *
     * @param type
     * @param subType
     * @private
     */
    private async loadPacket(type: number, subType: number): Promise<void> {
        const matchedPacket = Packets.find(packet => packet?.type === type && packet.subType === subType)

        try {
            if (matchedPacket) {
                let fileName: string | undefined = matchedPacket.fileName
                if (matchedPacket.folder) fileName = `${matchedPacket.folder}/${matchedPacket.fileName}`

                if (!(this.user.isTouriste && !matchedPacket.isPublic)) {
                    await this.fileLoader.loadAndExecute(`${fileName}.js`, this.user, this.packet, this.universeManager, this.serverManager)
                }
            }
        } catch (e) {}

        if (process.env.DEBUG === 'true') {
            console.info('\x1b[35m%s\x1b[0m', `${type},${subType} => ${matchedPacket?.fileName} ${this.user.pseudo && !this.user.isTouriste ? `(${this.user.pseudo})` : ''}`)
        }
    }
}

export default PacketParser;
