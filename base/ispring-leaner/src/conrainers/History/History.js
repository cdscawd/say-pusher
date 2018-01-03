import React, { Component } from 'react';
import './History.css'
import axios from 'axios'
import moment from 'moment'
import {SectionBox} from "./SectionBox";

class History extends Component {
    constructor () {
        super();
        this.state = {
            todayprice: {},
            yesterdayprice: {},
            twodaysprice: {},
            threedaysprice: {},
            fourdaysprice: {}
        };
    }


	

    componentDidMount () {
		
    }
    render() {
		
    	return (
            <div className="history--section container">
                <h2>History (Past 5 days)</h2>
                
            </div>
        )
    }
}

export default History;