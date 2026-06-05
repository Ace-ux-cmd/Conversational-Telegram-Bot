  // Module to format db messages into expected gemini structure
  module.exports = (rows) => {

    return rows.map(row => ({
      
      role: row.role,
      parts: [{
        text: row.content
      }]

    }));

  };