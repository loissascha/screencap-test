package main

import (
	//"encoding/json"
	"log"
	"net/http"
)
import webview "github.com/webview/webview_go"

func main() {
	// Start the HTTP server in a separate goroutine
	go func() {
		// Serve static files
		fs := http.FileServer(http.Dir("./public"))
		http.Handle("/", fs)

		// API endpoint
		http.HandleFunc("/api/echo", func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("Hello, World!"))
		})

		corsMux := enableCORS(http.DefaultServeMux)

		log.Println("Server started on :8081")
		http.ListenAndServe(":8081", corsMux)
	}()

	// Create the Webview window
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("My Desktop App")
	w.SetSize(800, 600, webview.HintNone)
	w.Navigate("http://localhost:8081")
	w.Run()
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
