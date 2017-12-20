import React, {Component} from 'react';
import $ from 'jquery'
import './Animate.css';
import pic_01 from '../../images/pic_01.png'

class Animate extends Component {
	state = {
		// 页面展现数据
		dom_data: [],

		// 鼠标点击次数
		target_number: 0,

		// 请求获得数据	
		data: {
			background: {
				image_path: "url('./animation/step_01/bg.png')"
			},
			word: [
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
				}, {
					image: {
						path: './animation/step_01/dad.png',
						width: 200,
						height: 200,
						top: 140,
						left: 280,
						animation: 'animated fadeInUp'
					},
					text: {
						value: 'dad',
						top: 340,
						left: 280,
						width: 200,
						fontSize: 28,
						animation: 'animated fadeInUpBig'
					}
				}, {
					image: {
						path: './animation/step_01/grandma.png',
						width: 200,
						height: 200,
						top: 140,
						left: 520,
						animation: 'animated fadeInDown'
					},
					text: {
						value: 'grandma',
						top: 340,
						left: 520,
						width: 200,
						fontSize: 28,
						animation: 'animated fadeInUpBig'
					}
				}, {
					image: {
						path: './animation/step_01/grandpa.png',
						width: 200,
						height: 200,
						top: 140,
						left: 760,
						animation: 'animated fadeInRight'
					},
					text: {
						value: 'grandpa',
						top: 340,
						left: 760,
						width: 200,
						fontSize: 28,
						animation: 'animated fadeInUpBig'
					}
				}
			],
		}

	};
	componentWillMount() {}
	componentDidMount() {
		console.log(this.state.data.word.length)
	}
	componentWillUnmount() {}
	nextButtonBind = () => {
		var target_number = this.state.target_number
		var dom_data = this.state.dom_data
		var word = this.state.data.word

		if (target_number < word.length) {
			dom_data.push(word[target_number])
			this.setState({
				target_number: target_number + 1,
				dom_data: dom_data
			})
		}

		// console.log(target_number)
		// console.log(this.state.dom_data)

	}
	render() {
		var data = this.state.data
		var words = this.state.data.word

		return (
			<section id="Animate-content" style={{backgroundImage: data.background.image_path}}>

				{/*<img  className={`word-image ${words[0].image.animation}`} style={{
					width: words[0].image.width,
					height: words[0].image.height,
					left: words[0].image.left,
					top: words[0].image.top,
				}} src={words[0].image.path} />*/}

				{
					this.state.dom_data.map((item, index) => {
						return  <div key={index}>
											<img className={`word-image ${item.image.animation}`} style={{
													width: item.image.width,
													height: item.image.height,
													left: item.image.left,
													top: item.image.top,
												}} src={item.image.path} />
											<span className={`word-text ${item.text.animation}`} style={{
													width: item.text.width,
													top: item.text.top,
													left: item.text.left, 
													color: item.text.color,
													fontSize: item.text.fontSize,
												}}>{item.text.value}</span>
										</div>
					})
				}

				<div className="control-tools">
					<div className="next" title="next action" 
					onClick={this.nextButtonBind}>Next</div>
				</div>
			</section>
		)
	}
}

export default Animate;
