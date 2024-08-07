import User from "../../User"

class DungeonUser {

    private readonly user: User
    private intervalDie: NodeJS.Timeout|undefined
    private life: number
    private maxLife: number
    private maxSpecial: number
    private strength: number
    private agility: number
    private isReady: boolean
    private isDead: boolean
    private token: number
    private level: number
    private readonly isOwner: boolean

    constructor(user: User, isOwner: boolean = false) {
        this.user = user
        this.intervalDie = undefined
        this.life = 3
        this.maxLife = 3
        this.maxSpecial = 0
        this.strength = 1
        this.agility = 1
        this.isReady = false
        this.isDead = false
        this.token = 0
        this.level = 0
        this.isOwner = isOwner
    }

    setIntervalDie(value: NodeJS.Timeout): void {
        this.intervalDie = value
    }

    /**
     * @param life
     */
    setLife(life: number): void {
        this.life = life
    }

    /**
     * @param maxLife
     */
    setMaxLife(maxLife: number): void {
        this.maxLife = maxLife
    }

    /**
     * @param maxSpecial
     */
    setMaxSpecial(maxSpecial: number): void {
        this.maxSpecial = maxSpecial
    }

    /**
     * @param strength
     */
    setStrength(strength: number): void {
        this.strength = strength
    }

    /**
     * @param agility
     */
    setAgility(agility: number): void {
        this.agility = agility
    }

    /**
     * @param value
     */
    setIsReady(value: boolean): void {
        this.isReady = value
    }

    /**
     * @param value
     */
    setIsDead(value: boolean): void {
        this.isDead = value
    }

    setToken(value: number): void {
        this.token = value
    }

    setLevel(value: number): void {
        this.level = value
    }

    getIntervalDie(): any {
        return this.intervalDie
    }

    getUser(): User {
        return this.user
    }

    getLife(): number {
        return this.life
    }

    getMaxLife(): number {
        return this.maxLife
    }

    getMaxSpecial(): number {
        return this.maxSpecial
    }

    getStrength(): number {
        return this.strength
    }

    getAgility(): number {
        return this.agility
    }

    getIsReady(): boolean {
        return this.isReady
    }

    getIsDead(): boolean {
        return this.isDead
    }

    getToken(): number {
        return this.token
    }

    getLevel(): number {
        return this.level
    }

    getOwner(): boolean {
        return this.isOwner
    }
}

export default DungeonUser