package main

import (
	"embed"
	_ "embed"
	"fmt"
	"io/fs"
	"net/http"
	"path"

	"github.com/gin-gonic/gin"
)

// https://github.com/golang/go/issues/43431#issuecomment-752662261
// myFS implements fs.FS
type myFS struct {
	fs   embed.FS
	root string
}

func (c myFS) Open(name string) (fs.File, error) {
	return c.fs.Open(path.Join(c.root, name))
}

// go embed ignore files begin with '_' or '.', 'all:' tells go embed to embed all files

//go:embed all:static/*
var rawStatic embed.FS

var static = myFS{
	fs:   rawStatic,
	root: "static",
}

func run() error {
	r := gin.Default()

	// https://stackoverflow.com/questions/36357791/
	r.NoRoute(gin.WrapH(http.FileServer(http.FS(static))))

	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	// r.StaticFS("/", http.FS(static))
	return r.Run("0.0.0.0:3001")
}

func main() {
	if err := run(); err != nil {
		fmt.Printf("Oops, there's an error: %v\n", err)
	}
}
