export const categorias = [
  { id: 1, nombre: "Ciencia ficción" },
  { id: 2, nombre: "Drama" },
  { id: 3, nombre: "Animación" },
  { id: 4, nombre: "Aventura" },
];
export const directores = [
  { id: 1, nombre: "Elena Vargas" },
  { id: 2, nombre: "Mateo Ríos" },
  { id: 3, nombre: "Lucía Montes" },
  { id: 4, nombre: "Diego Solís" },
];
// Obras ficticias originales para la demostración académica.
export const peliculas = [
  {
    id: 1,
    titulo: "Órbita cero",
    directorId: 1,
    duracion: 124,
    categoriaId: 1,
    sinopsis:
      "Una ingeniera recibe una señal desde una estación abandonada. Al seguirla, descubre una decisión que puede cambiar el futuro de la Tierra.",
    color: "#6654da",
    estreno: true,
  },
  {
    id: 2,
    titulo: "La última luz",
    directorId: 2,
    duracion: 108,
    categoriaId: 2,
    sinopsis:
      "Una fotógrafa regresa a su pueblo para reconstruir el archivo de su padre y encuentra historias que nunca le contaron.",
    color: "#b9663a",
    estreno: true,
  },
  {
    id: 3,
    titulo: "El bosque de papel",
    directorId: 3,
    duracion: 96,
    categoriaId: 3,
    sinopsis:
      "Una pequeña ilustradora entra en el mundo de sus dibujos para ayudar a un zorro a recuperar los colores de su bosque.",
    color: "#328d76",
    estreno: false,
  },
  {
    id: 4,
    titulo: "Más allá del norte",
    directorId: 4,
    duracion: 117,
    categoriaId: 4,
    sinopsis:
      "Dos hermanos siguen un mapa incompleto hasta una montaña remota, donde aprenderán a confiar el uno en el otro.",
    color: "#3d7ca7",
    estreno: false,
  },
  {
    id: 5,
    titulo: "Ecos de mañana",
    directorId: 1,
    duracion: 132,
    categoriaId: 1,
    sinopsis:
      "Un músico descubre que una vieja grabadora puede capturar sonidos del día siguiente. Su próxima grabación anuncia un misterio.",
    color: "#9c4f96",
    estreno: false,
  },
  {
    id: 6,
    titulo: "Domingos de lluvia",
    directorId: 2,
    duracion: 102,
    categoriaId: 2,
    sinopsis:
      "Los visitantes de una librería coinciden cada domingo durante una temporada de lluvia y construyen una inesperada amistad.",
    color: "#a37b3d",
    estreno: false,
  },
];
export function enrich(p) {
  return {
    ...p,
    director: directores.find((d) => d.id === p.directorId).nombre,
    categoria: categorias.find((c) => c.id === p.categoriaId).nombre,
  };
}
export function demoRepository() {
  return {
    async list({ q = "", categoriaId } = {}) {
      return peliculas
        .map(enrich)
        .filter(
          (p) =>
            (!categoriaId || p.categoriaId === categoriaId) &&
            p.titulo
              .toLocaleLowerCase("es")
              .includes(q.toLocaleLowerCase("es")),
        );
    },
    async detail(id) {
      const p = peliculas.find((p) => p.id === id);
      return p ? enrich(p) : null;
    },
    async categories() {
      return categorias;
    },
    async directors() {
      return directores;
    },
    async ping() {
      return true;
    },
  };
}
