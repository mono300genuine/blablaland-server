import User from "./User"
import { ObjectDatabase } from "../../interfaces/database"
import { Knex }  from "knex"

export interface Power {
    chatMessage: string,
    popupMessage?: string,
    isConditional? : boolean,
    action?: (user: User) => void
}

export interface PowerWithKey {
    key: number;
    power: Power;
}

class Winner {

    private powers: { [key: number]: Power } = {};

    constructor(initialPowers?: { [key: number]: Power }) {
        if (initialPowers) {
            this.addPower(initialPowers)
        }
    }

    /**
     * @param power
     */
    addPower(power: { [key: number]: Power }): void {
        Object.assign(this.powers, power);
    }

    /**
     * @param user
     * @param power
     */
    handlePower(user: User, power: Power): void {
        if (power) {
            if (power.action) {
                power.action(user)
            }
        }
    }

    /**
     * getRandomPower
     */
    getRandomPower(): PowerWithKey | null {
        const powerKeys: number[] = Object.keys(this.powers).map(Number)
        const randomKey: number = powerKeys[Math.floor(Math.random() * powerKeys.length)]
        const randomPower: Power = this.powers[randomKey]

        if (randomPower) {
            return { key: randomKey, power: randomPower }
        } else {
            return null
        }
    }

    /**
     * getListPower
     */
    getListPower(): {[p: number]: Power} {
        return this.powers
    }

    /**
     * Determines if a random event is a winner based on the specified probability.
     * @param probabilityDenominator - The denominator for calculating the probability (e.g., 1 out of X).
     * @param desiredOutcome - The desired outcome for winning (e.g., 1 for a 1 in X chance).
     * @returns True if the random event is a winner, false otherwise.
     */
    isWinner(probabilityDenominator: number, desiredOutcome: number): boolean {
        return Math.floor(Math.random() * probabilityDenominator) < desiredOutcome
    }

    async determineWinnerSkin(trx: Knex.Transaction, user: User, skinId: number): Promise<boolean> {
        const result = await trx('player_skin').where({
            skin_id: skinId,
            player_id: user.id
        }).select('id').first()
        return !!result;
    }

    async insertSkin(trx: Knex.Transaction, user: User, skinId: number): Promise<void> {
        const skin = await trx('*').from('skins').where('id', skinId).first()
        if (skin) {
            await global.db.insert({
                skin_id: skinId,
                player_id: user.id,
                color: skin.color,
                created_at: global.db.fn.now(),
                updated_at: global.db.fn.now()
            }).into('player_skin')
        }
    }

    determineWinnerObject(user: User, objectId: number): boolean {
        const hasObject: ObjectDatabase|undefined = user.inventory.getObject(objectId)
        return !!hasObject
    }
}

export default Winner