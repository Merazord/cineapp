-- CineApp: obras ficticias para práctica académica. MySQL 8.4.
CREATE DATABASE IF NOT EXISTS cineapp CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE cineapp;
CREATE TABLE IF NOT EXISTS Directores (
 IDDirector INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 Director VARCHAR(150) NOT NULL
);
CREATE TABLE IF NOT EXISTS Categorias (
 Identificador INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 Categoria VARCHAR(80) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS Peliculas (
 Identificador INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 Titulo VARCHAR(200) NOT NULL,
 IDDirector INT UNSIGNED NOT NULL,
 Duracion SMALLINT UNSIGNED NOT NULL CHECK (Duracion > 0),
 IDCategoria INT UNSIGNED NOT NULL,
 Sinopsis TEXT NOT NULL,
 Color CHAR(7) NOT NULL DEFAULT '#6654da',
 Estreno BOOLEAN NOT NULL DEFAULT FALSE,
 FOREIGN KEY (IDDirector) REFERENCES Directores(IDDirector),
 FOREIGN KEY (IDCategoria) REFERENCES Categorias(Identificador)
);
-- Los INSERT se omiten si ya existe el identificador. No borran datos existentes.
INSERT IGNORE INTO Directores VALUES (1,'Elena Vargas');
INSERT IGNORE INTO Directores VALUES (2,'Mateo Ríos');
INSERT IGNORE INTO Directores VALUES (3,'Lucía Montes');
INSERT IGNORE INTO Directores VALUES (4,'Diego Solís');
INSERT IGNORE INTO Categorias VALUES (1,'Ciencia ficción');
INSERT IGNORE INTO Categorias VALUES (2,'Drama');
INSERT IGNORE INTO Categorias VALUES (3,'Animación');
INSERT IGNORE INTO Categorias VALUES (4,'Aventura');
INSERT IGNORE INTO Peliculas VALUES (1,'Órbita cero',1,124,1,'Una ingeniera recibe una señal desde una estación abandonada. Al seguirla, descubre una decisión que puede cambiar el futuro de la Tierra.','#6654da',1);
INSERT IGNORE INTO Peliculas VALUES (2,'La última luz',2,108,2,'Una fotógrafa regresa a su pueblo para reconstruir el archivo de su padre y encuentra historias que nunca le contaron.','#b9663a',1);
INSERT IGNORE INTO Peliculas VALUES (3,'El bosque de papel',3,96,3,'Una pequeña ilustradora entra en el mundo de sus dibujos para ayudar a un zorro a recuperar los colores de su bosque.','#328d76',0);
INSERT IGNORE INTO Peliculas VALUES (4,'Más allá del norte',4,117,4,'Dos hermanos siguen un mapa incompleto hasta una montaña remota, donde aprenderán a confiar el uno en el otro.','#3d7ca7',0);
INSERT IGNORE INTO Peliculas VALUES (5,'Ecos de mañana',1,132,1,'Un músico descubre que una vieja grabadora puede capturar sonidos del día siguiente. Su próxima grabación anuncia un misterio.','#9c4f96',0);
INSERT IGNORE INTO Peliculas VALUES (6,'Domingos de lluvia',2,102,2,'Los visitantes de una librería coinciden cada domingo durante una temporada de lluvia y construyen una inesperada amistad.','#a37b3d',0);
