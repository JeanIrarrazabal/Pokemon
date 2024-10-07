import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pokemonsPerPage] = useState(21);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true); // Estado para la carga

  useEffect(() => {
    const fetchPokemon = async () => {
      setLoading(true); // Activar el indicador de carga
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
              evolutions: evolutions,
            };
          })
        );
        setPokemonList(detailedPokemonList);
      } catch (error) {
        console.error("Error fetching the Pokémon list", error);
      } finally {
        setLoading(false); // Desactivar el indicador de carga
      }
    };

    const extractEvolutions = (chain) => {
      let evolutions = [];
      let currentStage = chain;

      do {
        evolutions.push(currentStage.species.name);
        currentStage = currentStage.evolves_to[0];
      } while (currentStage);

      return evolutions;
    };

    fetchPokemon();
  }, []);

  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesType = selectedType
      ? pokemon.types.includes(selectedType)
      : true;
    return (
      pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      matchesType
    );
  });

  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = filteredPokemon.slice(
    indexOfFirstPokemon,
    indexOfLastPokemon
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredPokemon.length / pokemonsPerPage);

  const openModal = (pokemon) => {
    setSelectedPokemon(pokemon);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPokemon(null);
  };

  const types = [
    "grass",
    "poison",
    "fire",
    "flying",
    "water",
    "bug",
    "normal",
    "electric",
    "ground",
    "fairy",
    "fighting",
    "psychic",
    "rock",
    "ghost",
    "ice",
    "dragon",
    "dark",
    "steel",
    "fairy",
  ];

  const typeSpanish = {
    grass: "planta",
    poison: "veneno",
    fire: "fuego",
    flying: "volador",
    water: "agua",
    bug: "bicho",
    normal: "normal",
    electric: "eléctrico",
    ground: "tierra",
    fairy: "hada",
    fighting: "lucha",
    psychic: "psíquico",
    rock: "roca",
    ghost: "fantasma",
    ice: "hielo",
    dragon: "dragón",
    dark: "siniestro",
    steel: "acero",
  };

  return (
    <div style={{ textAlign: "center" }}>
      {loading ? ( // Si está cargando, mostrar indicador de carga
        <div className="loading no-pokemon-found">
          <h1>Benji espera mientras Pikachu busca a tus Pokémon...</h1>
        </div>
      ) : (
        <>
          <div className="header">
            <div className="logo-title">
              <img
                src={require("./benji.jpeg")}
                alt="Logo Benji"
                className="logo"
              />
              <h1>Pokédex de Benji</h1>
            </div>
          </div>
          <div className="dedicatories">
            <p className="dedication">
              Cada Pokémon que descubres es una nueva lección y una oportunidad
              para soñar. ¡Sigue explorando! Siempre estaré a tu lado en cada
              batalla y en cada aventura.
            </p>
          </div>
          <input
            type="text"
            placeholder="Buscar Pokémon"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
            className="search-input"
          />
          <div className="type-filters">
            {types.map((type) => (
              <button key={type} onClick={() => setSelectedType(type)}>
                {typeSpanish[type].charAt(0).toUpperCase() +
                  typeSpanish[type].slice(1)}{" "}
                {/* Mostrar en español */}
              </button>
            ))}
            <button onClick={() => setSelectedType("")}>Mostrar Todos</button>
          </div>
          <div className="grid-container">
            {currentPokemons.length ? (
              currentPokemons.map((pokemon, index) => (
                <div className="grid-item" key={index}>
                  <h3>
                    {pokemon.name.charAt(0).toUpperCase() +
                      pokemon.name.slice(1)}
                  </h3>
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="pokemon-image"
                  />
                  <p>
                    <strong>Tipo:</strong>{" "}
                    {pokemon.types.map((type) => typeSpanish[type]).join(", ")}{" "}
                    {/* Mostrar en español */}
                  </p>

                  <p>{pokemon.description}</p>
                  <p>
                    <strong>Evolutions:</strong>{" "}
                    {pokemon.evolutions.join(" → ")}
                  </p>
                  <button onClick={() => openModal(pokemon)}>Ver más</button>
                </div>
              ))
            ) : (
              <div className="no-pokemon-found">
                <h3 className="error">Pokemones de Benji no encontrados</h3>
                <p className="error">
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
                className={currentPage === index + 1 ? "active" : ""}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {/* Modal */}
          {isModalOpen && (
            <div className="modal">
              <div className="modal-content">
                <h2>
                  {selectedPokemon.name.charAt(0).toUpperCase() +
                    selectedPokemon.name.slice(1)}
                </h2>
                <img
                  src={selectedPokemon.image}
                  alt={selectedPokemon.name}
                  className="pokemon-image-large"
                />
                <p>{selectedPokemon.description}</p>
                <p>
                  <strong>Attacks:</strong> {selectedPokemon.attacks.join(", ")}
                </p>
                <button onClick={closeModal}>Cerrar</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
