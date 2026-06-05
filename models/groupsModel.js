const pool = require("../database/connection");

async function saveGroup(id, name, type, ownerId){

    try{
        await pool.query(`
            INSERT INTO groups(id, name, type, owner_id)
            VALUES($1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE 
            SET name = $2, type = $3, owner_id = $4
            `,
        [id, name, type, ownerId]
        );
    }catch(e){
        throw new Error (`Error saving new group: ${e.message}`)
    }
}

async function updateGroupInteraction(id){
    
    try{
        await pool.query(`
            UPDATE groups 
            SET last_interacted = NOW()
            WHERE id = $1
            `,
            [id]
        )
    }catch(e){  
        throw new Error (`Error updating group interaction time: ${e.message}`)
    }
}

async function deleteGroup(id) {
    try{
        await pool.query(`
           DELETE FROM groups
           WHERE id = $1
            `,
            [id]
        )
    }catch(e){
        throw new Error (`Error deleting groups: ${e.message}`)
        }
}


async function getGroups() {
    try{
    const { rows } = await pool.query(`
           SELECT * FROM groups
            `
        )

     return rows
    }catch(e){
        throw new Error (`Error getting group count: ${e.message}`)
    }
}
async function countGroups() {
    try{
    const { rows } = await pool.query(`
           SELECT COUNT(*) FROM groups
            `
        )

     return   parseInt(rows[0].count)
    }catch(e){
        throw new Error (`Error getting group count: ${e.message}`)
    }
}


module.exports = {
    saveGroup,
    updateGroupInteraction,
    deleteGroup,
    getGroups,
    countGroups
}