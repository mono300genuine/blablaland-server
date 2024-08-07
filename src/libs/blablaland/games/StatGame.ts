export enum Game {
    TOURNAMENT_FURY = "TOURNAMENT_FURY",
    PYRAMID = "PYRAMID",
    NAVAL_BATTLE = "NAVAL_BATTLE",
    MYSTHORIA = "MYSTHORIA",
    PIRATE_QUEST = "PIRATE_QUEST",
    HAUNTED_MANOR = "HAUNTED_MANOR",
    DUNGEON = "DUNGEON",
}

class StatGame {

    static async upsertPlayerStats(game: string, playerId: number, scoreIncrement: number, winIncrement: number, lostIncrement: number, tokenIncrement: number, maxLevel: number = 0): Promise<boolean> {
        return await global.db.transaction(async (trx): Promise<boolean> => {
            const existingRecord = await trx('stat_games').where({ player_id: playerId, game: game }).first();

            const recordExists: boolean = existingRecord !== undefined && existingRecord !== null

            if (recordExists) {
                const updatedScore: number = Math.max(existingRecord.score + scoreIncrement, 0);
                const updatedWon: number = existingRecord.won + winIncrement;
                const updatedLost: number = existingRecord.lost + lostIncrement;
                const updatedRemainingToken: number = existingRecord.remaining_token + tokenIncrement;
                const updatedTotalToken: number = existingRecord.total_token + tokenIncrement;
                const updatedMaxLevel: number = existingRecord.max_level < maxLevel ? maxLevel : existingRecord.max_level;

                await trx('stat_games')
                    .where({ player_id: playerId, game: game })
                    .update({
                        score: updatedScore,
                        won: updatedWon,
                        lost: updatedLost,
                        max_level: updatedMaxLevel,
                        remaining_token: updatedRemainingToken,
                        total_token: updatedTotalToken,
                        updated_at: global.db.fn.now()
                    })
                return true
            } else {
                await trx('stat_games').insert({
                    player_id: playerId,
                    score: Math.max(scoreIncrement, 0),
                    won: winIncrement,
                    lost: lostIncrement,
                    max_level: maxLevel,
                    remaining_token: tokenIncrement,
                    total_token: tokenIncrement,
                    game: game,
                    created_at: global.db.fn.now(),
                    updated_at: global.db.fn.now()
                });
                return false
            }
        })
    }

    static async getPlayerStats(game: string, playerId: number): Promise<any> {
       return global.db('stat_games').where({ player_id: playerId, game: game }).first()
    }
}

export default StatGame