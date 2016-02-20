(ns cyanite-dash.core
  (:require [io.cyanite :as cyanite]
            [compojure.core :refer [GET defroutes]]
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
    (assoc this :jetty (jetty/run-jetty #'app {:host "0.0.0.0" :port 8484})))
  (stop [this]))

(defn -main
  [& args]
  (let [[{:keys [path help quiet]} args banner] (cyanite/get-cli args)
        system (assoc (cyanite/config->system path quiet)
                      :webapp (map->WebApp {}))]
    (component/start-system system))
  nil)
