const pool = require("../database/connection");

async function saveUsage(userId, requestType) {
    try {
        await pool.query(`
    INSERT INTO daily_usage (user_id, request_type)
    VALUES ($1, $2)
    ON CONFLICT (user_id, usage_date, request_type)
    DO UPDATE
    SET usage_count = daily_usage.usage_count + 1;
            `,
        [userId, requestType]
        );
    } catch (e) {
        throw new Error(`Error saving usage: ${e.message}`);
    }
}
async function getCount(userId, requestType) {
    try {
        const { rows } = await pool.query(`
        SELECT usage_count FROM daily_usage
        WHERE user_id = $1 AND request_type = $2 
        AND usage_date = CURRENT_DATE
            `,
        [userId, requestType]
        );

        if(!rows[0]) return;
        return parseInt(rows[0].usage_count);
    } catch (e) {
        throw new Error(`Error getting usage count: ${e.message}`);
    }
}

async function getUsage() {
    try {
        const { rows } = await pool.query(`
        SELECT * FROM daily_usage    
            `)
            
            return rows;
    } catch (e) {
        throw new Error(`Error getting usage: ${e.message}`);
    }
}
async function resetDaily() {
    try {
        await pool.query(`
            DELETE FROM daily_usage
            `)
} catch (e) {
      throw new Error(`Error reseting usage: ${e.message}`);  
    }
}

module.exports = {
    saveUsage,
    getCount,
    getUsage,
    resetDaily
}