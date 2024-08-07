import User from "../../libs/blablaland/User"
import { ObjectDefinition, ParamsFX } from "../../interfaces/blablaland"
import GlobalProperties from "../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../libs/blablaland/network/SocketMessage"
import UniverseManager from "../../libs/manager/UniverseManager"
import ServerManager from "../../libs/manager/ServerManager"

class Scene {

    /**
     * Scene user
     * @param user
     * @param item
     * @param universeManager
     * @param serverManager
     */
    execute(user: User, item: ObjectDefinition, universeManager: UniverseManager, serverManager: ServerManager): void {
        const type: number = item.packet.bitReadUnsignedInt(3)
        const userId: number = item.packet.bitReadUnsignedInt(GlobalProperties.BIT_USER_ID)
        const FX: ParamsFX|undefined = user.hasFX(6, `SCENE`)
        const map = universeManager.getMapById(user.mapId)
        let params: ParamsFX = {}

        if (type === 0) {
            const positionX: number = item.packet.bitReadSignedInt(16)
            const positionY: number = item.packet.bitReadSignedInt(16)

            if(FX) {
                user.userFX.dispose(FX)
                const hasScene = serverManager.hasFX(5, `SCENE_${user.id}_`)
                if (hasScene && hasScene.item) {
                    hasScene.map.mapFX.dispose(user, hasScene.item)
                }
            }

            let socketMessage: SocketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, user.id)
            socketMessage.bitWriteSignedInt(16, positionX)
            socketMessage.bitWriteSignedInt(16, positionY)

            const mapFX: ParamsFX = map.mapFX.writeChange(user, {
                id: 5,
                identifier: `SCENE_${user.id}`,
                data: [item.type.fxFileId, item.type.id, socketMessage],
                memory: [new Array<User>(), positionX, positionY],
                duration: 1200
            })

            socketMessage = new SocketMessage
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_MAP_ID, user.mapId)
            socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, mapFX.sid!)

            user.userFX.writeChange({
                id: 6,
                identifier: `SCENE`,
                data: [item.type.fxFileId, 1, socketMessage],
                duration: 1200,
                isProtected: true,
                isMap: false
            })
        } else if (type === 1) {
            if (FX) {
                user.userFX.dispose(FX)
            }
            const hasScene = serverManager.hasFX(5, `SCENE_${user.id}_`)
            if (hasScene && hasScene.item) {
                hasScene.map.mapFX.dispose(user, hasScene.item)
            }
        } else if (type === 2) {
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if(!userFound) return
            const hasScene =  serverManager.hasFX(5, `SCENE_${user.id}_`)

            if (hasScene && hasScene.item) {
                const [userList, positionX, positionY]: [Array<User>, number, number] = hasScene.item.memory
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
                    sid: hasScene.item.sid,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    identifier: `SCENE_${user.id}`,
                    duration: hasScene.item.duration,
                    memory: [userList, positionX, positionY]
                }
                hasScene.map.mapFX.writeChange(user, params)
                userFound.interface.addInfoMessage(`${user.pseudo} t'a invité sur sa scène.`)
            }
        } else if (type === 3) {
            const userFound: User|undefined = serverManager.getUserById(userId, {
                inConsole: false
            })
            if(!userFound) return
            const hasScene =  serverManager.hasFX(5, `SCENE_${user.id}_`)

            if (hasScene && hasScene.item) {
                let [userList, positionX, positionY]: [Array<User>, number, number] = hasScene.item.memory
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
                    sid: hasScene.item.sid,
                    data: [item.type.fxFileId, item.type.id, socketMessage],
                    identifier: `SCENE_${user.id}`,
                    duration: hasScene.item.duration,
                    memory: [userList, positionX, positionY]
                }
                hasScene.map.mapFX.writeChange(user, params)
                userFound.interface.addInfoMessage(`${user.pseudo} t'a retiré de sa scène.`)
            }
        }
    }
}

export default Scene