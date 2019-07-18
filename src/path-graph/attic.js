import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faMapMarker } from '@fortawesome/free-solid-svg-icons';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { faCompressArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

import { IconButton } from '../components/buttons.js';
import { NumberBox } from '../components/number-box.js';

import { minWidth, minHeight, maxWidth, maxHeight } from './constants.js';

// graph attic component
// contains buttons and info above table
export class GraphAttic extends Component {
  // display component
  render() {
    const nodeCount = this.props.graph.nodes.length;
    const edgeCount = this.props.graph.edges.length;

    return (
      <>
        <div className='table_attic'>
          <IconButton
            text='reset'
            icon={faPowerOff}
            // onClick={() => {
            //   if (this.graph.current)
            //     this.graph.current.restartGraph();
            // }}
            tooltipText='Completely restart graph'
          />
          <IconButton
            text='unpin'
            icon={faMapMarkerAlt}
            // onClick={() => {
            //   if (this.graph.current)
            //     this.graph.current.unpinAll();
            // }}
            tooltipText='Unpin all nodes'
          />
          <IconButton
            text='pin'
            icon={faMapMarker}
            // onClick={() => {
            //   if (this.graph.current)
            //     this.graph.current.pinAll();
            // }}
            tooltipText='Pin all nodes in their current position'
          />
          <IconButton
            text='fit'
            icon={faExpand}
            onClick={() => {
              if (this.props.graphRef.current)
                this.props.graphRef.current.fitView();
            }}
            tooltipText='Fit the view to the contents of the graph'
          />
          <IconButton
            text='.svg'
            icon={faDownload}
            onClick={() => {
              if (this.props.graphRef.current)
                this.props.graphRef.current.downloadGraph();
            }}
            tooltipText='Download the graph as an .svg file'
          />
          <NumberBox
            tooltipText='Width of the container'
            min={minWidth}
            step='5'
            max={maxWidth}
            value={this.props.width}
            onArrows={this.props.setWidth}
            onSubmit={this.props.setWidth}
          />
          &nbsp;&times;&nbsp;
          <NumberBox
            tooltipText='Height of the container'
            min={minHeight}
            step='5'
            max={maxHeight}
            value={this.props.height}
            onArrows={this.props.setHeight}
            onSubmit={this.props.setHeight}
          />
          <IconButton
            className='graph_expand_collapse_button'
            text=''
            icon={faCompressArrowsAlt}
            onClick={() => {
              this.props.collapseContainer();
              if (this.props.graphRef.current)
                this.props.graphRef.current.fitView();
            }}
            tooltipText='Fit the graph to the page column'
          />
          <IconButton
            className='graph_expand_collapse_button'
            text=''
            icon={faExpandArrowsAlt}
            onClick={() => {
              this.props.expandContainer();
              if (this.props.graphRef.current)
                this.props.graphRef.current.fitView();
            }}
            tooltipText='Fit the graph to the window'
          />
          <span className='small light right'>
            {nodeCount} nodes, {edgeCount} edges
          </span>
        </div>
      </>
    );
  }
}
// connect component to global state
GraphAttic = connect((state) => ({
  graph: state.graph
}))(GraphAttic);