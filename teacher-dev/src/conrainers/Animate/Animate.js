import React, {Component} from 'react';
import $ from 'jquery'
import './Animate.css';
import pic_01 from '../../images/pic_01.png'

class Animate extends Component {
	state = {
		// 页面类型
		page_type: 'START',

		// 当前页面背景图
		background_image_URL: '',

		// 页面展现数据
		dom_data: [],

		// 当前页面鼠标点击次数
		target_number: 0,

		// 请求获得数据	
		data: {
			START: {
				background: {
					image_URL: "url('./animation/step_01/background/start.jpg')"
				}
			},

			WORD: { 
				background: {
					image_URL: "url('./animation/step_01/background/word.png')"
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
					}, 
					{
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
					}, 
					{
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
					}, 
					{
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
		}
	};
	componentWillMount() {}
	componentDidMount() {
		this.setState({
			background_image_URL: this.state.data.START.background.image_URL
		})
	}
	componentWillUnmount() {}

	// 开始按钮
	startButtonBind = () => {
		let page_type = 'WORD'
		let backgroundImageURL = this.state.data[page_type].background.image_URL
		this.setState({
			page_type: 'WORD',
			background_image_URL: backgroundImageURL
		})
		console.log('::开始练习')
	}

	// 当前切换下一个数据
	nextButtonBind = () => {
		let page_type = this.state.page_type
		let target_number = this.state.target_number
		let dom_data = this.state.dom_data
		let resData = this.state.data[page_type]

		if ( resData.data[target_number] && resData.data[target_number].length !== 0 
			&& resData.data[target_number] !== undefined) {
			dom_data.push(resData.data[target_number])
			this.setState({
			target_number: target_number + 1,
				dom_data: dom_data
			})
		}

		console.log(this.state.dom_data)
		console.log(this.state.target_number)

	}
	render() {
		let page_type = this.state.page_type

		return (
			<section id="Animate-content" style={{backgroundImage:  this.state.data[page_type].background.image_URL}}>
				{
					this.state.page_type === 'WORD' &&
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
					{
						this.state.page_type == 'START' ?
							 <div className="start" title="next action" 
							 	onClick={this.startButtonBind}>Start</div> :
							 <div className="next" title="next action" 
								onClick={this.nextButtonBind}>Next</div>
					}
				</div>
			</section>
		)
	}
}

export default Animate;
