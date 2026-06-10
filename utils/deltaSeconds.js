// FUNCTION TO SET DELTA TIME(LENGTH BETWEEN INTERACTIONS)


module.exports = (rows) => {
  if (!rows || rows.length < 2) return 0;

  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];

  return Math.round(
    (new Date(last.created_at) - new Date(prev.created_at)) / 1000
  );
}