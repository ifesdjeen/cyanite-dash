import React from 'react';
import d3 from 'd3';
import MG from 'metrics-graphics';

const Graph = React.createClass({
  getInitialState: function() {
    return {
      data: []
    };
  },

  componentDidMount: function() {
    this.tick(this);
  },

  tick: function() {
    var targets = this.props.metrics.map((m) => `target=${m}`).join("&");

    this.serverRequest = d3.json(`/render?${targets}&from=${this.props.from}&until=${this.props.until}&format=json&maxDataPoints=956`, (result) => {
      this.setState({data: result});
    });
    setTimeout(this.tick, 1000);
  },

  componentDidUpdate: function() {
    console.log("updating")
    var data = this.state.data.map((ds) => {
      return ds.datapoints.map((a) => {
        return { y: a[0],
                 x: new Date(a[1] * 1000) };
      });
    });

    MG.data_graphic({
      title: this.props.metric,
      description: ".",
      width: 800,
      height: 300,
      right: 40,
      data: data,
      area: false,
      show_tooltips: false,
      target: '#asd',
      x_accessor: 'x',
      y_accessor: 'y'
    });

  },

  componentWillUnmount: function() {
    this.serverRequest.abort();
  },

  render: function() {
    return (
      <div className='graph_container'>
        <div id='asd'>

        </div>
      </div>
    );
  }
});

export default Graph;
