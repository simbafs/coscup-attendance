package api

import (
	"backend/internal/db"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func errorRes(c *gin.Context, err error) {
	fmt.Println(err)
	c.JSON(http.StatusInternalServerError, gin.H{
		"status":  "error",
		"message": err.Error(),
	})
}

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
			errorRes(c, err)
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status":     "ok",
			"attendance": attendance,
		})
	})

	api.POST("/attendance", func(c *gin.Context) {
		var data []db.UpdateData
		if err := c.ShouldBindJSON(&data); err != nil {
			errorRes(c, err)
			return
		}

		fmt.Println(data)

		if err := db.Update(data); err != nil {
			errorRes(c, err)
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	api.GET("/verify", func(c *gin.Context) {
		if err := db.VerifyToken(c.Query("token")); err != nil {
			errorRes(c, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})
}
