/*eslint-disable react/no-multi-comp*/

import React from 'react';
import ReactDOM from 'react-dom';
import cubism from 'cubism';

ReactDOM.render(<div id='example1'></div>,
                document.getElementById('example')
);


var context = cubism.context()
      .serverDelay(0)
      .clientDelay(0)
      .step(1000)
      .size(1920);

function makeMetric(name) {
  var firstLoad = true;
  return context.metric((start, stop, step, callback) => {
    d3.json("/micromonitor/", (response) => {

      var vals = response[name].vec
            .filter((a) => {
              var ts = a.ts * 1000;
              return ts >= start.getTime() && ts <= stop.getTime();
            })
            .map((a) => a.value);
      callback(null, vals);
    });
  }, name);
}



d3.select("#example1").call(function(div) {

  div.append("div")
    .attr("class", "axis")
    .call(context.axis().orient("top"));

  div.selectAll(".horizon")
    .data([makeMetric("cpu.idle"),
           makeMetric("cpu.user"),
           makeMetric("cpu.sys"),
           makeMetric("cpu.wait"),
           makeMetric("cpu.stolen"),
           makeMetric("cpu.total")
          ])
    .enter().append("div")
    .attr("class", "horizon")
    .call(context.horizon().extent([0, 5]).height(100));

  div.append("div")
    .attr("class", "rule")
    .call(context.rule());

});
