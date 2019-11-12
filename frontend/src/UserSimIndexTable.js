import React, { Component } from 'react';
import './App.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

export default class UserSimIndexTable extends Component {
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
            height: `${this.props.data.length * 40}px`, 
            width: '600px' }} 
        >
            {this.props.data.length !== 0 ? <p>User and SimIndex Table:</p> : <span></span>}
            <AgGridReact
            columnDefs={[{
                headerName: "User", field: "user"
                }, {
                headerName: "SimIndex", field: "simIndex"
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