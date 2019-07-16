import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import { CollapsibleSection } from '../components/collapsible-section.js';
import { NodeTable } from './node-table.js';

import './index.css';

// node results section component
// details about source/target nodes
export class NodeResults extends Component {
  // display component
  render() {
    return (
      <CollapsibleSection
        label='Node Info'
        tooltipText='Details about the source and target node'
      >
        {this.props.sourceNode.name && (
          <NodeTable node={this.props.sourceNode} label='Source Node' />
        )}
        {this.props.targetNode.name && (
          <NodeTable node={this.props.targetNode} label='Target Node' />
        )}
        {!this.props.sourceNode.name && !this.props.targetNode.name && (
          <span className='light'>select a source and target node</span>
        )}
      </CollapsibleSection>
    );
  }
}
// connect component to global state
NodeResults = connect((state) => ({
  sourceNode: state.sourceNode,
  targetNode: state.targetNode
}))(NodeResults);