package staticfs

import (
	"embed"
	"io/fs"
	"net/http"
	"path"
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

func NewStatic(embedFS embed.FS, root string) http.FileSystem {
	return http.FS(myFS{
		fs:   embedFS,
		root: root,
	})
}
