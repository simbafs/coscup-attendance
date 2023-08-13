package websocket

import (
	"fmt"
	"log"
)

type HubProcessor func(*Client, []byte, chan []byte)

type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	processor  HubProcessor
}

func NewHub(handler HubProcessor) *Hub {
	if handler == nil {
		handler = func(from *Client, in []byte, out chan []byte) {
			log.Printf("Received: %s", in)
			out <- append([]byte(fmt.Sprintf("from %s: ", from.id)), in...)
		}
	}

	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
		processor:  handler,
	}
}

func (h *Hub) run() {
	for {
		select {
		case conn := <-h.register:
			h.clients[conn] = true
		case conn := <-h.unregister:
			if _, ok := h.clients[conn]; ok {
				delete(h.clients, conn)
				close(conn.send)
			}
		case message := <-h.broadcast:
			for conn := range h.clients {
				select {
				case conn.send <- message:
				default:
					close(conn.send)
					delete(h.clients, conn)
				}
			}
		}
	}
}
