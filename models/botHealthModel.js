const pool = require("../database/connection");

async function saveHealth(time) {
    const client = await pool.connect();
    try {
        await client.query(`BEGIN`);

        await client.query(`
            INSERT INTO bot_health (response_time_ms)
            VALUES($1)
            `,
        [time]
        );

        await client.query(`
        DELETE FROM bot_health
        WHERE (id) NOT IN(
        SELECT id FROM bot_health
        WHERE checked_at > NOW() - INTERVAL '1 hour'
        )    
            `)
await client.query(`COMMIT`);

    } catch (e) {
 await client.query(`ROLLBACK`);
        throw new Error(`Error Saving bot Health check: ${e.message}`)
    }finally{
        await client.release();
    }
}

async function getHealth() {
    try {
        const { rows } = await pool.query(`
        SELECT * FROM bot_health
            `)
            return rows;
    } catch (e) {
        throw new Error(`Error getting bot Health check: ${e.message}`)
    }
}


module.exports = {
    saveHealth,
    getHealth
}