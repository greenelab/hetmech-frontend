import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { GraphDefs } from './defs.js';
import { GraphEdgeLineHighlights } from './edge-line-highlights.js';
import { GraphNodeCircleHighlights } from './node-circle-highlights.js';
import { GraphEdgeLines } from './edge-lines.js';
import { GraphEdgeLabels } from './edge-labels.js';
import { GraphNodeCircles } from './node-circles.js';
import { GraphNodeLabels } from './node-labels.js';

import { createSimulation } from './simulation.js';
import { updateSimulation } from './simulation.js';
import { pinSourceAndTargetNodes } from './simulation.js';
import { createViewHandler } from './view.js';
import { createNodeDragHandler } from './node-drag.js';
import { resetView } from './view.js';
import { fitView } from './view.js';
import { downloadSvg } from '../util/file.js';

import './graph.css';

// graph component
export class Graph extends Component {
  // initialize component
  constructor() {
    super();

    this.state = {};
  }
  // when component mounts
  componentDidMount() {
    this.createGraph();
  }

  // when component updates
  componentDidUpdate(prevProps) {
    updateSimulation(
      this.state.simulation,
      this.props.graph,
      this.props.graph.nodes.length !== prevProps.graph.nodes.length
    );
    pinSourceAndTargetNodes(this.props.graph);
  }

  // initialize graph. create simulation and event handlers
  createGraph = () => {
    const simulation = createSimulation();
    const viewHandler = createViewHandler();
    const nodeDragHandler = createNodeDragHandler(simulation);
    // store the above objects to be referenced on graph updates
    this.setState(
      {
        simulation: simulation,
        viewHandler: viewHandler,
        nodeDragHandler: nodeDragHandler
      },
      this.resetView
    );
  };

  // reset view
  resetView = () => {
    resetView(this.state.viewHandler);
  };

  // fit view
  fitView = () => {
    fitView(this.state.viewHandler);
  };

  // download graph
  downloadGraph = () => {
    const svg = document.getElementById('graph');
    downloadSvg(svg);
  };

  // display component
  render() {
    // calculate x position of graph container
    let left = 0;
    if (this.props.sectionWidth && this.props.width) {
      left = this.props.sectionWidth / 2 - this.props.width / 2;
      const minLeft =
        this.props.sectionWidth / 2 - document.body.clientWidth / 2 + 20;
      if (left < minLeft)
        left = minLeft;
    }

    return (
      <div id='graph_container' style={{ height: this.props.height }}>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          id='graph'
          width={this.props.width}
          height={this.props.height}
          style={{ left: left }}
        >
          <GraphDefs />
          <g id='graph_view'>
            <g id='graph_edge_line_highlight_layer'>
              <GraphEdgeLineHighlights />
            </g>
            <g id='graph_node_circle_highlight_layer'>
              <GraphNodeCircleHighlights />
            </g>
            <g id='graph_edge_line_layer'>
              <GraphEdgeLines />
            </g>
            <g id='graph_edge_label_layer'>
              <GraphEdgeLabels />
            </g>
            <g id='graph_node_circle_layer'>
              <GraphNodeCircles nodeDragHandler={this.state.nodeDragHandler} />
            </g>
            <g id='graph_node_label_layer'>
              <GraphNodeLabels />
            </g>
          </g>
        </svg>
      </div>
    );
  }
}
// connect component to global state
Graph = connect(
  (state) => ({
    paths: state.paths,
    graph: state.graph
  }),
  null,
  null,
  { forwardRef: true }
)(Graph);