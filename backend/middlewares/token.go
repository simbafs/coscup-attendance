package middleware

import (
	"backend/internal/logger"

	"github.com/gin-gonic/gin"
)

var log = logger.New("middleware")

func Token(token []string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// get token from query string token=xxx
		queryToken := c.Query("token")
		for _, t := range token {
			log.Printf("token: '%s', '%s' %v\n", t, queryToken, t == queryToken)
			if queryToken == t {
				c.Next()
				return
			}
		}
		c.JSON(401, gin.H{
			"status":  "error",
			"message": "unauthorized",
		})
		c.Abort()
	}
}
