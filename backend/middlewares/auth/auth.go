package auth

import (
	"backend/internal/logger"
	"net/http"

	"github.com/gin-gonic/gin"
)

var log = logger.New("middleware")

type AuthFunc func(c *gin.Context) bool

// Auth is a middleware that apply multiple AuthFunc to the request
func Auth(fail gin.HandlerFunc, f ...AuthFunc) gin.HandlerFunc {
	return func(c *gin.Context) {
		for _, auth := range f {
			if !auth(c) {
				fail(c)
				return
			}
		}
		c.Next()
	}
}

func Token(token string) AuthFunc {
	return func(c *gin.Context) bool {
		t, ok := c.GetQuery("token")
		if !ok {
			log.Printf("token not found")
			return false
		}
		if t != token {
			log.Printf("invalid token %s", t)
			return false
		}
		return true
	}
}

func Fail401(c *gin.Context) {
	c.JSON(http.StatusUnauthorized, gin.H{
		"status":  "error",
		"message": "unauthorized",
	})
	c.Abort()
}

func FailLogin(c *gin.Context) {
	c.Redirect(http.StatusFound, "/token")
}
