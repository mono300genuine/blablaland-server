import User from "../../../libs/blablaland/User"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import { FXEvent, Packet, ParamsFX, MiniMonster as Monster } from "../../../interfaces/blablaland"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import { ObjectDatabase } from "../../../interfaces/database"

class MiniMonster {

    /**
     *
     * @param user
     * @param event
     */
    async execute(user: User, event: FXEvent): Promise<void> {
        const bddId: number = event.packet.bitReadUnsignedInt(32)
        const type: number = event.packet.bitReadUnsignedInt(8)
        const channelId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)

        const object: ObjectDatabase|undefined = user.inventory.getObjectById(bddId)
        const FX: ParamsFX|undefined = user.hasFX(6, `BLIBLI_${object?.objectId}`)
        const miniMonster: Monster|undefined = user.getListMiniMonster().find(miniMonster => miniMonster.objectId === object?.objectId)
        if (!object || !miniMonster || !FX) {
            return
        }

        if (type === 1) { // init
            let socketMessage: SocketMessage = this.header(channelId, 1)
            for (let item of [363, 364, 365]) {
                const quantity: number = user.inventory.getObject(item)?.quantity ?? 0
                socketMessage.bitWriteBoolean(true)
                socketMessage.bitWriteUnsignedInt(16, quantity)
            }
            socketMessage.bitWriteBoolean(false)
            user.socketManager.send(socketMessage)
        } else if (type === 2) { // Food
            const clickId: number = event.packet.bitReadUnsignedInt(8)
            const item: ObjectDatabase | undefined = user.inventory.getObject(clickId + 363)
            const socketMessage: SocketMessage = this.header(channelId, 2)
            if (!item || item && item.quantity <= 0) {
                socketMessage.bitWriteUnsignedInt(8, 1)
            } else {
                item.quantity--
                user.inventory.updateObjectDatabase(item).then()

                if (clickId === 0) {
                    miniMonster.worm++
                } else if (clickId === 1) {
                    miniMonster.apple++
                } else {
                    miniMonster.ant++
                }

                const isGrowned: boolean = this.countFood(miniMonster) >= 100
                socketMessage.bitWriteUnsignedInt(8, 0)
                socketMessage.bitWriteBoolean(isGrowned)
                socketMessage.bitWriteUnsignedInt(8, clickId)
                socketMessage.bitWriteUnsignedInt(16, item.quantity)

                if (isGrowned) {
                    this.updateMonster(miniMonster)
                }
            }
            this.updateVisu(miniMonster, socketMessage)
            user.socketManager.send(socketMessage)
            this.save(miniMonster).then()
        } else if (type === 3) { // Rename
            const name: string = event.packet.bitReadString()
            const isValid: boolean = name.length > 2 && name.length < 13

            const socketMessage: SocketMessage = this.header(channelId, 3)
            socketMessage.bitWriteUnsignedInt(8, isValid ? 0 : 1)
            if (isValid) {
                const updateBBL: number = await user.updateBBL(50, true)
                if (updateBBL > 0) {
                miniMonster.name = name
                this.updateVisu(miniMonster, socketMessage)
                this.save(miniMonster).then()
                }
            }
            user.socketManager.send(socketMessage)
        } else if (type === 4) { // Delete
            const socketMessage: SocketMessage = this.header(channelId, 4)
            user.socketManager.send(socketMessage)
            this.remove(miniMonster).then(() => {
                user.userFX.dispose(FX)
                user.inventory.removeObject(object).then((r: void): void => {
                    user.removeListMonster(miniMonster)
                    user.updateBBL(333, false).then()
                })
            })
        }
    }

    /**
     * @param channelId
     * @param type
     * @private
     */
    private header(channelId: number, type: number): SocketMessage {
        let packetSender: Packet = {
            type: 1,
            subType: 16
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, channelId)
        socketMessage.bitWriteUnsignedInt(8, type)
        return socketMessage
    }

    private updateVisu(miniMonster: Monster, socketMessage: SocketMessage): SocketMessage {
        let sm: SocketMessage = new SocketMessage
        sm.bitWriteUnsignedInt(8, 1)
        sm.bitWriteUnsignedInt(8, 1)
        sm.bitWriteUnsignedInt(8, miniMonster?.typeX?? 0)
        sm.bitWriteUnsignedInt(8, 2)
        sm.bitWriteUnsignedInt(8, 1)
        sm.bitWriteUnsignedInt(8, miniMonster?.typeY?? 0)
        sm.bitWriteUnsignedInt(8, 4)
        sm.bitWriteUnsignedInt(8, 2)
        sm.bitWriteUnsignedInt(8, 0)
        sm.bitWriteUnsignedInt(8, this.countFood(miniMonster))
        if (miniMonster?.name) {
            sm.bitWriteUnsignedInt(8, 5)
            sm.bitWriteUnsignedInt(8, 0)
            sm.bitWriteString(miniMonster.name)
        }
        sm.bitWriteUnsignedInt(8, 0)
        sm.bitWriteUnsignedInt(8, 0)
        socketMessage.bitWriteBinaryData(sm)

        return socketMessage
    }
    private updateMonster(miniMonster: Monster): void {
        const maxFoodValue: number = Math.max(miniMonster.worm, miniMonster.apple, miniMonster.ant)
        if (maxFoodValue === miniMonster.worm) {
            miniMonster.typeX += 0
            miniMonster.typeY += 1
        } else if (maxFoodValue === miniMonster.apple) {
            miniMonster.typeX += 1
            miniMonster.typeY += 1
        } if (maxFoodValue === miniMonster.ant) {
            miniMonster.typeX += 2
            miniMonster.typeY += 1
        }

        miniMonster.worm = 0
        miniMonster.apple = 0
        miniMonster.ant = 0

        this.save(miniMonster).then()
    }


    async save(miniMonster: Monster): Promise<void> {
        await global.db('mini_monsters')
            .where('id', miniMonster.id)
            .update({
                typeX: miniMonster.typeX,
                typeY: miniMonster.typeY,
                worm: miniMonster.worm,
                apple: miniMonster.apple,
                ant: miniMonster.ant,
                name: miniMonster.name
            }).then()
    }

    async remove(miniMonster: Monster): Promise <void> {
        await global.db('mini_monsters')
            .where('id', miniMonster.id)
            .delete()
    }

    private countFood(miniMonster: Monster): number {
        return miniMonster.worm + miniMonster.apple + miniMonster.ant
    }
}

export default MiniMonster