package api

import (
	"backend/internal/db"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Route(r *gin.Engine) {
	api := r.Group("/api")
	api.GET("/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"message": "Hello, world!",
		})
	})

	api.GET("/attendance", func(c *gin.Context) {
		attendance, err := db.GetAttendanceData()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":     "ok",
			"attendance": attendance,
		})
	})

	api.GET("/verify", func(c *gin.Context) {
		if err := db.VerifyToken(c.Query("token")); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  "error",
				"message": err.Error(),
			})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})
}
