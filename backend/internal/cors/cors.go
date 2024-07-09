package cors

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func Cors(mode string) gin.HandlerFunc {
	switch mode {
	case "debug":
		return cors.Default()
	case "release":
		return cors.New(cors.Config{
			AllowOrigins: []string{"https://coscup.org", "http://localhost:5173"},
			AllowMethods: []string{"GET", "POST"},
			AllowHeaders: []string{"Origin"},
		})
	default:
		return cors.New(cors.DefaultConfig())
	}
}
