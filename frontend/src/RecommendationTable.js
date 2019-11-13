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
            height: `${this.props.data.length !== 0 ? this.props.data.length * 31 + 40 : 0}px`, 
            width: '600px' }} 
        >
            {this.props.data.length !== 0 ? 'Recommended Movies Table:' : 'No recommendations to show...'}
            <AgGridReact
            columnDefs={[{
                headerName: "Movie", field: "value", cellRenderer: movie => {return movie.data.MovieId.Title}
                }, {
                headerName: "Id", field: "value", cellRenderer: movie => {return movie.data.MovieId.MovieId}
                }, {
                headerName: "Score", field: "RecommendValue"
            }]}
            rowData={this.props.data}>
            </AgGridReact>
        </div>
        </>
        );
    }
}