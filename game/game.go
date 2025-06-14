package game

import (
    "strings"
    "math/rand"
)

type Game struct {
    width      int
    height     int
    state      [][]bool
    generation int
}

func NewGame(width, height int) *Game {
    game := &Game{
        width:      width,
        height:     height,
        generation: 0,
    }
    game.state = make([][]bool, height)
    for i := range game.state {
        game.state[i] = make([]bool, width)
    }
    return game
}

func (g *Game) countLiveNeighbors(x, y int) int {
    count := 0
    for dy := -1; dy <= 1; dy++ {
        for dx := -1; dx <= 1; dx++ {
            if dx == 0 && dy == 0 {
                continue
            }
            newX := x + dx
            newY := y + dy
            if g.IsValidCoordinate(newX, newY) && g.state[newY][newX] {
                count++
            }
        }
    }
    return count
}

func (g *Game) NextGeneration() {
    newState := make([][]bool, g.height)
    for i := range newState {
        newState[i] = make([]bool, g.width)
    }
    
    for y := 0; y < g.height; y++ {
        for x := 0; x < g.width; x++ {
            neighbors := g.countLiveNeighbors(x, y)
            currentCell := g.state[y][x]
            
            if currentCell {
                if neighbors == 2 || neighbors == 3 {
                    newState[y][x] = true
                }
            } else {
                if neighbors == 3 {
                    newState[y][x] = true
                }
            }
        }
    }
    
    g.state = newState
    g.generation++
}

func (g *Game) ToggleCell(x, y int) {
    if g.IsValidCoordinate(x, y) {
        g.state[y][x] = !g.state[y][x]  
    }
}

func (g *Game) SetCell(x, y int, alive bool) {
    if g.IsValidCoordinate(x, y) {
        g.state[y][x] = alive
    }
}

func (g *Game) GetCell(x, y int) bool {
    if g.IsValidCoordinate(x, y) {
        return g.state[y][x]
    }
    return false
}

func (g *Game) Clear() {
    for y := 0; y < g.height; y++ {
        for x := 0; x < g.width; x++ {
            g.state[y][x] = false
        }
    }
    g.generation = 0
}

func (g *Game) IsValidCoordinate(x, y int) bool {
    return x >= 0 && x < g.width && y >= 0 && y < g.height
}

func (g *Game) String() string {
    var builder strings.Builder
    for y := 0; y < g.height; y++ {
        for x := 0; x < g.width; x++ {
            if g.state[y][x] {
                builder.WriteString("█")
            } else {
                builder.WriteString("·")
            }
        }
        builder.WriteString("\n")
    }
    return builder.String()
}

func (g *Game) GetState() [][]bool {
    return g.state
}

func (g *Game) GetGeneration() int {
    return g.generation
}

func (g *Game) RandomFill() {
    for y := 0; y < g.height; y++ {
        for x := 0; x < g.width; x++ {
           
            if rand.Float32() < 0.3 {
                g.state[y][x] = true
            } else {
                g.state[y][x] = false
            }
        }
    }
}

func (g *Game) GetWidth() int {
    return g.width
}

func (g *Game) GetHeight() int {
    return g.height
}