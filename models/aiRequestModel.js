const pool = require("../database/connection");

async function saveRequests(chatId, chatType, request_type, result, errorMessage = null) {
    const client = await pool.connect();

    try {
        await client.query(`BEGIN`);

        await client.query(`
            INSERT INTO ai_requests (chat_id, chat_type, request_type, result, error_message)
            VALUES ($1, $2, $3, $4, $5)
            
            `,
        [chatId, chatType, request_type, result, errorMessage]
        );

        await client.query(`
        DELETE FROM ai_requests
        WHERE id NOT IN(
        SELECT id FROM ai_requests
        ORDER BY created_at
        DESC LIMIT 10
        )
            `);

            await client.query(`COMMIT`);
    } catch (error) {
       await client.query(`ROLLBACK`);
        throw new Error(`Error saving ai_requests: ${error.message}`)
    }finally{
       await client.release();
    }
}

async function getRequests() {
    try {
        const { rows } = await pool.query(`
            SELECT * FROM ai_requests
            `);

            return rows;
    } catch (error) {
        throw new Error(`Error getting ai_request list: ${error.message}`)
    }
}

module.exports = { 
    saveRequests,
    getRequests
}