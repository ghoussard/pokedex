async function fetchPokemon(pokemonId) {
    const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
    if(!pokemonResponse.ok) {
        throw new Error('Network Error')
    }
    return await pokemonResponse.json()
}

class PokemonView extends HTMLElement {
    constructor() {
        super()
        
        const pokemonId = this.getAttribute('pokemon-id')
        this.setPokemonId(pokemonId)

        this.render()
    }

    static get observedAttributes() {
        return ['pokemon-id']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'pokemon-id') {
            if(oldValue !== newValue) {
                this.setPokemonId(newValue)
                this.render()
            }
        }
    }

    setPokemonId(pokemonId) {
        if(null === pokemonId) pokemonId = 0
        this.pokemonId = parseInt(pokemonId)
    }

    render() {
        this.innerHTML = ``

        if(this.pokemonId === 0) {
            this.renderTooltip()
        } else {
            fetchPokemon(this.pokemonId)
                .then(pokemon => this.renderPokemon(pokemon))
                .catch(e => this.renderError(e))
        }
    }

    renderTooltip() {
        const tooltip = document.createElement('div')
        tooltip.classList.add('pokemon-tooltip')
        this.appendChild(tooltip)

        const tooltipTitle = document.createElement('div')
        tooltipTitle.classList.add('pokemon-tooltip-title')
        tooltipTitle.innerText = 'POKEDEX'
        tooltip.appendChild(tooltipTitle)

        const tooltipContent = document.createElement('div')
        tooltipContent.classList.add('pokemon-tooltip-content')
        tooltipContent.innerText = 'Click arrows button to show next or previous Pokemon'
        tooltip.appendChild(tooltipContent)
    }

    renderPokemon(pokemon) {
        /**
         * POKEMON NAME
         */
        const pokemonName = pokemon.name[0].toUpperCase() + pokemon.name.slice(1)
        const name = document.createElement('div')
        name.classList.add('pokemon-name')
        name.innerText = pokemonName
        this.appendChild(name)

        /**
         * POKEMON TYPES
         */
        const types = document.createElement('div')
        types.classList.add('pokemon-types')
        this.appendChild(types)

        pokemon.types.forEach(typeObject => {            
            const type = document.createElement('div')
            type.classList.add('pokemon-type')
            type.classList.add(typeObject.type.name)
            type.innerText = typeObject.type.name.toUpperCase()
            types.appendChild(type)
        })

        /**
         * POKEMON SPRITES
         */
        const sprites = document.createElement('div')
        sprites.classList.add('pokemon-sprites')
        this.appendChild(sprites)

        const spriteNames = ['front_default', 'back_default']
        spriteNames.forEach(spriteName => {pokemon.sprites[spriteName]
            if(null === pokemon.sprites[spriteName]) return
            const sprite = document.createElement('img')
            sprite.classList.add('pokemon-sprite')
            sprite.src = `${pokemon.sprites[spriteName]}`
            sprites.appendChild(sprite)
        })
    }

    renderError(e) {
        const error = document.createElement('div')
        error.classList.add('pokemon-error')
        this.appendChild(error)

        const errorImage = document.createElement('img')
        errorImage.src = 'assets/ko.jpg'
        errorImage.classList.add('pokemon-error-image')
        error.appendChild(errorImage)

        const errorMessage = document.createElement('div')
        errorMessage.innerText = `${e}`
        errorMessage.classList.add('pokemon-error-message')
        error.appendChild(errorMessage)
    }
}

customElements.define('pokemon-view', PokemonView)

const pokemonView = document.querySelector('pokemon-view')
const controlsScreen = document.querySelector('.controls-center-screen')

function updatePokemonView(pokemonId) {
    pokemonView.setAttribute('pokemon-id', pokemonId)
}

function updateControlsScreen(pokemonId) {
    controlsScreen.innerText = `#${pokemonId.toString().padStart(3, '0')}`
}

const MIN_POKEMON_ID = 0
const MAX_POKEMON_ID = 807
let pokemonId = 0

updateControlsScreen(pokemonId)
updatePokemonView(pokemonId)

document.querySelectorAll('.controls-right-arrow.up, .controls-right-arrow.right').forEach(el => el.addEventListener('click', (e) => {
    if(pokemonId < MAX_POKEMON_ID) pokemonId++
    updateControlsScreen(pokemonId)
    updatePokemonView(pokemonId)
}))

document.querySelectorAll('.controls-right-arrow.down, .controls-right-arrow.left').forEach(el => el.addEventListener('click', (e) => {
    if(pokemonId > MIN_POKEMON_ID) pokemonId--
    updateControlsScreen(pokemonId)
    updatePokemonView(pokemonId)
}))
