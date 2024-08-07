import User from "../../../libs/blablaland/User"

class Astronaut {

    /**
     *
     * @param user
     */
    execute(user: User): void {
        user.getCamera()?.gotoMap(355, { method: 1 })
    }
}

export default Astronaut