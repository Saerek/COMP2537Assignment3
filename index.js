const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []

const numPageBtn = 5;

const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  const startPage = Math.max(1, currentPage - Math.floor(numPageBtn / 2));
  const endPage = Math.min(numPages, startPage + numPageBtn - 1);

  if (currentPage > 1) {
    $("#pagination").append(`
        <button class="btn btn-dark page ml-1 numberedButtons" value="${currentPage - 1}">Prev</button>
    `);
  }

  
    for (let i = startPage; i <= endPage; i++) {
      $('#pagination').append(`
      <button class="btn btn-dark page ml-1 numberedButtons" value="${i}">${i}</button>
      `)
    }
    
    if (currentPage < numPages) {
      $("#pagination").append(`
          <button class="btn btn-dark page ml-1 numberedButtons" value="${currentPage + 1}">Next</button>
      `);
    }
    
    $(`#pagination .numberedButtons[value=${currentPage}]`).addClass(
        "currentPage");
}

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {

  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $("#pokeDisplay").html(
    `<h3>Displaying ${selected_pokemons.length} of  ${pokemons.length} Pokemon</h3>`
  );
    

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-dark" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
};

const setup = async () => {
    $('#pokeCards').empty();
    let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
    pokemons = response.data.results;
  
    for (const pokemon of pokemons) {
      let res = await axios.get(pokemon.url);
      let types = res.data.types.map((type) => type.type.name);
      pokemon.type = types;
    }

    paginate(currentPage, PAGE_SIZE, pokemons);
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages);
  
    let response2 = await axios.get("https://pokeapi.co/api/v2/type");
    pokeTypes = response2.data.results.map((type) => type.name);
    pokeTypes.forEach((type) => {
      $("#pokeTypesFilter").append(`
        <div class="form-check">
          <input class="form-check-input type-filter" type="checkbox" id="${type}" value="${type}">
          <label class="form-check-label" for="${type}">
            ${type}  
          </label>
        </div>
      `);
    });
  
    $(".type-filter").change(() => {
      var checkedCheckboxes = $("input:checkbox:checked.type-filter");
  
      filterList = checkedCheckboxes
        .map(function (index, element) {
          return $(element).val();
        })
        .get();
        let filteredPokemons = [];
        filteredPokemons = pokemons.filter((pokemon) => {
        return filterList.every((type) => {
        return pokemon.type && pokemon.type.includes(type);
        });
      });

      const numFilteredPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
      currentPage = Math.min(currentPage, numFilteredPages);
  
      updatePaginationDiv(currentPage, numFilteredPages);
      paginate(currentPage, PAGE_SIZE, filteredPokemons);
    });

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)
  })

};


$(document).ready(setup)