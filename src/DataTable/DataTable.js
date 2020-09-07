import React from 'react';
import PropTypes from "prop-types";
import DataTableRowItem from './DataTableRowItem';
import cx from "classnames";
import './DataTable.scss';

class DataTable extends React.PureComponent {

  constructor(props) {
    super(props)

    this.state = {
      tableData: props.data,
      indexForTableRow: null,
      selectedRows: [],
      startColumn: props.fixColumn,
      endColumn: props.endColumn
    };

    this.order ="ASC";
  }


  componentDidUpdate(prevProps) {
    if(this.props.data !== prevProps.data) {
      this.order ="ASC";
      this.setState({
        tableData: this.props.data      
      });
    }
  }


  // =======================================
  // Move to Next column
  // =======================================
  toNextColumn = () => {
    if(this.state.endColumn < this.props.headers.length) {
      this.setState({
        startColumn : this.state.startColumn + 1,
        endColumn: this.state.endColumn + 1
      });
    }
  }


  // =======================================
  // Move to Previous column
  // =======================================
  toPreviousColumn = () => {
    if(this.state.startColumn > this.props.fixColumn) {
      this.setState({
        startColumn : this.state.startColumn - 1,
        endColumn: this.state.endColumn - 1
      });
    }
  }

  

  onChange = (event) => {
    event.stopPropagation();
    let key =Number(event.target.dataset.key);
    let selectedRows = this.state.selectedRows;
    if(!selectedRows.includes(key)){
      selectedRows = [...this.state.selectedRows,key];
      this.setState({
        selectedRows
      });
    } else {
      selectedRows = selectedRows.filter((item) => item!==key);
      this.setState({
        selectedRows
      });
    }
  }

 

  removeAll = () => {
    this.setState({
      selectedRows: []
    });
  }


  // =======================================
  // Main Render
  // =======================================
  render() {
    return (
      <div className="tableWall">
        <div className="Table">
          <div className="TableHeader">
          {/* Headers */}
          {this.props.headers.map((header, i) => {

            const additionalProps = {};
            let cssClasses = "TableRowItem";
            if(i<this.props.fixColumn ||
              (i>=this.state.startColumn && i<this.state.endColumn)){
              return (<div key={typeof header === "string" ? header : i}
                  className={cssClasses}
                  {...additionalProps}>
                    {typeof header === "string" ? header : header.label}
                </div>)
              };
            return null;
          })
          }
          <div className={cx("TableRowItem small-col-arrow",
                {"hide":(this.state.endColumn===this.props.headers.length &&
                    this.state.endColumn===this.props.endColumn)})} >
            <div className="arrow-group">
              <div className={cx("arrow", {"next-isActive":this.state.startColumn>this.props.fixColumn})}
                onClick={this.toPreviousColumn}>
                <i className="left" />
              </div>
              <div className={cx("arrow", {
                  "next-isActive":this.state.endColumn<this.props.headers.length
                })} onClick={this.toNextColumn}>
                  <i className="right" />
              </div>
            </div>
          </div>
          </div>

        {/* Table Rows */}
        {this.state.tableData && this.state.tableData.map((rowData,i) => {
          return (
            <div key={i} className="FormTableRow" >
              <div data-key={i} className="TableRow" >
                {/* Radio Button */}
                { this.props.viewChild &&
                  <div className="TableRowItem small-col">
                    <div className="selected-row">
                      <div className={cx("add-icon",{
                          "icon":this.state.indexForTableRow===i
                      })}/>
                    </div>
                  </div>
                }
                {this.props.headers.map((header,idx) => {
                  if(idx<this.props.fixColumn ||
                    (idx>=this.state.startColumn && idx<this.state.endColumn)){
                    return (<DataTableRowItem
                              key={header.label}
                              className={header.className}>
                              {header.renderCallback
                                ? header.renderCallback(rowData,i)
                                : rowData[header.name]}
                            </DataTableRowItem>)
                  }
                  return null;
                })}
                <div className={cx("TableRowItem small-col-arrow",
                    {"hide":(this.state.endColumn===this.props.headers.length &&
                        this.state.endColumn===this.props.endColumn)})} />
            </div>

            { this.state.indexForTableRow===i && this.props.viewChild &&
              this.props.viewChild(rowData)
            }
          </div>
          )
          })
       }
      </div>
    </div>
    );
  }
}

DataTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    sort: PropTypes.bool,
    renderCallback: PropTypes.func
  })).isRequired,
  data: PropTypes.arrayOf(PropTypes.object),
  viewChild: PropTypes.func,
  onRowClick: PropTypes.func,
  startColumn: PropTypes.number,
  endColumn: PropTypes.number,
  fixColumn: PropTypes.number,
  // makes checkboxes visible with dataV2 selected row as callback
  onRowSelect: PropTypes.func
};

DataTable.defaultProps = {
  data: [],
  endColumn: 4,
  fixColumn: 0
};

export default (DataTable);
