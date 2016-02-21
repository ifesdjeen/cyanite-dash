import React from 'react';
import ReactDOM from 'react-dom';
import Metrics from './metrics';
import Graph from './Graph';

ReactDOM.render(
  <div id='container'>
    <Graph metrics={["internal.cyanite.jvm.memory.heap.used", "internal.cyanite.jvm.memory.heap.committed", "internal.cyanite.jvm.memory.total.used"]}
      from="-5min"
      until="now"
      maxDataPoints="956"
    />
  </div>,
                document.getElementById('example'));
