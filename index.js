/**
 * We want to find shortest path between two points in a 2D array
 * in this array we have 4 types of tiles:
 * 'S' -> starting position
 * '0' -> obstacle
 * '1' -> valid path
 * 'D' -> destination
 * 'U' -> not defined tile
 * we should have a Tile class, this class will have type, x and y pos
 */

class Type{
    static Start = new Type('S')
    static Path = new Type('1')
    static Obstacle = new Type('0')
    static End = new Type('E')
    static FinalPath = new Type('F')

    constructor(name){
        this.name = name
    }

    getFullName(){
        if(this.name === 'S')
            return 'Start'
        else if(this.name === '1')
            return 'Path'
        else if(this.name === '0')
            return 'Obstacle'
        else if(this.name === 'F')
            return 'FinalPath'
        else 
            return 'End'
    }

    toString(){
        return this.name
    }
}

class Tile{
    constructor(xPos, yPos, type){
        this.xPos = xPos
        this.yPos = yPos
        this.type = type
        this.visited = false
        this.prev = undefined
    }
    setType(type){
        this.type = type
    }
    getType(){
        return this.type
    }
    setVisited(visited){
        this.visited = visited
    }
    getVisited(){
        return this.visited
    }
    isValidPath(){
        return this.type.getFullName() !== 'Obstacle'
    }
    setPrev(tile){
        this.prev = tile
    }
    getPrev(){
        return this.prev
    }
    toString(){
        return this.type.toString()
    }
}

class Field{
    constructor(width, height){
        this.width = width
        this.height = height
        this.field = Array.from({length: height}, (_, yPos) => Array.from({length: width}, (__, xPos) => new Tile(xPos, yPos, Type.Path)))
        this.pathFound = false
    }
    getWidth(){
        return this.width
    }
    getHeight(){
        return this.height
    }
    printField(){
        for(let i = 0; i < this.height; i++){
            let row = []
            for(let j = 0; j < this.width; j++){
                row.push(this.field[i][j].toString())
            }
            console.log(row.join(" "))
        }
    }
    defineTile(xPos, yPos, type){
        if(xPos >= this.width || xPos < 0){
            console.log(`INVALID xPos passed to 'Field.defineTile' to set type: ${type.getFullName()}`)
        }
        else if(yPos >= this.height || yPos < 0){
            console.log(`INVALID yPos passed to 'Field.defineTile' to set type: ${type.getFullName()}`)
        }
        else{
            this.field[yPos][xPos].setType(type)
            if(type.getFullName() === 'Start'){
                this.start = this.field[yPos][xPos]
            }
            if(type.getFullName() === 'End'){
                this.end = this.field[yPos][xPos]
            }
        }
            
    }
    validateField(){
        // check if we have start and end tile defined, without them we dont have a path to look for
        if(this.start === undefined || this.end === undefined){
            Swal.fire({
                title: "Error",
                text: `Please define ${this.start === undefined ? 'start' : 'end'} tile`,
                icon: "error",
                confirmButtonText: "Okay",
                heightAuto: false
            })
            return false
        }
        return true
    }

    getNeighbours(tile){
        let neighbours = []
        if(tile.yPos + 1 < this.height && !this.field[tile.yPos + 1][tile.xPos].getVisited() && this.field[tile.yPos + 1][tile.xPos].isValidPath())
            neighbours.push(this.field[tile.yPos + 1][tile.xPos])
        
        if(tile.yPos - 1 >= 0 && !this.field[tile.yPos - 1][tile.xPos].getVisited() && this.field[tile.yPos - 1][tile.xPos].isValidPath())
            neighbours.push(this.field[tile.yPos - 1][tile.xPos]) 
        
        if(tile.xPos + 1 < this.width && !this.field[tile.yPos][tile.xPos + 1].getVisited() && this.field[tile.yPos][tile.xPos + 1].isValidPath())
            neighbours.push(this.field[tile.yPos][tile.xPos + 1])

        if(tile.xPos - 1 >= 0 && !this.field[tile.yPos][tile.xPos - 1].getVisited() && this.field[tile.yPos][tile.xPos - 1].isValidPath())
            neighbours.push(this.field[tile.yPos][tile.xPos - 1])
        
        return neighbours
    }

    clearOldPaths(){
        for(let i = 0; i < this.height; i++){
            for(let j = 0; j < this.width; j++){
                this.field[i][j].setPrev(undefined)
                this.field[i][j].setVisited(false)
                if(this.field[i][j].getType().getFullName() === 'FinalPath')
                    this.field[i][j].setType(Type.Path)
            }
        } 
    }

    findPath(){
        if(this.validateField()){
            this.clearOldPaths()
            this.pathFound = false
            let queue = [] // in JS we can use array as queue struct, for that we can use push to add and use shift to remove from the start
            queue.push(this.start)
            this.start.setVisited(true)
            
            while(queue.length != 0){
                let node = queue.shift()
                let neighbours = this.getNeighbours(node)
                for(let i = 0; i < neighbours.length; i++){
                    let neighbour = neighbours[i]
                    queue.push(neighbour)
                    neighbour.setVisited(true)
                    neighbour.setPrev(node)
                    if(neighbour.getType().getFullName() === 'End')
                        this.pathFound = true
                }
            }
            return true
        }
        return false
    }

    constructPath(){
        if(!this.pathFound){
            Swal.fire({
                title: "No path found.",
                icon: "info",
                confirmButtonText: "Okay",
                heightAuto: false
            })
            return false
        }
        else{
            let node = this.end.prev
            while(node.getType().getFullName() !== 'Start'){
                node.setType(Type.FinalPath)
                node = node.prev
            }
            return true
        }
    }
    generateHtml(){
        let container = document.getElementById("field")
        container.innerHTML = ""
        for(let i = 0; i < this.height; i++){
            let row = document.createElement("div")
            row.setAttribute("class", "field-row")
            for(let j = 0; j < this.width; j++){
                let tile = document.createElement("span")
                tile.setAttribute("class", `tile ${this.field[i][j].getType().getFullName().toLowerCase()}`)
                tile.setAttribute("id", `row=${i}col=${j}`)
                tile.addEventListener("click", () => this.changeTileType(j, i))
                row.appendChild(tile)
            }
            container.appendChild(row)
        }
    }
    changeTileType(xPos, yPos, reset){
        let id = `row=${yPos}col=${xPos}`
        let tile = document.getElementById(id)
        let tileType = tile.getAttribute("class").split(" ")[1]
        if(tileType === window.setTileType.getFullName().toLowerCase() || reset){
            if(window.setTileType.getFullName().toLowerCase() === 'start'){
                this.start = undefined
            }
            if( window.setTileType.getFullName().toLowerCase() === 'end'){
                this.end = undefined
            }
            tile.setAttribute("class", 'tile path')
            this.defineTile(xPos, yPos, Type.Path)
        }
        else{ 
            if((window.setTileType.getFullName().toLowerCase() === 'start' && this.start === undefined) || 
               (window.setTileType.getFullName().toLowerCase() === 'end' && this.end === undefined) ||
               (window.setTileType.getFullName().toLowerCase() !== 'start' && window.setTileType.getFullName().toLowerCase() !== 'end')){
                tile.setAttribute("class", `tile ${window.setTileType.getFullName().toLowerCase()}`)
                this.defineTile(xPos, yPos, window.setTileType)
            }
        }
    }
    findAndConstructPathHTML(){
        if(this.findPath()){
            this.constructPath()
        }
        this.generateHtml()
    }
}

window.field = undefined // global object goes brrrrrrrrrrrrrrrrrrrrr
window.setTileType = Type.Obstacle

function createField(){
    let width = Number(document.getElementById("width-input").value)
    let height = Number(document.getElementById("height-input").value)

    if(width <= 0 || height <= 0){
        let invalid = width <= 0 ? 'width' : 'height'
        Swal.fire({
            title: "Error!",
            text: `Invalid ${invalid}! Enter valid ${invalid}.`,
            icon: "error",
            confirmButtonText: "Okay",
            heightAuto: false
        })
    }
    else{
        window.field = new Field(width, height)
        window.field.generateHtml()
        document.getElementsByClassName("field-container")[0].style.display = "flex"
        document.getElementsByClassName("begin-settings-wrapper")[0].style.display = "none"

        document.getElementById("set-start-button").addEventListener("click", () => window.setTileType = Type.Start)
        document.getElementById("set-end-button").addEventListener("click", () => window.setTileType = Type.End)
        document.getElementById("set-obstacle-button").addEventListener("click", () => window.setTileType = Type.Obstacle)
        document.getElementById("start-search-button").addEventListener("click", () => window.field.findAndConstructPathHTML())
        document.getElementById("restart-field-button").addEventListener("click", () => {
            window.field = new Field(window.field.getWidth(), window.field.getHeight())
            window.field.generateHtml()
        })

    }
}

// set listener for settings send button
document.getElementById("settings-button").addEventListener("click", createField)