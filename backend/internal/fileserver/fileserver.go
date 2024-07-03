package fileserver

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

func proxy(c *gin.Context) {
	remote, err := url.Parse("http://localhost:3001")
	if err != nil {
		panic(err)
	}

	proxy := httputil.NewSingleHostReverseProxy(remote)

	proxy.ServeHTTP(c.Writer, c.Request)
}

func Route(r *gin.Engine, static http.FileSystem, mode string, middleware gin.HandlerFunc) {
	// https://stackoverflow.com/questions/36357791/
	if mode == gin.DebugMode {
		r.Use(middleware, proxy)
	} else {
		r.NoRoute(middleware, gin.WrapH(http.FileServer(static)))
	}
}
