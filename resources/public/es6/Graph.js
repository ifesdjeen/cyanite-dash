import React from 'react';
import d3 from 'd3';
import cubism from 'cubism';

// Graphite understands seconds since UNIX epoch.
function cubism_graphiteFormatDate(time) {
  return Math.floor(time / 1000);
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
    var sum = "sum";
    var firstRun = true;
    var start_ = null;

    var metric = context.metric(function(start, stop, step, callback) {
      var target = expression;

      // Apply the summarize, if necessary.
      /* if (step !== 1e4) target = "summarize(" + target + ",'"
         + (!(step % 36e5) ? step / 36e5 + "hour" : !(step % 6e4) ? step / 6e4 + "min" : step / 1e3 + "sec")
         + "','" + sum + "')"; */

      d3.json(host + "/render?format=json"
          + "&target=" + encodeURIComponent(target)
          + "&from=" + (start_ || "-24min") //|| cubism_graphiteFormatDate(start)  //"-24min" // off-by-two?
          , function(text) {
            if (!text) {
              return callback(new Error("unable to load data"));
            } else {
              var s = text[0].datapoints;

              var dp = s.map((a) => a[0]);

              var res = [];
              if (firstRun) {
                for (var i = 0; i < 1440 - dp.length; i++) {
                  res.push(0);
                }
                firstRun = false;
              }

              //console.log(dp.length)
              if (dp.length > 0) {
                start_ = s[s.length - 1][1] + 1;
              }
              var downstream = res.concat(dp);
              console.log(downstream);
              callback(null, downstream);
            }

      });
    }, expression += "");

    metric.summarize = function(_) {
      sum = _;
      return metric;
    };

    return metric;
  };

  source.find = function(pattern, callback) {
    d3.json(host + "/metrics/find?format=completer"
        + "&query=" + encodeURIComponent(pattern), function(result) {
      if (!result) return callback(new Error("unable to find metrics"));
      callback(null, result.metrics.map(function(d) { return d.path; }));
    });
  };

  // Returns the graphite host.
  source.toString = function() {
    return host;
  };

  return source;
};



const Graph = React.createClass({
  getInitialState: function() {
    return {
      data: []
    };
  },

  componentDidMount: function() {
    var context = cubism.context().step(10000).serverDelay(5000).size(1440), // a default context
        graphite = context.graphite_json("http://localhost:8484"),
        comparison = context.comparison()

    d3.select("body")
      .selectAll(".axis")
      .data(["top", "bottom"])
      .enter()
      .append("div")
      .attr("class", function(d) { return d + " axis"; })
      .each(function(d) { d3.select(this).call(context.axis().ticks(12).orient(d)); });

    d3.select("body").append("div")
      .attr("class", "rule")
      .call(context.rule());

    var horizon = context.horizon()
                         .height(50);

    this.props.metrics.map((metric) => {
      d3.select("body").selectAll(metric)
        .data([graphite.metric(metric)])
        .enter()
        .insert("div", ".bottom")
        .attr("class", "horizon")
        .attr("id",  metric)
        .call(horizon);
    });
    /*
       d3.select("body").selectAll(".comparison")
       .data([["internal.cyanite.jvm.memory.total.used",
       "internal.cyanite.jvm.memory.heap.used"].map(graphite.metric)])
       .enter()
       .insert("div", ".bottom")
       .attr("class", "horizon")
       .call(comparison);
     */

    context.on("focus", function(i) {
      d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
    });

//      .data(graphite.metric("internal.cyanite.jvm.memory.heap.used"))
//      .call(context.horizon());

  },

  render: function() {
    return (
      <div className='h'>
      </div>
    );
  }
});

export default Graph;
