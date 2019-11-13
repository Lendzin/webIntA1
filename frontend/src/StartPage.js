import React, { Component } from 'react';
import { Button, Row, Col, Container, Form } from 'react-bootstrap';
import UserSimIndexTable from './UserSimIndexTable';
import RecommendationTable from './RecommendationTable'

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
			sizeChoice: 'demo',
			nameChoice: null,
			data: null, 
			users: null,
			listSize: 0,
		};
	}

	async componentDidMount() {
		let users = await requestUsers();
		if (users.length !== 0) {
			this.setState({users: users, nameChoice: users[0].Name})
		}
	}

	requestLargeUsers = async ()  => {
		let response = await fetch(`http://localhost:1337/item/large/users`)
		if (response) {
			let body = await response.json();
    		this.setState({users: body, nameChoice: body[0].Name})
		}
	}

    handleChoiceAlgo = (choice) => {
	    const value = choice.target.value
	    this.setState({ algoChoice: value, data: null})
	}
	
	handleChoiceName = (choice) => {
	    const value = choice.target.value
		this.setState({ nameChoice: value, data: null})
	}

	handleChoiceSize = async (choice) => {
		const value = choice.target.value
		this.setState({users: null, sizeChoice: value, data: null})
		if (choice.target.value === 'large') {
			this.requestLargeUsers();
		} else {
			let users = await requestUsers();
			if (users.length !== 0) {
				this.setState({users: users, nameChoice: users[0].Name})
			}
		}
	}
	
    renderTable = () => {
        return (
			<>
			<RecommendationTable data={this.state.data.recommended.slice(1, this.state.listSize ? this.state.listSize+1 : this.state.data.recommended.length)}></RecommendationTable>
			<Row style={{ marginTop: 30, marginBottom: 10 }}></Row>
            <UserSimIndexTable data={this.state.data.result}> </UserSimIndexTable>
			</>
        )
	}

	setListSize = (size)  => {
		if (size < 0) {
			size = 0;
		}
		this.setState({listSize: size})
	}


    requestData = async () => {
		let size = this.state.sizeChoice === 'large' ? 'large/' : '';
        let response = await fetch(`http://localhost:1337/item/${size}${this.state.algoChoice}/${this.state.nameChoice}`)
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
					<Form.Control defaultValue={this.state.algoChoice} as="select" onChange={this.handleChoiceAlgo} style={{ width: 200 }}>
						<option>euclidean</option>
                        <option>pearson</option>
                        <option>itembased</option>
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
					<Row style={{ marginTop: 10, marginBottom: 10 }}></Row>

					Choose Size:
					<Form.Control defaultValue={this.state.sizeChoice} as="select" onChange={this.handleChoiceSize} style={{ width: 200 }}>
						<option>example</option>
						<option>large</option>
		            </Form.Control>

					<Row style={{ marginTop: 10, marginBottom: 10 }}></Row>

						<Button style={{marginRight: 10}} onClick={() => this.setListSize(this.state.listSize-1)}>{'<'}</Button>
							{'Recommendation list size: ' + this.state.listSize}
						<Button style={{marginLeft: 10}} onClick={() => this.setListSize(this.state.listSize+1)}>{'>'}</Button>
						{' (0 = show all)'}

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

