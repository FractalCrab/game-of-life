package main

import (
    "fmt"
    "html/template"
    "net/http"
    "strconv"
    
    "game-of-life/game"
)


var gameInstance *game.Game

func main() {
    gameInstance = game.NewGame(30, 20)
    

    http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
    

    http.HandleFunc("/", handleHome)
    http.HandleFunc("/toggle", handleToggle)
    http.HandleFunc("/next", handleNext)
    http.HandleFunc("/clear", handleClear)
    http.HandleFunc("/random", handleRandom)
    http.HandleFunc("/toggle-auto-play", handleToggleAutoPlay)
    http.HandleFunc("/pattern/", handlePattern)
    
    fmt.Println("Server starting on http://localhost:8080")
    http.ListenAndServe(":8080", nil)
}

func handleHome(w http.ResponseWriter, r *http.Request) {
    tmpl := template.Must(template.ParseFiles("templates/index.html"))
    
    data := struct {
        State      [][]bool
        Generation int
    }{
        State:      gameInstance.GetState(),
        Generation: gameInstance.GetGeneration(),
    }
    
    tmpl.Execute(w, data)
}

func handleToggle(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }
    

    xStr := r.FormValue("x")
    yStr := r.FormValue("y")
    
    x, err1 := strconv.Atoi(xStr)
    y, err2 := strconv.Atoi(yStr)
    
    if err1 != nil || err2 != nil {
        http.Error(w, "Invalid coordinates", http.StatusBadRequest)
        return
    }
    
 
    gameInstance.ToggleCell(x, y)
    

    renderGrid(w)
}

func handleNext(w http.ResponseWriter, r *http.Request) {
    gameInstance.NextGeneration()
    renderGrid(w)
}

func handleClear(w http.ResponseWriter, r *http.Request) {
    gameInstance.Clear()
    renderGrid(w)
}

func handleRandom(w http.ResponseWriter, r *http.Request) {
    gameInstance.RandomFill()
    renderGrid(w)
}

func renderGrid(w http.ResponseWriter) {
    gridTemplate := `{{range $y, $row := .State}}{{range $x, $cell := $row}}<div class="cell {{if $cell}}alive{{end}}" hx-post="/toggle" hx-vals='{"x":{{$x}}, "y":{{$y}}}' hx-target="#grid" hx-swap="innerHTML"></div>{{end}}{{end}}`
    
    tmpl := template.Must(template.New("grid").Parse(gridTemplate))
    
    data := struct {
        State [][]bool
    }{
        State: gameInstance.GetState(),
    }
    
    tmpl.Execute(w, data)
}

var autoPlayActive = false

func handleToggleAutoPlay(w http.ResponseWriter, r *http.Request) {
    autoPlayActive = !autoPlayActive
    
    if autoPlayActive {

        autoPlayHTML := `<div id="auto-play-container" hx-get="/next" hx-trigger="every 500ms" hx-target="#grid" hx-swap="innerHTML"></div>`
        w.Header().Set("Content-Type", "text/html")
        w.Write([]byte(autoPlayHTML))
    } else {
  
        autoPlayHTML := `<div id="auto-play-container"></div>`
        w.Header().Set("Content-Type", "text/html")
        w.Write([]byte(autoPlayHTML))
    }
}

func handlePattern(w http.ResponseWriter, r *http.Request) {

    patternName := r.URL.Path[len("/pattern/"):]
    
    gameInstance.Clear()
    
    centerX := gameInstance.GetWidth() / 2
    centerY := gameInstance.GetHeight() / 2
    
    switch patternName {
    case "glider":
 
        gameInstance.SetCell(centerX+1, centerY, true)
        gameInstance.SetCell(centerX+2, centerY+1, true)
        gameInstance.SetCell(centerX, centerY+2, true)
        gameInstance.SetCell(centerX+1, centerY+2, true)
        gameInstance.SetCell(centerX+2, centerY+2, true)
        
    case "blinker":

        gameInstance.SetCell(centerX-1, centerY, true)
        gameInstance.SetCell(centerX, centerY, true)
        gameInstance.SetCell(centerX+1, centerY, true)
        
    case "block":

        gameInstance.SetCell(centerX, centerY, true)
        gameInstance.SetCell(centerX+1, centerY, true)
        gameInstance.SetCell(centerX, centerY+1, true)
        gameInstance.SetCell(centerX+1, centerY+1, true)
        
    case "beacon":

        gameInstance.SetCell(centerX, centerY, true)
        gameInstance.SetCell(centerX+1, centerY, true)
        gameInstance.SetCell(centerX, centerY+1, true)
        gameInstance.SetCell(centerX+3, centerY+2, true)
        gameInstance.SetCell(centerX+2, centerY+3, true)
        gameInstance.SetCell(centerX+3, centerY+3, true)
        
    case "toad":

        gameInstance.SetCell(centerX+1, centerY, true)
        gameInstance.SetCell(centerX+2, centerY, true)
        gameInstance.SetCell(centerX+3, centerY, true)
        gameInstance.SetCell(centerX, centerY+1, true)
        gameInstance.SetCell(centerX+1, centerY+1, true)
        gameInstance.SetCell(centerX+2, centerY+1, true)
    }
    
    renderGrid(w)
}