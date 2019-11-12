import React, { Component } from 'react';
import { Button, Row, Col, Container, Form } from 'react-bootstrap';
import  TableComponent from './TableComponent';

const uuid = require('uuid/v4')
const requestUsers = async ()  => {
		let response = await fetch(`http://localhost:1337/item/users`)
		if (response) {
			let body = await response.json();
    		return body;
		}
	}

export default class StartPage extends Component {
	constructor(props) {
		super(props);
		this.uuid = uuid();
		this.state = {
			algoChoice: 'euclidean',
			nameChoice: null,
			data: null, 
			users: null,
		};
	}

	async componentDidMount() {
		let users = await requestUsers();
		if (users.length !== 0) {
			this.setState({nameChoice: users[0].Name, users: users})
		}
	}

    handleChoiceAlgo = (choice) => {
	    const value = choice.target.value
	    this.setState({ algoChoice: value})
	}
	
	handleChoiceName = (choice) => {
	    const value = choice.target.value
		this.setState({ nameChoice: value, data: null})
	}
	
	renderRecommendations = () => {
		return (
			<>
				<Form>
					Recommended Movies:
					<Form.Control as="select" onChange={() => {}} style={{ width: 300 }}>
						{this.state.data.recommended.length !== 0 ? this.state.data.recommended.map(movie => {
							return <option key={movie.MovieId.MovieId}>{movie.MovieId.Title}, Rating: {movie.RecommendValue.toFixed(4)}</option>
						}) : <option>No Recommendations</option>}
		            </Form.Control>
				</Form>
				<Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
			</>
		)
	}

    renderTable = () => {
        return (
			<>
			{this.renderRecommendations()}
            <TableComponent data={this.state.data.result}> </TableComponent>
			</>
        )
	}


    requestData = async () => {
        let response = await fetch(`http://localhost:1337/item/${this.state.algoChoice}/${this.state.nameChoice}`)
		if (response) {
			let body = await response.json();
			this.setState({data : body})
		}
	}

	renderAll = () => {
		return (
			<>
			<Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
                <Row>Choose the way you want to use the movielist</Row>
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
				<Form>
					Choose Mode:
					<Form.Control as="select" onChange={this.handleChoiceAlgo} style={{ width: 200 }}>
						<option>euclidean</option>
                        <option>pearson</option>
                        <option>itembased</option>
						<option>userbased</option>
		            </Form.Control>
				</Form>
				<Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
				<Form>
					Choose User:
					<Form.Control as="select" onChange={this.handleChoiceName} style={{ width: 200 }}>
						{this.state.users.map(user => {
							return <option key={user.UserId}>{user.Name}</option>
						})}
		            </Form.Control>
				</Form>
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
                <Button onClick={this.requestData}>Send Request to Server</Button>
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
				</>
		)
	}
    
	render() {
		return (
			<Container>
				{this.state.users ? this.renderAll() : <Row></Row>}
                {this.state.data ? this.renderTable() : <Row></Row>}
			</Container>
		);
	}
}

