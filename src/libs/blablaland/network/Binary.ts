
const powList: number[] = new Array<number>()

for (let i = 0; i < 33; i++) {
    powList.push(2 ** i)
}

class Binary extends Array {

    public bitLength: number
    public bitPosition: number

    constructor() {
        super()
        this.bitLength = 0
        this.bitPosition = 0
    }
    
    /**
     * @returns Binary
     */
    bitReadBinaryData(): Binary {
        let _loc1_: number = this.bitReadUnsignedInt(16)
        return this.bitReadBinary(_loc1_)
    }
    
    /**
     * @param  {number} param1
     * @returns Binary
     */
    bitReadBinary(param1: number): Binary {
        let _loc5_: number = 0
        const _loc2_: Binary = new Binary()
        const _loc3_: number = this.bitPosition
        while (this.bitPosition - _loc3_ < param1) {
            if (this.bitPosition == this.bitLength) {
                return _loc2_
            }
            _loc5_ = Math.min(8, param1 - this.bitPosition + _loc3_)
            _loc2_.bitWriteUnsignedInt(_loc5_, this.bitReadUnsignedInt(_loc5_))
        }
        return _loc2_
    }
    
    /**
     * @param  {number} param1
     */
    bitReadSignedInt(param1: number): number {
        const _loc2_: boolean = this.bitReadBoolean()
        return this.bitReadUnsignedInt(param1 - 1) * (!!_loc2_ ? 1 : -1)
    }

    /**
     * @returns boolean
     */
    bitReadBoolean(): boolean {
        if (this.bitPosition == this.bitLength) {
            return false
        }
        const _loc1_: number = Math.floor(this.bitPosition / 8)
        const _loc2_: number = this.bitPosition % 8
        this.bitPosition++
        return (this[_loc1_] >> 7 - _loc2_ & 1) == 1
    }
    
    /**
     * @returns string
     */
    bitReadString(): string {
        let _loc4_: number = 0;
        let _loc1_: string = ""
        const _loc2_: number = this.bitReadUnsignedInt(16)
        let _loc3_: number = 0
        while (_loc3_ < _loc2_) {
            _loc4_ = this.bitReadUnsignedInt(8)
            if (_loc4_ == 255) {
                _loc4_ = 8364
            }
            _loc1_ = _loc1_ + String.fromCharCode(_loc4_)
            _loc3_++
        }
        return _loc1_
    }

    /**
     * @param  {number} nBits
     * @returns number
     */
    bitReadUnsignedInt(nBits: number): number {
        if (this.bitPosition + nBits > this.bitLength) {
            this.bitPosition = this.bitLength
            return 0
        }
        let value: number = 0
        while (nBits > 0) {
            const loc4: number = Math.floor(this.bitPosition / 8)
            const loc5: number = this.bitPosition % 8
            const loc6: number = 8 - loc5
            const loc7: number = Math.min(loc6, nBits)
            const loc8: number = this[loc4] >> loc6 - loc7 & powList[loc7] - 1
            value += loc8 * powList[nBits - loc7]
            nBits -= loc7
            this.bitPosition += loc7
        }
        return value
    }
    
    /**
     * @param  {Binary} param1
     * @returns void
     */
    bitWriteBinaryData(param1: Binary): void {
        const _loc2_: number = Math.min(param1.bitLength, powList[16] - 1)
        this.bitWriteUnsignedInt(16, _loc2_)
        this.bitWriteBinary(param1)
    }
    
    /**
     * @param  {boolean} param1
     * @returns void
     */
    bitWriteBoolean(param1: boolean): void {
        const loc2: number = this.bitLength % 8
        if (loc2 == 0) {
            this.push(0)
        }
        if (param1) {
            this[this.length - 1] = this[this.length - 1] + powList[7 - loc2]
        }
        this.bitLength++
    }
    
    /**
     * @param  {Binary} param1
     * @returns void
     */
    bitWriteBinary(param1: Binary): void {
        let _loc3_: number = 0
        let _loc4_: number = 0
        param1.bitPosition = 0
        let _loc2_: number = param1.bitLength
        while (_loc2_) {
            _loc3_ = Math.min(8, _loc2_)
            _loc4_ = param1.bitReadUnsignedInt(_loc3_)
            this.bitWriteUnsignedInt(_loc3_, _loc4_)
            _loc2_ = _loc2_ - _loc3_
        }
    }
    
    /**
     * @param  {string} param1
     * @returns void
     */
    bitWriteString(param1: string): void {
        let loc4: number = 0
        const loc2: number = Math.min(param1.length, powList[16] - 1)

        this.bitWriteUnsignedInt(16, loc2)

        let loc3: number = 0

        while (loc3 < loc2) {
            loc4 = param1.charCodeAt(loc3)
            if (loc4 == 8364) {
                loc4 = 255
            }
            this.bitWriteUnsignedInt(8, loc4)
            loc3++
        }
    }
    
    /**
     * @param  {number} param1
     * @param  {number} param2
     * @returns void
     */
    bitWriteSignedInt(param1: number, param2: number): void {
        this.bitWriteBoolean(param2 >= 0)
        this.bitWriteUnsignedInt(param1 - 1, Math.abs(param2))
    }

    /**
     * @param  {number} nBits
     * @param  {number} val
     * @returns void
     */
    bitWriteUnsignedInt(nBits: number, val: number): void {
        val = Math.min(powList[nBits] - 1, val)
        while (nBits > 0) {
            const loc4: number = this.bitLength % 8
            if (loc4 == 0) {
                this.push(0)
            }
            const loc5: number = 8 - loc4
            const loc6: number = Math.min(loc5, nBits)
            const loc7: number = this.Rshift(val, nBits - loc6)
            this[this.length - 1] = this[this.length - 1] + loc7 * powList[loc5 - loc6]
            val -= loc7 * powList[nBits - loc6]
            nBits -= loc6
            this.bitLength = this.bitLength + loc6
        }
    }
    
    /**
     * @param  {number} param1
     * @param  {number} param2
     * @returns number
     */
    Rshift(param1: number, param2: number): number {
        return Math.floor(param1 / powList[param2])
    }

    /**
     * @param  {number} param1
     * @param  {number} param2
     * @returns number
     */
    Lshift(param1: number, param2: number): number {
        return param1 * powList[param2]
    }
}

export default Binary