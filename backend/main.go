package main

import (
	"backend/api"
	"backend/internal/db"
	"backend/internal/fileserver"
	"backend/internal/staticfs"
	"backend/pkg/websocket"
	"embed"
	"fmt"
	"log"
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

var logger = log.New(log.Writer(), "[main] ", log.LstdFlags|log.Lmsgprefix|log.Lshortfile)

func run(addr string, dbPath string, token string) error {
	err := db.OpenDB(dbPath)
	if err != nil {
		return err
	}
	logger.Printf("Database connected")

	err = db.InitDB("https://coscup.org/2023/json/session.json", token)
	if err != nil {
		return err
	}

	gin.SetMode(Mode)
	r := gin.Default()
	r.Use(gin.Recovery())

	io := websocket.Route(r, nil)
	api.Route(r, io)
	fileserver.Route(r, static, Mode)

	logger.Printf("Listening at %s\n", addr)
	return r.Run(addr)
}

func main() {
	token := os.Getenv("TOKEN")

	host := pflag.StringP("host", "", "0.0.0.0", "server host")
	port := pflag.IntP("port", "p", 3000, "server port")
	version := pflag.BoolP("version", "v", false, "show version")
	dbPath := pflag.StringP("db", "d", "./data.db", "database path")
	help := pflag.BoolP("help", "h", false, "show help")
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

	if err := run(addr, *dbPath, token); err != nil {
		logger.Printf("Oops, there's an error: %v\n", err)
		os.Exit(1)
	}
}
