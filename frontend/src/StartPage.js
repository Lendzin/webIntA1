import React, { Component } from 'react';
import { Button, Row, Col, Container, Form } from 'react-bootstrap';
import  TableComponent from './TableComponent';

const uuid = require('uuid/v4')

export default class StartPage extends Component {
	constructor(props) {
		super(props);
		this.uuid = uuid();
		this.state = {
            choice: 'euclidean',
            data: null
		};
	}

	componentDidMount() {
	}

    	handleChoice = (choice) => {
		    const value = choice.target.value
		    this.setState({ choice: value})
        }

        renderTable = () => {
            return (
                <TableComponent data={this.state.data}></TableComponent>
            )
        }

        sendRequest = async () => {
			console.log('http://localhost:1337/item/' + this.state.choice)
			
            let response = await fetch(`http://localhost:1337/item/${this.state.choice}`)
			if (response) {
				let body = await response.json();
                this.setState({data : body})
			}
        }
    
	render() {
		return (
			<Container>
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
                <Row>Choose the way you want to use the movielist</Row>
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
				<Form>
					<Form.Control as="select" onChange={this.handleChoice} style={{ width: 200 }}>
						<option>euclidean</option>
                        <option>pearson</option>
                        <option>itembased</option>
						<option>userbased</option>
		            </Form.Control>
				</Form>
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
                <Button onClick={this.sendRequest}>Send Request to Server</Button>
                <Row style={{ marginTop: 10, marginBottom: 10 }}></Row>
                {this.state.data ? this.renderTable() : <Row></Row>}
			</Container>
		);
	}
}

