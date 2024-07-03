package db

import (
	"backend/internal/logger"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

var log = logger.New("db")

type RawData struct {
	Sessions []struct {
		ID       string    `json:"id"`
		Type     string    `json:"type"`
		Room     string    `json:"room"`
		Start    time.Time `json:"start"`
		End      time.Time `json:"end"`
		Language string    `json:"language"`
		Zh       struct {
			Title       string `json:"title"`
			Description string `json:"description"`
		} `json:"zh"`
		En struct {
			Title       string `json:"title"`
			Description string `json:"description"`
		} `json:"en"`
		Speakers []string    `json:"speakers"`
		Tags     []string    `json:"tags"`
		CoWrite  string      `json:"co_write"`
		Qa       interface{} `json:"qa"`
		Slide    interface{} `json:"slide"`
		Record   interface{} `json:"record"`
		URI      string      `json:"uri"`
	} `json:"sessions"`
	Speakers []struct {
		ID     string `json:"id"`
		Avatar string `json:"avatar"`
		Zh     struct {
			Name string `json:"name"`
			Bio  string `json:"bio"`
		} `json:"zh"`
		En struct {
			Name string `json:"name"`
			Bio  string `json:"bio"`
		} `json:"en"`
	} `json:"speakers"`
	SessionTypes []struct {
		ID string `json:"id"`
		Zh struct {
			Name string `json:"name"`
		} `json:"zh"`
		En struct {
			Name string `json:"name"`
		} `json:"en"`
	} `json:"session_types"`
	Rooms []struct {
		ID string `json:"id"`
		Zh struct {
			Name string `json:"name"`
		} `json:"zh"`
		En struct {
			Name string `json:"name"`
		} `json:"en"`
	} `json:"rooms"`
	Tags []struct {
		ID string `json:"id"`
		Zh struct {
			Name string `json:"name"`
		} `json:"zh"`
		En struct {
			Name string `json:"name"`
		} `json:"en"`
	} `json:"tags"`
}

// getRawData download session.json if not exist in ../frontend/public/session.json and parse it
func getRawData(url string) (*RawData, error) {
	var rawData RawData
	localFile := "../frontend/public/session.json"
	if _, err := os.Stat(localFile); err == nil {
		// file exist
		log.Printf("load session from %s\n", localFile)

		file, err := os.Open(localFile)
		if err != nil {
			return nil, fmt.Errorf("os.Open: %w", err)
		}
		defer file.Close()

		err = json.NewDecoder(file).Decode(&rawData)
		return &rawData, err
	}

	log.Printf("download session from %s\n", url)

	// file not exist
	res, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("http.Get: %w", err)
	}

	resp, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("io.ReadAll: %w", err)
	}

	err = json.Unmarshal(resp, &rawData)
	if err != nil {
		return nil, fmt.Errorf("json.Unmarshal: %w", err)
	}

	err = os.WriteFile(localFile, resp, 0644)
	if err != nil {
		return nil, fmt.Errorf("os.WriteFile: %w", err)
	}

	return &rawData, nil
}

func InitDB(url string) error {
	_, err := DB.Exec(`
	    CREATE TABLE IF NOT EXISTS attendance(
			id         VARCHAR(8) NOT NULL PRIMARY KEY
			,attendance INTEGER  NOT NULL
        );
        CREATE TABLE IF NOT EXISTS updates(
			time       DATETIME NOT NULL PRIMARY KEY 
			,id         VARCHAR(6) NOT NULL
			,attendance INTEGER  NOT NULL
        );
    `)
	if err != nil {
		return fmt.Errorf("crreate table db.Exec: %w", err)
	}
	log.Println("create table")

	data, err := getRawData(url)
	if err != nil {
		return fmt.Errorf("getRawData: %w", err)
	}
	log.Printf("get raw data")

	stmt, err := DB.Prepare(`INSERT OR IGNORE INTO attendance (id, attendance) VALUES (?, ?);`)
	if err != nil {
		return fmt.Errorf("attendance db.Prepare: %w", err)
	}
	defer stmt.Close()

	for _, session := range data.Sessions {
		_, err = stmt.Exec(session.ID, 0)
		if err != nil {
			return err
		}
	}

	log.Println("prepare attendance")

	return nil
}
