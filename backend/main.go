package main

import (
	"backend/api"
	"backend/internal/db"
	"backend/internal/fileserver"
	"backend/internal/staticfs"
	"embed"
	"fmt"

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

func run(addr string) error {
	gin.SetMode(Mode)
	r := gin.Default()

	api.Route(r)
	fileserver.Route(r, static, Mode)

	return r.Run(addr)
}

func init() {
	err := db.OpenDB()
	if err != nil {
		panic(err)
	}
	fmt.Printf("Database connected: %v\n", db.DB)

	err = db.InitDB("https://coscup.org/2023/json/session.json")
	if err != nil {
		panic(err)
	}
}

func main() {
	addr := pflag.StringP("addr", "a", ":3000", "server address")
	version := pflag.BoolP("version", "v", false, "show version")
	pflag.StringVarP(&Mode, "mode", "m", Mode, "server mode")
	pflag.Parse()

	if *version {
		fmt.Printf("Version: %s\nCommitHash: %s\nBuildTime: %s\n", Version, CommitHash, BuildTime)
		return
	}

	fmt.Printf("Server is running at %s\n", *addr)
	if err := run(*addr); err != nil {
		fmt.Printf("Oops, there's an error: %v\n", err)
	}
}
