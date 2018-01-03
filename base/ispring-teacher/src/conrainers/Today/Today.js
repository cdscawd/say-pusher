import React, {Component} from 'react';
import './Today.css'
import axios from 'axios'
import Pusher from 'pusher-js'
import {CryptoPrice} from "./CryptoPrice";

class Today extends Component {
	state = {
		btcprice: 0, 
		ltcprice: 0,
		ethprice: 0
	};

	componentWillMount() {}


	componentDidMount() {
		
	}

	componentWillUnmount() {
	
	}

	render() {
		return (
			<div className="today--section container">
				<h2>Current Price</h2>
				<div className="columns today--section__box"></div>
			</div>
		)
	}
}

export default Today;