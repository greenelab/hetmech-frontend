import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { faSortUp } from '@fortawesome/free-solid-svg-icons';
import { faSortDown } from '@fortawesome/free-solid-svg-icons';

import { metapathChips } from './chips.js';
import { Button } from './buttons.js';
import { TextButton } from './buttons.js';
import { Checkbox } from './buttons.js';
import { DynamicField } from './dynamic-field.js';
import { CollapsibleSection } from './collapsible-section.js';
import { makeFilenameFriendly } from './util.js';
import { downloadCsv } from './util.js';
import { toFixed } from './util.js';
import { toExponential } from './util.js';
import { toGradient } from './util.js';
import { updateMetapaths } from './actions.js';
import './metapath-results.css';

// path results section component
export class MetapathResults extends Component {
  // display component
  render() {
    return (
      <section>
        <CollapsibleSection
          label='Metapaths'
          tooltipText='Metapath results with p-value <= 0.1 and length (# of edges) <= 3'
        >
          {this.props.metapaths.length > 0 ? <TableFull /> : <TableEmpty />}
        </CollapsibleSection>
      </section>
    );
  }
}
// connect component to global state
MetapathResults = connect((state) => ({
  metapaths: state.metapaths
}))(MetapathResults);

// table with results component
class TableFull extends Component {
  // initialize component
  constructor(props) {
    super(props);

    this.state = {};
    this.state.showMore = false;
    this.state.allChecked = false;
    this.state.sortColumn = 'p_value';
    this.state.sortUp = false;

    this.toggleShowMore = this.toggleShowMore.bind(this);
    this.toggleAllChecked = this.toggleAllChecked.bind(this);
    this.allChecked = this.allChecked.bind(this);
    this.checkAll = this.checkAll.bind(this);
    this.uncheckAll = this.uncheckAll.bind(this);
    this.allOthersUnchecked = this.allOthersUnchecked.bind(this);
    this.toggleChecked = this.toggleChecked.bind(this);
    this.soloChecked = this.soloChecked.bind(this);
    this.changeSort = this.changeSort.bind(this);
    this.downloadCsv = this.downloadCsv.bind(this);
  }

  // when component updates
  componentDidUpdate(prevProps) {
    if (this.props.metapaths !== prevProps.metapaths)
      this.updateAllChecked();
  }

  // updates state whether all rows are checked
  updateAllChecked() {
    if (this.allChecked())
      this.setState({ allChecked: true });
    else
      this.setState({ allChecked: false });
  }

  // toggle show more/less
  toggleShowMore(event) {
    if (event)
      event.preventDefault();

    this.setState({ showMore: !this.state.showMore });
  }

  toggleAllChecked() {
    if (this.allChecked())
      this.uncheckAll();
    else
      this.checkAll();
  }

  // checks whether all metapaths are checked
  allChecked() {
    for (const metapath of this.props.metapaths) {
      if (!metapath.checked)
        return false;
    }

    return true;
  }

  // makes all metapaths checked
  checkAll() {
    const metapaths = this.props.metapaths.slice();

    for (const metapath of this.props.metapaths)
      metapath.checked = true;

    this.props.dispatch(updateMetapaths({ metapaths: metapaths }));
  }

  // makes all metapaths unchecked
  uncheckAll() {
    const metapaths = this.props.metapaths.slice();

    for (const metapath of this.props.metapaths)
      metapath.checked = false;

    this.props.dispatch(updateMetapaths({ metapaths: metapaths }));
  }

  // checks whether all metapaths besides the specified are unchecked
  allOthersUnchecked(id) {
    for (const metapath of this.props.metapaths) {
      if (id !== metapath.id && metapath.checked)
        return false;
    }

    return true;
  }

  // toggles the specified metapaths on/off
  toggleChecked(id) {
    const metapaths = this.props.metapaths.slice();

    for (const metapath of metapaths) {
      if (metapath.id === id)
        metapath.checked = !metapath.checked;
    }

    this.props.dispatch(updateMetapaths({ metapaths: metapaths }));
  }

  // solo metapath (turn all others off)
  soloChecked(id) {
    const metapaths = this.props.metapaths.slice();
    const allOthersUnchecked = this.allOthersUnchecked(id);

    for (const metapath of metapaths) {
      if (allOthersUnchecked)
        metapath.checked = true;
      else {
        if (id === metapath.id)
          metapath.checked = true;
        else
          metapath.checked = false;
      }
    }

    this.props.dispatch(updateMetapaths({ metapaths: metapaths }));
  }

  // change which column table is sorted by
  changeSort(sortColumn) {
    const newState = {};
    newState.sortColumn = sortColumn;

    if (sortColumn === this.state.sortColumn)
      newState.sortUp = !this.state.sortUp;
    else
      newState.sortUp = true;

    this.setState(newState);
  }

  // compare numbers (for sorting)
  compareNumbers(a, b, key) {
    // parse as numbers
    const comparison = Number(a[key]) - Number(b[key]);
    if (!Number.isNaN(comparison))
      return comparison;

    // otherwise parse as strings and compare alphabetically
    if (a[key] < b[key])
      return -1;
    else if (a[key] > b[key])
      return 1;
    else
      return 0;
  }

  // compare metapaths (for sorting)
  compareMetapaths(a, b, key) {
    a = a[key];
    b = b[key];
    // first by length
    if (a.length < b.length)
      return -1;
    else if (a.length > b.length)
      return 1;
    else {
      // then alphabetically
      if (a < b)
        return -1;
      else if (a > b)
        return 1;
      else
        return 0;
    }
  }

  // download table data as .csv file
  downloadCsv() {
    if (
      !this.props.metapaths.length ||
      !this.props.sourceNode.name ||
      !this.props.targetNode.name
    )
      return;

    const tableData = makeMetapathsTable(this.props.metapaths);
    const filename = [
      'metapaths',
      makeFilenameFriendly(this.props.sourceNode.name),
      makeFilenameFriendly(this.props.targetNode.name)
    ].join('_');
    downloadCsv(tableData, filename);
  }

  // display component
  render() {
    // sort metapaths by specified column
    const sortedMetapaths = this.props.metapaths;
    const sortColumn = this.state.sortColumn;

    // sort by appropriate field
    if (sortColumn === 'metaedges')
      sortedMetapaths.sort((a, b) => this.compareMetapaths(a, b, sortColumn));
    else
      sortedMetapaths.sort((a, b) => this.compareNumbers(a, b, sortColumn));

    // reverse sort direction
    if (this.state.sortUp)
      sortedMetapaths.reverse();

    const metapathCount = sortedMetapaths.length;
    let metapathSelectedCount = 0;
    for (const metapath of sortedMetapaths) {
      if (metapath.checked)
        metapathSelectedCount++;
    }

    return (
      <TableContext.Provider
        value={{
          sortedMetapaths: sortedMetapaths,
          showMore: this.state.showMore,
          allChecked: this.state.allChecked,
          toggleAllChecked: this.toggleAllChecked,
          toggleChecked: this.toggleChecked,
          soloChecked: this.soloChecked,
          sortColumn: this.state.sortColumn,
          sortUp: this.state.sortUp,
          changeSort: this.changeSort
        }}
      >
        <div className='table_attic'>
          <TextButton
            text='.csv'
            icon={faDownload}
            className='link_button small'
            onClick={this.downloadCsv}
            tooltipText='Download table as .csv file'
          />
          <TextButton
            text={this.state.showMore ? 'show less ' : 'show more '}
            icon={this.state.showMore ? faAngleLeft : faAngleRight}
            className='link_button small'
            onClick={this.toggleShowMore}
            tooltipText='Expand table and show more columns'
          />
          <div className='small light right'>
            {metapathCount} results, {metapathSelectedCount} selected
          </div>
        </div>
        <div className='table_container' data-expanded={this.state.showMore}>
          <table className='metapath_results_table'>
            <TableHead />
            <TableBody />
          </table>
        </div>
      </TableContext.Provider>
    );
  }
}
// allow other components to access component's variables and methods
const TableContext = React.createContext({});
// connect component to global state
TableFull = connect((state) => ({
  sourceNode: state.sourceNode,
  targetNode: state.targetNode,
  metapaths: state.metapaths
}))(TableFull);

// table header component
// contains column labels and sort buttons
class TableHead extends Component {
  // display component
  render() {
    // extra 'super-grouping' row at top of table
    const extraRow = (
      <tr>
        <td className='col_xs' />
        <td className='col_l' />
        <td className='col_s' />
        <td className='col_m' />
        <td className='col_s' />
        <td className='col_s' />
        <td className='col_s' />
        <td className='col_xxl center' colSpan='4'>
          <div className='divider'>Null DWPC distribution information</div>
        </td>
      </tr>
    );

    // helper text when user hovers over given field
    let tooltipText = {};
    if (this.props.hetioDefinitions.properties) {
      tooltipText = {
        ...tooltipText,
        ...this.props.hetioDefinitions.properties.common,
        ...this.props.hetioDefinitions.properties.nodes
      };
    }
    tooltipText = { ...tooltipText, ...this.props.hetmechDefinitions };

    // primary columns
    const cols = (
      <>
        <td className='col_xs'>
          <Checkbox
            checked={this.context.allChecked}
            onClick={() => this.context.toggleAllChecked()}
            onCtrlClick={() => this.context.toggleAllChecked()}
            tooltipText='Show all paths'
          />
        </td>
        <TableHeadCell
          className='col_l left'
          buttonClass='left'
          fieldName='metaedges'
          tooltipText={tooltipText['metapath']}
          text='metapath'
        />
        <TableHeadCell
          className='col_s'
          fieldName='path_count'
          tooltipText={tooltipText['path_count']}
          text='path count'
        />
        <TableHeadCell
          className='col_m'
          fieldName='p_value'
          tooltipText={tooltipText['p_value']}
          text={
            <>
              <i>p</i>-value
            </>
          }
        />
      </>
    );

    // extra columns
    const extraCols = (
      <>
        <TableHeadCell
          className='col_s'
          fieldName='dwpc'
          tooltipText={tooltipText['dwpc']}
          text='DWPC'
        />
        <TableHeadCell
          fieldName='source_degree'
          tooltipText={tooltipText['source_degree']}
          text='source degree'
        />
        <TableHeadCell
          fieldName='target_degree'
          tooltipText={tooltipText['target_degree']}
          text='target degree'
        />
        <TableHeadCell
          fieldName='n_dwpcs'
          tooltipText={tooltipText['n_dwpcs']}
          text="# DWPC's"
        />
        <TableHeadCell
          fieldName='n_nonzero_dwpcs'
          tooltipText={tooltipText['n_nonzero_dwpcs']}
          text="# non-0 DWPC's"
        />
        <TableHeadCell
          fieldName='nonzero_mean'
          tooltipText={tooltipText['nonzero_mean']}
          text='non-0 mean'
        />
        <TableHeadCell
          fieldName='nonzero_sd'
          tooltipText={tooltipText['nonzero_sd']}
          text={<>non-0 &sigma;</>}
        />
      </>
    );

    return (
      <thead className='small light'>
        {this.context.showMore && extraRow}
        <tr>
          {cols}
          {this.context.showMore && extraCols}
        </tr>
      </thead>
    );
  }
}
// connect component to context component
TableHead.contextType = TableContext;
// connect component to global state
TableHead = connect((state) => ({
  hetioDefinitions: state.hetioDefinitions,
  hetmechDefinitions: state.hetmechDefinitions
}))(TableHead);

// table header cell component
class TableHeadCell extends Component {
  // display component
  render() {
    return (
      <td className={this.props.className}>
        <SortButton
          text={this.props.text}
          tooltipText={this.props.tooltipText}
          fieldName={this.props.fieldName}
          className={this.props.buttonClass}
        />
      </td>
    );
  }
}

// column sort button component
class SortButton extends Component {
  // display component
  render() {
    return (
      <Button
        tooltipText={this.props.tooltipText}
        className={'sort_button ' + (this.props.className || '')}
        onClick={() => this.context.changeSort(this.props.fieldName)}
      >
        {this.props.text}
        <FontAwesomeIcon
          icon={
            this.props.fieldName === this.context.sortColumn
              ? this.context.sortUp
                ? faSortUp
                : faSortDown
              : faSort
          }
        />
      </Button>
    );
  }
}
// connect component to context component
SortButton.contextType = TableContext;

// table body component
// contains actual data
class TableBody extends Component {
  // display component
  render() {
    return (
      <tbody>
        {this.context.sortedMetapaths.map((metapath, index) => (
          <TableBodyRow
            key={index}
            metapath={metapath}
            checked={metapath.checked}
            showMore={this.props.showMore}
          />
        ))}
      </tbody>
    );
  }
}
// connect component to context component
TableBody.contextType = TableContext;

// table body row component
// contains column data for one metapath
class TableBodyRow extends Component {
  // display component
  render() {
    const metapath = this.props.metapath;

    // primary columns
    const cols = (
      <>
        <td>
          <Checkbox
            checked={this.props.checked}
            onClick={() => this.context.toggleChecked(this.props.metapath.id)}
            onCtrlClick={() => this.context.soloChecked(this.props.metapath.id)}
            tooltipText={
              'Show these ' +
              (this.props.metapath.path_count || '') +
              ' paths in the paths table'
            }
          />
        </td>
        <TableBodyCell
          className='left'
          fieldClass='left'
          value={metapathChips(metapath.metaedges)}
          fullValue={metapath.metapath_name}
        />
        <TableBodyCell value={metapath.path_count} />
        <TableBodyCell
          className='right'
          style={{ backgroundColor: toGradient(metapath.p_value) }}
          value={toExponential(metapath.p_value)}
          fullValue={metapath.p_value}
        />
      </>
    );

    // extra columns
    const extraCols = (
      <>
        <TableBodyCell
          value={toFixed(metapath.dwpc)}
          fullValue={metapath.dwpc}
        />
        <TableBodyCell value={metapath.source_degree} />
        <TableBodyCell value={metapath.target_degree} />
        <TableBodyCell value={metapath.n_dwpcs} />
        <TableBodyCell value={metapath.n_nonzero_dwpcs} />
        <TableBodyCell
          value={toFixed(metapath.nonzero_mean)}
          fullValue={metapath.nonzero_mean}
        />
        <TableBodyCell
          value={toFixed(metapath.nonzero_sd)}
          fullValue={metapath.nonzero_sd}
        />
      </>
    );

    return (
      <tr>
        {cols}
        {this.context.showMore && extraCols}
      </tr>
    );
  }
}
// connect component to context component
TableBodyRow.contextType = TableContext;

// table body cell component
class TableBodyCell extends Component {
  // display component
  render() {
    return (
      <td className={this.props.className} style={this.props.style}>
        <DynamicField
          value={this.props.value}
          fullValue={this.props.fullValue}
          className={this.props.fieldClass}
        />
      </td>
    );
  }
}

// table with no results component
class TableEmpty extends Component {
  // display component
  render() {
    return (
      <table className='metapath_results_table'>
        <tbody>
          <tr>
            <td className='center light'>no results to show</td>
          </tr>
        </tbody>
      </table>
    );
  }
}

// make table array out of metapaths results object
function makeMetapathsTable(metapaths) {
  let headers = [];
  for (const field of Object.keys(metapaths[0])) {
    if (
      typeof metapaths[0][field] === 'number' ||
      typeof metapaths[0][field] === 'string'
    )
      headers.push(field);
  }

  // sort headers in custom order
  const order = {
    id: 1,
    metapath_name: 2,
    metapath_abbreviation: 3,
    path_count: 4,
    p_value: 5,
    dwpc: 6,
    source_degree: 7,
    target_degree: 8,
    n_dwpcs: 9,
    n_nonzero_dwpcs: 10,
    nonzero_mean: 11,
    nonzero_sd: 12
  };
  headers = headers.sort((a, b) => {
    if (order[a] && order[b])
      return order[a] - order[b];
    else if (order[a])
      return -1;
    else if (order[b])
      return 1;
    else
      return b - a;
  });

  const table = [];
  table.push(headers);
  for (const result of metapaths) {
    const row = [];
    for (const header of headers)
      row.push(result[header]);
    table.push(row);
  }

  return table;
}
