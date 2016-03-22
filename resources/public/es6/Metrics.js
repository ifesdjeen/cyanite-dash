/*eslint-disable react/no-multi-comp*/

import Autocomplete from 'react-autocomplete'
import React from 'react';
import d3 from 'd3';
import Graph from './Graph';

const Metrics = React.createClass({
  getInitialState: function() {
    var state = localStorage.getItem("graphState");
    if (state === null) {
      return {
        autocompletePaths: [],
        selected: "",
        metrics: []
      };
    } else {
      return JSON.parse(state);
    }
  },

  syncState: function () {
    localStorage.setItem("graphState", JSON.stringify(this.state));
  },

  componentDidMount: function() {
    d3.json("/paths", (result) => {
      this.setState({
        autocompletePaths: result.map((i) => i.path)
      });
    });
  },

  componentWillUnmount: function() {
  },

  removeMetric: function(metric) {
    this.setState(function (st) {
      var selected = this.state.selected;
      st.metrics = st.metrics.filter((i) => i !== metric);
      return st;
    },
    this.syncState);
  },
  addMetric: function() {
    this.setState(function (st) {
      var selected = this.state.selected;

      if (selected !== "") {
        if (!st.metrics.some((i) => i === selected)) {
          st.metrics.push(selected);
        }
      }

      return st;
    },
    this.syncState);
  },

  render: function() {
    return (
      <div className="autocomplete">
        <Autocomplete
          ref="autocomplete"
          items={this.state.autocompletePaths}
          getItemValue={(item) => item}
          onSelect={(value, item) => {
              this.setState({selected: item}, this.syncState);
            }}
          onChange={(event, value) => {
              var query = "/paths";
              if (value !== "") {
                query += "?query=" + value + "*";
              }
              d3.json(query, (result) => {
                this.setState({
                  autocompletePaths: result.map((i) => i.path)
                }, this.syncState);
              });
            }}

          renderItem={(item, isHighlighted) => {
              return (
                <div
                  className = { isHighlighted ? "highlighted-item" : "item" }
                  key = {item}
                  id = {item}
                       >{item}</div>
              );

            }}>
        </Autocomplete>
        <a className="add-button" href="#" onClick={this.addMetric}>Add</a>
        <Graph
          metrics={this.state.metrics}
          onDelete={this.removeMetric}></Graph>
      </div>)

  }
});

export default Metrics;
