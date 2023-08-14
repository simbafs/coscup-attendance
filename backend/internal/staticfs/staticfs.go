package staticfs

import (
	"embed"
	"io/fs"
	"net/http"
)

// https://github.com/golang/go/issues/43431#issuecomment-752662261

func NewStatic(embedFS embed.FS, root string) http.FileSystem {
	newFS, err := fs.Sub(embedFS, root)
	if err != nil {
		panic(err)
	}
	return http.FS(newFS)
}
