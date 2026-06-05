const pool = require("../database/connection");

// Upsert on first interraction
async function createOrGet(id, username, firstName){
    try {
   const { rows } = await pool.query(`
        INSERT INTO users(id, username, first_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET first_name = $3
        RETURNING *
        `,
    [id, username, firstName]
    );
    
    return rows[0];
} catch (error) {
   throw new Error (`Error upserting in user model: ${error.message}`
)}
  
}

// Fetch user
async function getById(id){
  try {
   const { rows } =  await pool.query(`
        SELECT * from users
        WHERE id = $1
        `,
    [id]
    );

    return rows[0];
} catch (error) {
    throw new Error (`Error fetching user by id: ${error.message}`
 ) 
}
}

// Fetch user
async function getUsers(){
  try {
   const { rows } =  await pool.query(`
        SELECT * from users
        `
    );

    return rows;
} catch (error) {
    throw new Error (`Error fetching users: ${error.message}`
 ) 
}
}

// Update status to banned
async function ban(id){
    try {
       const { rows } =  await pool.query(`
            UPDATE users
            SET status = 'banned'
            WHERE id = $1
            `,
        [id]
        );

        return rows[0];
    } catch (error) {
        throw new Error (`Error occured while banning user ${error.message}`
    )}
}
async function unBan(id){
    try {
       const { rows } =  await pool.query(`
            UPDATE users
            SET status = 'active'
            WHERE id = $1
            `,
        [id]
        );

        return rows[0];
    } catch (error) {
        throw new Error (`Error occured while banning user ${error.message}`
    )}
}

// delete inactive users
async function deleteInactive(){
    try {
       const { rows } =  await pool.query(`
           DELETE FROM users 
           WHERE id NOT IN(
           SELECT DISTINCT user_id FROM messages
           WHERE last_interacted > NOW() - INTERVAL '90 days'
           )
            `
        );

        return rows[0];
    } catch (error) {
        throw new Error (`Error occured while deleting inactive users ${error.message}`
    )}
}

// Change user role
async function updateRole(id, role){
    try {
       const { rows } =  await pool.query(`
          UPDATE users
          SET role = $2
          WHERE id = $1
            `,
            [id, role]
        );

        return rows[0];
    } catch (error) {
        throw new Error (`Error occured while user's role ${error.message}`
    )}
}

// count current users
async function countUsers(){
    try {
       const { rows } =  await pool.query(`
           SELECT COUNT(*)
           FROM users
            `
        );

     return parseInt( rows[0].count);
    } catch (error) {
        throw new Error (`Error occured while counting users ${error.message}`
    )}
}

async function updateUserInteraction(id){
    
    try{
        await pool.query(`
            UPDATE users 
            SET last_interacted = NOW()
            WHERE id = $1
            `,
            [id]
        )
    }catch(e){  
        throw new Error (`Error updating group interaction time: ${e.message}`)
    }
}

module.exports = {
    createOrGet,
    updateRole,
    countUsers,
    ban,
    unBan,
    getById,
    getUsers,
    deleteInactive,
    updateUserInteraction
}