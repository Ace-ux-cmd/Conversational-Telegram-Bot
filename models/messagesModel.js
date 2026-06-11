const pool = require("../database/connection");

async function saveMessage( messageId, userId, role, content, replyToMessageId = null){
        const client = await pool.connect();
        
    try {
        
        await client.query(`BEGIN`)
            
        await client.query(`
            INSERT INTO messages(message_id, user_id, role, content, reply_to_message_id)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [messageId, userId, role, content, replyToMessageId]
        )

        await client.query(`
    DELETE FROM messages
    WHERE user_id = $1
    AND message_id NOT IN (
        SELECT message_id FROM messages
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 20
)
            `,
        [userId]
        )
        
        await client.query("COMMIT");

    } catch (error) {

        await client.query("ROLLBACK");
     throw new Error(`Error saving message: ${error.message}`)  ;

    }finally{
        await client.release();
    }
}

async function getHistory(userId) {
    try {
        const { rows } = await pool.query(`
            SELECT * FROM (
    SELECT * FROM messages
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 20
) sub
ORDER BY created_at ASC
            `,
        [userId]
        )

        return rows;
    } catch (error) {
     throw new Error(`Error getting message history ${error.message}`)   
    }
}

module.exports = {
    saveMessage,
    getHistory
}
