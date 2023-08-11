package data

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

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

func getRawData(url string) (data RawData, err error) {
	res, err := http.Get(url)
	if err != nil {
		return
	}
	defer res.Body.Close()

	err = json.NewDecoder(res.Body).Decode(&data)
	return
}

func InitDB(url string) error {
	_, err := DB.Exec(`
	    CREATE TABLE IF NOT EXISTS attendance(
            id         VARCHAR(8) NOT NULL PRIMARY KEY
            ,day        INTEGER  NOT NULL 
            ,room       VARCHAR(3) NOT NULL
            ,attendance INTEGER  NOT NULL
        );
        CREATE TABLE IF NOT EXISTS updates(
           time       INTEGER  NOT NULL PRIMARY KEY 
          ,day        INTEGER  NOT NULL
          ,room       VARCHAR(3) NOT NULL
          ,id         VARCHAR(6) NOT NULL
          ,attendance INTEGER  NOT NULL
        );
    `)
	if err != nil {
		return err
	}

	data, err := getRawData(url)
	if err != nil {
		return err
	}

	stmt, err := DB.Prepare(`INSERT OR IGNORE INTO attendance values(?,?,?,?)`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	for _, session := range data.Sessions {
		fmt.Printf("%s\n", session.ID)
		_, err := stmt.Exec(session.Start.Day(), session.Room, session.ID, 0)
		if err != nil {
			return err
		}
	}

	return nil
}
