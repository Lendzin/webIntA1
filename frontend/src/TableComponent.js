import React, { Component } from 'react';
import './App.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

export default class TableComponent extends Component {
	constructor(props) {
		super(props);
        this.state = {

           }
	}

    render() {
        return (
        <>
        <div 
            className="ag-theme-balham"
            style={{ 
            height: '500px', 
            width: '600px' }} 
        >
            {console.log(this.props.data[0])}
            <AgGridReact
            columnDefs={[{
                headerName: "User", field: "user"
                }, {
                headerName: "EucValue", field: "eucValue"
                }, {
                headerName: "Recommendation", field: "value", cellRenderer: user => { return user.data.recommendationOrder.length !== 0 ? user.data.recommendationOrder[0].Title : 'None'}
            }]}
            rowData={this.props.data}>
            </AgGridReact>
        </div>
        </>
        );
    }
}