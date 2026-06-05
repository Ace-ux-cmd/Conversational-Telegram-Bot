const pool = require("../database/connection");

async function upsertUserScore(userId, username, amount) {
    try {
        await pool.query(`
            INSERT INTO leaderboard (user_id, username, score)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                score = leaderboard.score + EXCLUDED.score,
                username = EXCLUDED.username;
        `, [userId, username, amount]);
    } catch (e) {
        throw new Error(`Error upserting leaderboard: ${e.message}`);
    }
}

async function getScore(userId) {
    try {
    const { rows } =   await pool.query(`
    SELECT * FROM leaderboard
    WHERE user_id = $1
            `,
        [userId]
    );

    return parseInt(rows[0].score);
    } catch (e) {
        throw new Error(`Error getting leaderboard score: ${e.message}`)
    }
}
async function getLeaderboard() {
    try {
     const { rows } =  await pool.query(`
    SELECT * FROM leaderboard
    ORDER BY score DESC
            `
    );

    return rows;
    } catch (e) {
        throw new Error(`Error getting leaderboard: ${e.message}`)
    }
}

module.exports = {
    upsertUserScore,
    getScore,
    getLeaderboard
}