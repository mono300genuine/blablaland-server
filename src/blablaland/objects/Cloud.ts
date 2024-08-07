import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"

class Cloud {

    /**
     * Cloud user
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): void {
        const type: number = item.packet.bitReadUnsignedInt(3)
        const userId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const FX: ParamsFX|undefined = user.hasFX(6, `CLOUD`)
        const map = universeManager.getMapById(user.mapId)
        let params: ParamsFX = {}

        if (type === 0) {
            if (item.database.quantity <= 0) return
            const positionX: number = item.packet.bitReadSignedInt(16)
            const positionY: number = item.packet.bitReadSignedInt(16)

            if(FX) {
                user.userFX.dispose(FX)
                const hasNuage = serverManager.hasFX(5, `CLOUD_${user.id}_`)
                if (hasNuage && hasNuage.item) {
                    hasNuage.map.mapFX.dispose(user, hasNuage.item)
                }
            }

            let socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            socketMessage.bitWriteSignedInt(16, positionX)
            socketMessage.bitWriteSignedInt(16, positionY)

            const mapFX: ParamsFX|undefined = map.mapFX.writeChange(user, {
                id: 5,
                identifier: `CLOUD_${user.id}`,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                memory: [new Array<User>(), positionX, positionY],
                duration: 1200
            })

            socketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, user.mapId)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, mapFX.sid!)
            user.userFX.writeChange({
                id: 6,
                identifier: `CLOUD`,
                data: [item.type.fxFileId, 1, socketMessage],
                duration: 1200,
                isProtected: true,
                isMap: false
            })
            item.database.quantity--
            user.inventory.reloadObject(item.database)
        } else if (type === 1) {
            if (FX) {
                user.userFX.dispose(FX)
            }
            const hasNuage = serverManager.hasFX(5, `CLOUD_${user.id}_`)
            if (hasNuage && hasNuage.item) {
                hasNuage.map.mapFX.dispose(user, hasNuage.item)
            }
        } else if (type === 2) {
            let userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if(!userFound) return
            const hasNuage =  serverManager.hasFX(5, `CLOUD_${user.id}_`)

            if (hasNuage && hasNuage.item) {
                let [userList, positionX, positionY]: [Array<User>, number, number] = hasNuage.item.memory
                userList.push(userFound)

                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                socketMessage.bitWriteSignedInt(16, positionX)
                socketMessage.bitWriteSignedInt(16, positionY)
                for (let item of userList) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, item.id)
                }
                socketMessage.bitWriteBoolean(false)

                params = {
                    id: 5,
                    sid: hasNuage.item.sid,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    identifier: `CLOUD_${user.id}`,
                    duration: hasNuage.item.duration,
                    memory: [userList, positionX, positionY]
                }
                hasNuage.map.mapFX.writeChange(user, params)
                userFound.interface.addInfoMessage(`${user.pseudo} t'a invité sur son nuage.`)
            }
        } else if (type === 3) {
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if(!userFound) return
            const hasNuage =  serverManager.hasFX(5, `CLOUD_${user.id}_`)

            if (hasNuage && hasNuage.item) {
                let [userList, positionX, positionY]: [Array<User>, number, number] = hasNuage.item.memory
                userList = userList.filter((item: User) => item.id !== userId)

                const socketMessage: SocketMessage = new SocketMessage()
                socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
                socketMessage.bitWriteSignedInt(16, positionX)
                socketMessage.bitWriteSignedInt(16, positionY)
                for (let item of userList) {
                    socketMessage.bitWriteBoolean(true)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, item.id)
                }
                socketMessage.bitWriteBoolean(false)

                params = {
                    id: 5,
                    sid: hasNuage.item.sid,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    identifier: `CLOUD_${user.id}`,
                    duration: hasNuage.item.duration,
                    memory: [userList, positionX, positionY]
                }
                hasNuage.map.mapFX.writeChange(user, params)
                userFound.interface.addInfoMessage(`${user.pseudo} t'a retiré de son nuage.`)
            }
        }
    }
}

export default Cloud