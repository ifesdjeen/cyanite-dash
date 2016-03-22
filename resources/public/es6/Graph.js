import React from 'react';
import d3 from 'd3';
import cubism from 'cubism';

// Graphite understands seconds since UNIX epoch.
function cubism_graphiteFormatDate(time) {
  return Math.floor(time / 1000);
}

function random(context, name) {
  var value = 0,
      values = [],
      i = 0,
      last;
  return context.metric(function(start, stop, step, callback) {
    start = +start, stop = +stop;
    if (isNaN(last)) last = start;
    while (last < stop) {
      last += step;
      value = Math.max(-10, Math.min(10, value + .8 * Math.random() - .4 + .2 * Math.cos(i += .2)));
      values.push(value);
    }
    values = values.slice((start - stop) / step)
      //console.log(values)
    callback(null, values);
  }, name);
}

cubism.metric.prototype.extent = function() {
  var i = 0,
      n = this.context.size(),
      value,
      min = Infinity,
      max = -Infinity;
  while (++i < n) {
    value = this.valueAt(i);
    if (value < min) min = value;
    if (value > max) max = value;
  }
  if (window.location.hash == "#wtf") {
    return [0, max * 5];
  } else {
    return [0, max];
  }
};

cubism.context.prototype.graphite_json = function(host) {
  if (!arguments.length) host = "";
  var source = {},
      context = this;

  source.metric = function(expression) {
    var start_ = null,
        firstLoad = true;

    var metric = context.metric(function(start, stop, step, callback) {
      var target = expression;
      d3.json(host + "/render?format=json"
          + "&target=" + encodeURIComponent(target)
          + "&from=" + (start_ || "-24min")
          , function(text) {
            if (!text) {
              return callback(new Error("unable to load data"));
            } else {
              var s = text[0].datapoints;
              if (s.length > 7) {
                start_ = s[s.length - 7][1]; // - (7 * (step / 1000)); // 7 periods ?
              }
              var dp = s.map((a) => a[0]);

              var diff;
              if (firstLoad) {
                diff = 1440;
                firstLoad = false;
              } else {
                diff = Math.round((stop - start) / step);
              }
              var dpl = s.length;
              for (var i = 0; i < diff - dpl; i++) {
                dp.unshift(NaN);
              }
              callback(null, dp);
            }

      });
    }, expression += "");

    metric.summarize = function(_) {
      return metric;
    };

    return metric;
  };

  return source;
};



const Graph = React.createClass({
  getInitialState: function() {
    return {
      data: []
    };
  },

  componentWillUpdate: function () {
    d3.selectAll(".horizon")
      .call(this.horizon.remove)
      .remove();

    this.props.metrics.map((metric) => {
      d3.select("body")
        .selectAll(metric)
        .data([this.graphite.metric(metric)])
        .enter()
        .insert("div", ".bottom")
        .attr("id",  metric)
        .attr("class", "horizon")
        .on("click", function (a) { this.props.onDelete(metric) }.bind(this))
        .call(this.horizon);
    });

  },

  componentDidMount: function() {
    this.context = cubism.context()
      /* .serverDelay(5000)
         .clientDelay(100) */
                         .step(5e3)
                         .size(1440);
    var context = this.context;

    this.graphite = this.context.graphite_json("http://localhost:8484"),
    this.comparison = this.context.comparison();

    d3.select("body")
      .selectAll(".axis")
      .data(["top", "bottom"])
      .enter()
      .append("div")
      .attr("class", function(d) { return d + " axis"; })
      .each(function (d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });

    d3.select("body").append("div")
      .attr("class", "rule")
      .call(this.context.rule());

    this.horizon = this.context
                       .horizon()
                       .height(50);


    context.on("focus", function(i) {
      d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
    });

  },

  render: function() {
    return (
      <div className='metrics'>
      </div>
    );
  }
});

export default Graph;
