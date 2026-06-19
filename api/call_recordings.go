package api

import (
    "net/http"
    "encoding/json"
    "github.com/gorilla/mux"
    "github.com/dgrijalva/jwt-go"
)

// CallRecording represents call recording data
type CallRecording struct {
    ID   string `json:"id"`
    URL  string `json:"url"`
}

// FundingInfo represents funding-related data
type FundingInfo struct {
    RecordingID string  `json:"recording_id"`
    Amount      float64 `json:"amount"`
    Source      string  `json:"source"`
}

// Authentication middleware
func AuthenticationMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        tokenString := r.Header.Get("Authorization")
        if tokenString == "" {
            http.Error(w, "Forbidden", http.StatusForbidden)
            return
        }
        // Validate token (simplified for demo purposes)
        _, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            // Check token signing method etc. (not implemented here)
            return []byte("your-secret-key"), nil
        })
        if err != nil {
            http.Error(w, "Forbidden", http.StatusForbidden)
            return
        }
        next.ServeHTTP(w, r)
    })
}

// Fetch call recordings and funding information
func FetchCallRecordings(w http.ResponseWriter, r *http.Request) {
    // Simulated response from an external API
    callRecordings := []CallRecording{
        {ID: "1", URL: "http://example.com/call1"},
        {ID: "2", URL: "http://example.com/call2"},
    }

    fundingInfos := []FundingInfo{
        {RecordingID: "1", Amount: 1000.00, Source: "Source A"},
        {RecordingID: "2", Amount: 2000.00, Source: "Source B"},
    }

    response := map[string]interface{}{
        "call_recordings": callRecordings,
        "funding_info":    fundingInfos,
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}

// Setup routes
func SetupRoutes() {
    r := mux.NewRouter()
    r.Use(AuthenticationMiddleware)
    r.HandleFunc("/api/call_recordings", FetchCallRecordings).Methods("GET")
    http.ListenAndServe(":8080", r)
}