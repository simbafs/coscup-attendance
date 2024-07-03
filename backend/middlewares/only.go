package middlewares

import (
	"log"

	"github.com/gin-gonic/gin"
)

// Only is a middleware that only apply HandlerFunc to specific path and allow other path to pass through
func Only(HandlerFunc gin.HandlerFunc, path ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		for _, p := range path {
			if c.Request.URL.Path == p {
				log.Printf("apply middleware to %s", c.Request.URL.Path)
				HandlerFunc(c)
				return
			}
		}
		log.Printf("pass through %s", c.Request.URL.Path)
		c.Next()
	}
}
