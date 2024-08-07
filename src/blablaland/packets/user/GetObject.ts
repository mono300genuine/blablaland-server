import User from '../../../libs/blablaland/User'
import { ObjectDefinition, ObjectType } from '../../../interfaces/blablaland'
import { ObjectDatabase } from "../../../interfaces/database"
import SocketMessage from '../../../libs/blablaland/network/SocketMessage'
import UniverseManager from '../../../libs/manager/UniverseManager'
import ServerManager from '../../../libs/manager/ServerManager'
import Camera from '../../../libs/blablaland/Camera'
import Objects from '../../../json/objects.json'
import TeleportEnter from '../../objects/TeleportEnter'
import Pick from '../../objects/Pick'
import FileLoader from '../../../libs/FileLoader'
import 'dotenv/config'

class GetObject {

    private readonly fileLoader: FileLoader<ObjectType>

    constructor() {
        this.fileLoader = new FileLoader<ObjectType>(__dirname + '/../../objects')
    }

    async execute(user: User, packet: SocketMessage, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        const cameraFound: Camera | undefined = user.getCamera()
        if (!cameraFound || !cameraFound.mapReady || user.objectCooldown > Date.now() || user.mapId === 10 || universeManager.getMapById(user.mapId).isGame()) {
            return
        } else {
            if (user.hasFX(4, `72`)) {
                return user.interface.addInfoMessage(`Ìmpossible d'utiliser des objets en conduisant !!`)
            }
            const map = universeManager.getMapById(user.mapId)
            if (!map.isObjectAllowed && (!user.isModerator() && !map.bypassAllowed.includes(user.id))) {
                return user.interface.addInfoMessage(`Les pouvoirs sont temporairement désactivés sur cette map :o`)
            }
        }

        let { hasData, isForce, loadObject } = { hasData: false, isForce: false, loadObject: false }
        const objectId: number = packet.bitReadUnsignedInt(32)
        if (packet.bitReadBoolean()) {
            hasData = true
            packet = packet.bitReadBinaryData() as SocketMessage
        }

        const userObject: ObjectDatabase|undefined = user.inventory.getListObject().find((obj: ObjectDatabase): boolean => obj.id === objectId)

        if (objectId === 33) {
            new TeleportEnter().execute(user, packet, universeManager)
        } else if (objectId === 42 && !hasData && !user.isTouriste) {
            new Pick().execute(user, packet, universeManager)
        } else {
            if (objectId === 297) {
                isForce = true
            }
            loadObject = true
        }

        const obj = Objects.find(obj => obj.id === userObject?.objectId)
        if (obj) {
            if (loadObject && ((userObject && userObject.quantity > 0) || (userObject && isForce))) {
                const item: ObjectDefinition = { type: obj, database: userObject, packet }
                await this.loadObject(user, item, universeManager, serverManager)
            }
        }
    }

    private async loadObject(user: User, { type, database, packet }: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): Promise<void> {
        try {
            await this.fileLoader.loadAndExecute(`${type.callback}.js`, user, { type, database, packet }, universeManager, serverManager)
            user.objectCooldown = Date.now() + 400
            if (process.env.DEBUG === 'true') {
                console.info('\x1b[32m%s\x1b[0m', `Load object ${type.id} (${type.callback})`)
            }
        } catch (e) {
            console.warn('\x1b[31m%s\x1b[0m', `Error loading object ${type.id}`)
        }
    }
}

export default GetObject
