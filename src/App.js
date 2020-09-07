import React, { Component } from 'react';
import './App.scss';
import DataTable from './DataTable/DataTable';
import { tableHeader, tableCofig, FILTER_OPTIONS, NewOrderConfig } from './AppConfig';
import "react-datepicker/dist/react-datepicker.css";
import FilterSelect from './FilterSelect/FilterSelect';
import Form from './Form/Form';
const btnConfig = [
  {
    text: "Submit",
    name: "save",
    validation: true
  }
]
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: "all",
      tableCofig: tableCofig.data,
      finalTableConfig: []
    };
  }

  componentDidMount() {
    this.getTableConfig();
  }

  getTableConfig = () => {
    let tableCofig = this.state.tableCofig
    let filter = this.state.filter
    let fTableConfig = []
    if (filter === "all") {
      this.setState({
        finalTableConfig: tableCofig
      })
    }
    else {
      tableCofig.forEach((data, index) => {
        if (data.discount === filter) {
          fTableConfig.push(data);
        }
      })
      this.setState({
        finalTableConfig: fTableConfig
      })
    }
  }

  onFilteApply = selected => {
    this.setState({
      filter: selected.value
    }, () => { this.getTableConfig() })
  }

  onFormSubmit = (data) => {
    let tCofig
    tCofig = [...this.state.tableCofig, data]
    this.setState({
      tableCofig: tCofig
    }, () => {this.getTableConfig();})
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="App-header-item">
            <div className="App-title">
              <div className="App-title-one">TimeTable.com</div>
              <div className="App-title-two">Manages Everything</div>
            </div>
          </div>
        </header>
        <div className="App-heading-wrapper">
          <div className="App-heading">Manage Events</div>

        </div>
        <div className="App-add-event">Add New Events:</div>
        <div className="App-form">
          <Form
            className="new-order-form"
            formConfig={NewOrderConfig}
            onSubmit={this.onFormSubmit}
            btnConfig={btnConfig}
            ref="newOrderForm"
          />
        </div>

        <div className="App-filter">
          <FilterSelect
            label="Select Filter"
            options={FILTER_OPTIONS}
            value={this.state.filter}
            onChange={this.onFilteApply}
          />
        </div>
        <div className="App-content">
          <DataTable
            ref={"dataTableVehicle"}
            headers={tableHeader}
            endColumn={6}
            data={this.state.finalTableConfig}
          />
        </div>





      </div>
    );
  }
}

export default App;
