import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Asegúrate de importar el archivo CSS

const App = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage] = useState(21);

  // Obtener todos los Pokémon
  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await axios.get(
          "https://pokeapi.co/api/v2/pokemon?limit=649"
        );
        const detailedPokemonList = await Promise.all(
          response.data.results.map(async (pokemon) => {
            const pokemonDetails = await axios.get(pokemon.url);
            const speciesDetails = await axios.get(
              pokemonDetails.data.species.url
            );
            const description =
              speciesDetails.data.flavor_text_entries.find(
                (entry) => entry.language.name === "es"
              )?.flavor_text || "No description available.";

            // Obtener la cadena evolutiva
            const evolutionChainUrl = speciesDetails.data.evolution_chain.url;
            const evolutionChainResponse = await axios.get(evolutionChainUrl);
            const evolutions = extractEvolutions(
              evolutionChainResponse.data.chain
            );

            return {
              ...pokemon,
              image:
                pokemonDetails.data.sprites.other.dream_world.front_default,
              description: description,
              attacks: pokemonDetails.data.moves
                .map((move) => move.move.name)
                .slice(0, 4),
              types: pokemonDetails.data.types.map(
                (typeInfo) => typeInfo.type.name
              ),
              evolutions: evolutions, // Agregar evoluciones
            };
          })
        );
        setPokemonList(detailedPokemonList);
      } catch (error) {
        console.error("Error fetching the Pokémon list", error);
      }
    };

    // Función para extraer la cadena evolutiva
    const extractEvolutions = (chain) => {
      let evolutions = [];
      let currentStage = chain;

      do {
        evolutions.push(currentStage.species.name);
        currentStage = currentStage.evolves_to[0]; // Moverse al siguiente paso en la cadena
      } while (currentStage);

      return evolutions;
    };

    fetchPokemon();
  }, []);

  // Filtrar los Pokémon en base a la búsqueda
  const filteredPokemon = pokemonList.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular los Pokémon actuales según la página
  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = filteredPokemon.slice(
    indexOfFirstPokemon,
    indexOfLastPokemon
  );

  // Cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Total de páginas
  const totalPages = Math.ceil(filteredPokemon.length / pokemonsPerPage);

  return (
    <div style={{ textAlign: "center" }}>
   <div className="header">
  <div className="logo-title">
    <img
      src={require('./benji.jpeg')}
      alt="Logo Benji"
      className="logo"
    />
    <h1>Pokédex de Benji</h1>
  </div>
  <input
    type="text"
    placeholder="Buscar Pokémon"
    onChange={(e) => setSearchTerm(e.target.value)}
    value={searchTerm}
    className="search-input"
  />
</div>

      

      <div className="dedicatories">
        <p className="dedication">
          Cada Pokémon que descubres es una nueva lección y una oportunidad para
          soñar. ¡Sigue explorando!. Siempre estaré a tu lado en cada batalla y en cada aventura.
        </p>
        
      </div>
      <div className="grid-container">
        {currentPokemons.length ? (
          currentPokemons.map((pokemon, index) => (
            <div className="grid-item" key={index}>
              <h3>
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </h3>
              <img
                src={pokemon.image}
                alt={pokemon.name}
                className="pokemon-image"
              />
              <p>
                <strong>Type:</strong> {pokemon.types.join(", ")}
              </p>
              <p>{pokemon.description}</p>
              <p>
                <strong>Attacks:</strong> {pokemon.attacks.join(", ")}
              </p>
              <p>
                <strong>Evolutions:</strong> {pokemon.evolutions.join(" → ")}
              </p>{" "}
              {/* Mostrar evoluciones */}
            </div>
          ))
        ) : (
          <div className="no-pokemon-found">
            <h3 class="error">Pokemones de Benji no encontrados</h3>
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/25.svg"
              alt="Pikachu"
            />
            <p class="error">
              Pikachu está triste porque por el momento no encontró ningún
              Pokémon
            </p>
          </div>
        )}
      </div>
      <div>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => paginate(index + 1)}
            className={currentPage === index + 1 ? "active" : ""} // Aplicar clase 'active' si la página está seleccionada
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default App;
