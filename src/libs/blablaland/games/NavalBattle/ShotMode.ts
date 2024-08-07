class ShotMode {
    static NORMAL: ShotMode = new ShotMode(0, [[0, 0]], 0)
    static STARS: ShotMode = new ShotMode(1, [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1]], 0)
    static SUPER_STARS: ShotMode = new ShotMode(2, [[0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1], [-2, -2], [2, -2], [-2, 2], [2, 2]], 2)
    static DOUBLE_HORIZONTAL: ShotMode = new ShotMode(3, [[-1, 0], [1, 0]], 0)
    static DOUBLE_VERTICAL: ShotMode = new ShotMode(4, [[0, -1], [0, 1]], 0)
    static PLUS: ShotMode = new ShotMode(5, [[0, -1], [-1, 0], [0, 1], [1, 0], [0, 0]], 1)
    static CRATER: ShotMode = new ShotMode(6, [[0, -3], [-1, -3], [-2, -2], [-3, -1], [-3, 0], [-3, 1], [-2, 2], [-1, 3], [0, 3], [1, 3], [2, 2], [3, 1], [3, 0], [3, -1], [2, -2], [1, -3]], 2)
    static APOCALYPSE: ShotMode = new ShotMode(7, [[0, 0], [-1, -2], [0, -2], [1, -2], [-2, -1], [-1, -1], [0, -1], [1, -1], [2, -1], [-2, 0], [2, 0], [-2, 1], [-1, 1], [0, 1], [1, 1], [2, 1], [-1, 2], [0, 2], [1, 2], [-1, 3], [0, 3], [1, 3], [-3, -2], [-4, -3], [-3, 2], [-4, 3], [3, -2], [4, -3], [3, 2], [4, 3]], 3)
    static DONUTS: ShotMode = new ShotMode(8, [[-1, -1], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 1], [1, 0], [-1, 0]], 5)
    static COLUMN_OF_FIRE: ShotMode = new ShotMode(9, [[0, -5], [0, -4], [0, -3], [0, -2], [0, -1], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6]], 4)
    static TRAIT_OF_DEATH: ShotMode = new ShotMode(10, [[-7, 0], [-6, 0], [-5, 0], [-4, 0], [-3, 0], [-2, 0], [-1, 0], [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0]], 4)

    constructor(public id: number, public targets: number[][], public luckyDrawChance: number = 0) {}
}

export default ShotMode