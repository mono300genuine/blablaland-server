import User from "../User"
import { BadWordDefinition, Packet } from "../../../interfaces/blablaland"
import SocketMessage from "../network/SocketMessage"
import GlobalProperties from "../network/GlobalProperties"

class BadWord {

    private user: User
    private badWord: BadWordDefinition
    private text: string
    private readonly pseudoReceiver: string|undefined
    private readonly isFriend: boolean

    constructor(user: User, badWord: BadWordDefinition, text: string, pseudoReceiver?: string, isFriend: boolean = false) {
        this.user = user
        this.badWord = badWord
        this.text = text
        this.pseudoReceiver = pseudoReceiver
        this.isFriend = isFriend
    }

    /**
     *
     */
    replace(): string {
        let text: string = this.text
        if (this.badWord.censorshipAll) {
            text = this.badWord.replace
        } else if (this.badWord.censorship) {
            text = text.replace(this.badWord.query, this.badWord.replace)
        }
        return text
    }

    alert(isHouse: boolean, percentageFriends: number): SocketMessage {
        const packetSender: Packet = {
            type: 6,
            subType: 9
        }
        const socketMessage: SocketMessage = new SocketMessage(packetSender)
        socketMessage.bitWriteUnsignedInt(32, this.user.IP) // IPAddr
        socketMessage.bitWriteUnsignedInt(GlobalProperties.BIT_USER_ID, this.user.id)
        socketMessage.bitWriteString(this.user.pseudo)
        if (this.pseudoReceiver) {
            this.text = `mp A ${this.pseudoReceiver} : ${this.text}`
        }
        const text: string = `${this.text} [${this.pseudoReceiver ? this.isFriend ? 'MP AMI' : 'MP' : (isHouse ? 'MAISON' : (percentageFriends >= 50 ? `MAP AMIS ${percentageFriends}%` : 'MAP'))}] (Suspect: ${this.badWord.query})`
        socketMessage.bitWriteUnsignedInt(7, this.badWord.point) // pts
        socketMessage.bitWriteString(text)
        return socketMessage
    }
}

export default BadWord