import User from "../../../libs/blablaland/User"
import { MapEvent, Packet } from "../../../interfaces/blablaland"
import GlobalProperties from "../../../libs/blablaland/network/GlobalProperties"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"
import Winner, { Power, PowerWithKey } from "../../../libs/blablaland/Winner"

class SpookyClamp {

    /**
     *
     * @param user
     * @param event
     */
    async execute(user: User, event: MapEvent): Promise<void> {
        const channelId: number = event.packet.bitReadUnsignedInt(GlobalProperties.BIT_CHANNEL_ID)
        const isWinner: boolean = event.packet.bitReadBoolean()

        let packetSender: Packet = {
            type: 1,
            subType: 16
        }
        let socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_CHANNEL_ID, channelId)
        socketMessage.bitWriteUnsignedInt(3, event.type)

        const comparator: string = new Date().toISOString().slice(0, 10)
        let isFree: boolean = !user.spooky_at || new Date(user.spooky_at).toISOString().slice(0, 10) !== comparator

        if (event.type === 0) { // Bouton
            socketMessage.bitWriteUnsignedInt(7, isFree ? 0 : 5)
            socketMessage.bitWriteBoolean(isWinner)
        } else if (event.type === 1) {
            socketMessage.bitWriteBoolean(isWinner)
            if (isWinner) {
                const winner: Winner = new Winner()
                let initialPowers: { [key: number]: Power } = this.rewards()
                for (let initialPowersKey in initialPowers) {
                    let keyNumber: number = Number(initialPowersKey)
                    let power: Power = initialPowers[keyNumber]

                    if (power.isConditional) {
                        if ( !user.inventory.getObject(keyNumber)) {
                            winner.addPower({ [keyNumber]: power })
                        }
                    } else {
                        winner.addPower({ [keyNumber]: power })
                    }
                }

                let randomPower: PowerWithKey|null = winner.getRandomPower()
                if (randomPower) {
                    winner.handlePower(user, randomPower.power)
                    socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_FX_SID, randomPower.key)
                    socketMessage.bitWriteString(randomPower.power.chatMessage)
                }
            } else {
                user.interface.addInfoMessage(`Tu as perdu cette partie :(`)
            }
            if (isFree) {
                user.spooky_at  = Date.now()
                await global.db('players')
                    .where('user_id', user.id)
                    .update({ spooky_at: global.db.fn.now() })
            } else {
                user.updateBBL(5, true).then()
            }
        }

        user.socketManager.send(socketMessage)
    }

    private rewards(): { [key: number]: Power } {
        return {
            351: {chatMessage: 'doudou araignée', isConditional: true, action: (user: User) => user.inventory.reloadOrInsertObject(351, {isSubtraction: false})},
            352: {chatMessage: 'doudou chauve-souris', isConditional: true, action: (user: User) => user.inventory.reloadOrInsertObject(352, {isSubtraction: false})},
            353: {chatMessage: 'doudou citrouille', isConditional: true, action: (user: User) => user.inventory.reloadOrInsertObject(353, {isSubtraction: false})},
            354: {chatMessage: 'doudou poupée', isConditional: true, action: (user: User) => user.inventory.reloadOrInsertObject(354, {isSubtraction: false})},
            355: {chatMessage: 'doudou épouvantail', isConditional: true, action: (user: User) => user.inventory.reloadOrInsertObject(355, {isSubtraction: false})},

            20: {chatMessage: '3 bombes citrouille', action: (user: User) => user.inventory.reloadOrInsertObject(20, {isSubtraction: false}, 3)},
            269: {chatMessage: '3 graines de plante carnivore', action: (user: User) => user.inventory.reloadOrInsertObject(269, {isSubtraction: false}, 3)},
            116: {chatMessage: '3 potions fantôme', action: (user: User) => user.inventory.reloadOrInsertObject(116, {isSubtraction: false}, 3)},
            165: {chatMessage: '3 potions foudre', action: (user: User) => user.inventory.reloadOrInsertObject(165, {isSubtraction: false}, 3)},
            332: {chatMessage: '3 graines de cocotier', action: (user: User) => user.inventory.reloadOrInsertObject(332, {isSubtraction: false}, 3)},
            340: {chatMessage: '3 plume & goudron', action: (user: User) => user.inventory.reloadOrInsertObject(340, {isSubtraction: false}, 3)},
            356: {chatMessage: '3 bonbons Chauve-souris', action: (user: User) => user.inventory.reloadOrInsertObject(356, {isSubtraction: false}, 3)},
            357: {chatMessage: '3 bonbons dégueu', action: (user: User) => user.inventory.reloadOrInsertObject(357, {isSubtraction: false}, 3)},
            358: {chatMessage: '3 bonbons citrouille', action: (user: User) => user.inventory.reloadOrInsertObject(358, {isSubtraction: false}, 3)},
            359: {chatMessage: '3 bonbons explosion', action: (user: User) => user.inventory.reloadOrInsertObject(359, {isSubtraction: false}, 3)},
            360: {chatMessage: '3 bonbons tête de mort', action: (user: User) => user.inventory.reloadOrInsertObject(360, {isSubtraction: false}, 3)},
            1: {chatMessage: 'une partie gratuite', action: (user: User) => user.updateBBL(5, false).then()},
        }
    }
}

export default SpookyClamp