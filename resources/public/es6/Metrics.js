/*eslint-disable react/no-multi-comp*/

import React from 'react';
import d3 from 'd3';

const Metrics = React.createClass({
  getInitialState: function() {
    return {
      metrics: []
    };
  },

  componentDidMount: function() {
    this.serverRequest = d3.json("/metrics", function (result) {
      this.setState({
        metrics: result
      });
    }.bind(this));
  },

  componentWillUnmount: function() {
    this.serverRequest.abort();
  },

  render: function() {
    return (
        <div>
        {this.state.metrics}
        </div>
    );
  }
});

export default Metrics;
