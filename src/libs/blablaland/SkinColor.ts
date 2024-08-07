import SocketMessage from "./network/SocketMessage"

class SkinColor {

    static nbSlot = 10
    
    /**
     * @param  {SocketMessage} socketMessage
     * @param  {Array<number>} skinColor
     */
    static exportBinaryColor(socketMessage: SocketMessage, skinColor: Array<number>): void {
        for (let i = 0; i < SkinColor.nbSlot; i++) {
            socketMessage.bitWriteUnsignedInt(8, skinColor[i])
        }
      }
      
    /**
     * @param  {SocketMessage} socketMessage
     * @returns Array
     */
    static readBinaryColor(socketMessage: SocketMessage): Array<number> {
        const colors: Array<number> = new Array<number>()
        for (let i = 0; i < SkinColor.nbSlot; i++) {
            colors.push(socketMessage.bitReadUnsignedInt(8))
        }
        return colors;
    }
}

export default SkinColor