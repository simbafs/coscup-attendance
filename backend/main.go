package main

import (
	"backend/api"
	"backend/internal/cors"
	"backend/internal/db"
	"backend/internal/fileserver"
	"backend/internal/logger"
	"backend/internal/staticfs"
	"backend/internal/websocket"
	mw "backend/middlewares"
	"backend/middlewares/auth"
	"embed"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/spf13/pflag"
)

// go embed ignore files begin with '_' or '.', 'all:' tells go embed to embed all files

//go:embed all:static/*
var rawStatic embed.FS

var static = staticfs.NewStatic(rawStatic, "static")

var (
	Mode       = "debug"
	Version    = "dev"
	CommitHash = "n/a"
	BuildTime  = "n/a"
)

var log = logger.New("main")

func run(addr string, dbPath string, token string, session string, update bool) error {
	if err := db.OpenDB(dbPath); err != nil {
		return err
	}
	log.Printf("Database connected")
	defer db.DB.Close()

	if err := db.InitDB(session, update); err != nil {
		return err
	}

	if update {
		log.Printf("session.json updated")
		return nil
	}

	tokenF := auth.Token(token)
	c := cors.Cors(Mode)

	gin.SetMode(Mode)
	r := gin.Default()
	r.Use(gin.Recovery())

	io := websocket.Route(r, nil)
	api.Route(r.Group("/api").Use(c), io, auth.Auth(auth.Fail401, tokenF))

	r.GET("/session.json", func(c *gin.Context) {
		session, err := db.GetSessionJSON()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"status":  "error",
				"message": err.Error(),
			})
			return
		}
		c.Data(http.StatusOK, "application/json", session)
	})

	fileserver.Route(r, static, Mode, mw.Only(auth.Auth(auth.FailLogin, tokenF), "/"))

	log.Printf("Listening at %s\n", addr)
	return r.Run(addr)
}

func main() {
	token := os.Getenv("TOKEN")

	host := pflag.StringP("host", "", "0.0.0.0", "server host")
	port := pflag.IntP("port", "p", 3000, "server port")
	version := pflag.BoolP("version", "v", false, "show version")
	dbPath := pflag.StringP("db", "d", "./data/data.db", "database path")
	help := pflag.BoolP("help", "h", false, "show help")
	session := pflag.StringP("session", "", "https://coscup.org/2024/json/session.json", "session.json url")
	update := pflag.BoolP("update", "u", false, "update session.json")
	pflag.StringVarP(&Mode, "mode", "m", Mode, "server mode")
	pflag.StringVarP(&token, "token", "t", token, "token(ENV: TOKEN)")

	pflag.Parse()

	if *version {
		fmt.Printf("Version: %s\nCommitHash: %s\nBuildTime: %s\n", Version, CommitHash, BuildTime)
		return
	}

	if *help {
		pflag.Usage()
		return
	}

	addr := fmt.Sprintf("%s:%d", *host, *port)

	if err := run(addr, *dbPath, token, *session, *update); err != nil {
		log.Printf("Oops, there's an error: %v\n", err)
		os.Exit(1)
	}
}
