import User from "../../../libs/blablaland/User"

class ChristmasGrandpa {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        user.transform.bigGift()
    }
}

export default ChristmasGrandpa