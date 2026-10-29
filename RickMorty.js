
const readline = require("readline");

const URL_BASE = "https://rickandmortyapi.com/api";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function preguntar(texto) {
    return new Promise((resolve) => {
        rl.question(texto, (respuesta) => resolve(respuesta));
    });
}

async function obtenerDatos(url) {
    const respuesta = await fetch(url);

    if (respuesta.status === 404) {
        throw new Error("No se ha encontrado el recurso (404).");
    }
    if (!respuesta.ok) {
        throw new Error("La API ha respondido con el código " + respuesta.status);
    }

    return await respuesta.json();
}

async function pedirIdPersonaje(total) {
    while (true) {
        const texto = (await preguntar(`Introduce el número de personaje (1-${total}): `)).trim();

        if (texto === "") {
            console.log("Error: no has escrito nada.");
            continue;
        }

        const numero = Number(texto);
        if (!Number.isInteger(numero)) {
            console.log("Error: debes introducir un número entero.");
            continue;
        }

        if (numero < 1 || numero > total) {
            console.log(`Error: el número debe estar entre 1 y ${total}.`);
            continue;
        }

        return numero;
    }
}

async function main() {
    try {

        const listado = await obtenerDatos(`${URL_BASE}/character`);
        const total = listado.info.count;

        const id = await pedirIdPersonaje(total);

        const personaje = await obtenerDatos(`${URL_BASE}/character/${id}`);

        if (!personaje.episode || personaje.episode.length === 0) {
            console.log(`${personaje.name} no aparece en ningún episodio.`);
            return;
        }

        const posicion = Math.floor(Math.random() * personaje.episode.length);
        const urlEpisodio = personaje.episode[posicion];

        const episodio = await obtenerDatos(urlEpisodio);

        console.log("\n==============================");
        console.log("Personaje: " + personaje.name);
        console.log("Estado: " + personaje.status);
        console.log("Especie: " + personaje.species);
        console.log("Aparece en " + personaje.episode.length + " episodios");
        console.log("------------------------------");
        console.log("Episodio aleatorio:");
        console.log("Nombre: " + episodio.name);
        console.log("Código: " + episodio.episode);
        console.log("Fecha de emisión: " + episodio.air_date);
        console.log("Personajes que salen: " + episodio.characters.length);
        console.log("==============================");
    } catch (error) {

        console.log("Ha ocurrido un error: " + error.message);
    } finally {

        rl.close();
    }
}

main();