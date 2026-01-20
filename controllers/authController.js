const Memory = require("../models/users");

// Get User Messages

async function getUser(id, name){
    let user = await Memory.findOne({userId: id});

    if(!user){
      user = await Memory.create({
        userId: id,
        username: name
    })
  }
    return user
}

module.exports = getUser