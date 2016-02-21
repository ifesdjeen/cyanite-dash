(ns cyanite-dash.core
  (:require [io.cyanite :as cyanite]
            [cyanite-dash.proxy :as proxy]
            [compojure.core :refer [GET defroutes]]
            [io.cyanite.api :as api]
            [compojure.route :as route]
            [ring.adapter.jetty :as jetty]
            [com.stuartsierra.component :as component]
            [clojure.java.io :as io]))

(defroutes app
  (route/resources "/" )
  (route/not-found "<h1>Page not found</h1>"))

(defrecord WebApp []
  component/Lifecycle
  (start [this]
    (assoc this :jetty (jetty/run-jetty
                        (-> #'app
                            (proxy/wrap-proxy "/render" "http://localhost:8080/")
                            (proxy/wrap-proxy "/metrics" "http://localhost:8080/metrics")
                            (proxy/wrap-proxy "/paths" "http://localhost:8080/paths")
                            (proxy/wrap-proxy "/ping" "http://localhost:8080/ping")

                            )
                        {:host "0.0.0.0" :port 8484})))
  (stop [this]))

(defn -main
  [& args]
  (let [[{:keys [path help quiet]} args banner] (cyanite/get-cli args)
        system (assoc (cyanite/config->system path quiet)
                      :webapp (map->WebApp {}))]
    (component/start-system system))
  nil)
