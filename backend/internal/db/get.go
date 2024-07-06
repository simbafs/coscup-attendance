package db

import "fmt"

type AttendanceData map[string]int

func GetAttendanceData() (AttendanceData, error) {
	rows, err := DB.Query("SELECT * FROM attendance")
	if err != nil {
		return nil, fmt.Errorf("query attendance: %w", err)
	}
	defer rows.Close()

	data := make(AttendanceData)
	for rows.Next() {
		var id string
		var attendance int
		if err := rows.Scan(&id, &attendance); err != nil {
			return nil, fmt.Errorf("scan attendance: %w", err)
		}
		data[id] = attendance
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return data, nil
}

func GetSessionJSON() ([]byte, error) {
	var data []byte
	err := DB.QueryRow(`SELECT text FROM data WHERE name = 'session.json';`).Scan(&data)
	if err != nil {
		return nil, fmt.Errorf("query session: %w", err)
	}
	return data, nil
}
