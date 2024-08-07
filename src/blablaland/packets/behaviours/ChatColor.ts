import User from "../../../libs/blablaland/User"
import SocketMessage from "../../../libs/blablaland/network/SocketMessage"

class ChatColor {

    /**
     * Chat Color
     /**
     * @param  {User} user
     * @param  {SocketMessage} packet
     * @returns void
     */
    async execute(user: User, packet: SocketMessage): Promise<void> {
        const unknown: number = packet.bitReadUnsignedInt(5)
        const color: string = packet.bitReadString()
        user.chatColor = color

        await global.db('players')
            .where('user_id', user.id)
            .update({
                chat_color: color
            })
    }
}

export default ChatColor