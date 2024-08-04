package api

import (
	"backend/internal/db"
	"backend/internal/websocket"
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

var logger = log.New(log.Writer(), "[api] ", log.LstdFlags|log.Lmsgprefix|log.Lshortfile)

func errorRes(c *gin.Context, err error) {
	logger.Printf("%s: %v", c.FullPath(), err)
	c.JSON(http.StatusInternalServerError, gin.H{
		"status":  "error",
		"message": err.Error(),
	})
}

func Route(api gin.IRoutes, io websocket.IO, auth gin.HandlerFunc) {
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

	api.POST("/attendance", auth, func(c *gin.Context) {
		var data []db.UpdateData
		if err := c.ShouldBindJSON(&data); err != nil {
			errorRes(c, err)
			return
		}

		if err := db.Update(data); err != nil {
			errorRes(c, err)
			return
		}

		dataJSON, err := json.Marshal(data)
		if err != nil {
			errorRes(c, err)
			return
		}

		io.Broadcast(dataJSON)

		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	api.GET("/verify", auth, func(c *gin.Context) {
		// if err := db.VerifyToken(c.Query("token")); err != nil {
		// 	errorRes(c, err)
		// 	return
		// }
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	api.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	api.GET("export.csv", func(c *gin.Context) {
		c.Header("Content-Disposition", "attachment; filename=export.csv")
		c.Header("Content-Type", "text/csv")
		err := db.Export(c.Writer)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"status":  "error",
				"message": err.Error(),
			})
		}
	})

	// api.GET("/broadcast", func(c *gin.Context) {
	// 	io.Broadcast([]byte("Hello, world!"))
	// 	c.JSON(http.StatusOK, gin.H{
	// 		"status":  "ok",
	// 		"message": "Broadcasted!",
	// 	})
	// })
}
