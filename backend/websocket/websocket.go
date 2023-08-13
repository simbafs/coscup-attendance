package websocket

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	gwebsocket "github.com/gorilla/websocket"
)

var upgrader = gwebsocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
}

// serveWs handles websocket requests from the peer.
func serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}

func Route(r *gin.Engine) {
	hub := NewHub()
	go hub.run()
	r.GET("/ws", func(c *gin.Context) {
		serveWs(hub, c.Writer, c.Request)
	})
}
