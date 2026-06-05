const pool = require("../database/connection");

async function addMember(groupId, userId, role = 'member', name,  joined_at = null) {
    try {
        await pool.query(`
            INSERT INTO group_members(group_id, user_id, role, name, joined_at)
            VALUES($1, $2, $3, $4, $5)
            ON CONFLICT (group_id, user_id) 
            DO UPDATE SET role = $3, name = $4
            `,
            [groupId, userId, role, name, joined_at]
        );
    } catch(e) {
        throw new Error(`Error adding group member to db: ${e.message}`);
    }
}

async function removeMembers(groupId, userId){
    try{
        await pool.query(`
            DELETE FROM group_members
            WHERE group_id = $1
            AND user_id = $2
            `,
        [groupId, userId]
        )
    }catch(e){
 throw new Error(`Error occured while removing a group member: ${e.message}`)
    }
}



module.exports={
    addMember,
    removeMembers,
}