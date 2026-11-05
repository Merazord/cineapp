import mysql from "mysql2/promise";
const projection = `SELECT p.Identificador AS id, p.Titulo AS titulo, p.IDDirector AS directorId, p.Duracion AS duracion, p.IDCategoria AS categoriaId, p.Sinopsis AS sinopsis, p.Color AS color, p.Estreno AS estreno, d.Director AS director, c.Categoria AS categoria FROM Peliculas p JOIN Directores d ON d.IDDirector=p.IDDirector JOIN Categorias c ON c.Identificador=p.IDCategoria`;
export function mysqlRepository() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "cineapp",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "cineapp",
    connectionLimit: 5,
    connectTimeout: 5000,
  });
  const normalize = (rows) =>
    rows.map((p) => ({ ...p, estreno: Boolean(p.estreno) }));
  return {
    async list({ q = "", categoriaId } = {}) {
      const where = ["p.Titulo LIKE ?"];
      const args = [`%${q.replace(/[\\%_]/g, "\\$&")}%`];
      if (categoriaId) {
        where.push("p.IDCategoria=?");
        args.push(categoriaId);
      }
      const [rows] = await pool.execute(
        `${projection} WHERE ${where.join(" AND ")} ORDER BY p.Identificador`,
        args,
      );
      return normalize(rows);
    },
    async detail(id) {
      const [rows] = await pool.execute(
        `${projection} WHERE p.Identificador=?`,
        [id],
      );
      return normalize(rows)[0] || null;
    },
    async categories() {
      const [rows] = await pool.query(
        "SELECT Identificador AS id, Categoria AS nombre FROM Categorias ORDER BY Identificador",
      );
      return rows;
    },
    async directors() {
      const [rows] = await pool.query(
        "SELECT IDDirector AS id, Director AS nombre FROM Directores ORDER BY IDDirector",
      );
      return rows;
    },
    async ping() {
      await pool.query("SELECT 1");
      return true;
    },
    async close() {
      await pool.end();
    },
  };
}
