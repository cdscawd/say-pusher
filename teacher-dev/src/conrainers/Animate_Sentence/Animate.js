import React, {Component} from 'react';
import $ from 'jquery'
import './Animate.css';

class Animate extends Component {
	state = {
		// 页面展现数据
		dom_data: [],

		// 鼠标点击次数
		target_number: 0,

		// 请求获得数据	
		data: {
			SENTENCE: { 
				background: {
					image_URL: "url('./animation/step_01/background/sentence.jpg')"
				},
				data: [ 
					{
						image: {
							path: './animation/step_01/mom.png',
							width: 200,
							height: 200,
							top: 140,
							left: 40,
							animation: 'animated fadeInLeft'
						},
						text: {
							value: 'mom',
							top: 340,
							left: 40,
							width: 200,
							fontSize: 28,
							animation: 'animated fadeInUpBig'
						}
					}
				],
			}
		}
	}
	componentWillMount() {}
	componentDidMount() {}
	componentWillUnmount() {}
	nextButtonBind = () => {

	}
	render() {
		var data = this.state.data

		return (
			<section id="Animate-content" style={{backgroundImage: this.state.data.SENTENCE.background.image_URL}}>
				sadsads

			</section>
		)
	}
}

export default Animate;
