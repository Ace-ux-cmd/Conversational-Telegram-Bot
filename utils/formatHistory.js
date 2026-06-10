// FUNCTION TO FORMAT DB MESSAGES INTO GEMINI STRUCTURE


  module.exports = (rows) => {

    return rows.map(row => ({
      
      role: row.role,
      parts: [{
        text: row.content
      }]

    }));

  };