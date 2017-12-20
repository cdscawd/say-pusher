import React, {Component} from 'react';
import $ from 'jquery'
import './../../style/buttons.css'
import './Animate.css';
import pic_01 from '../../images/pic_01.png'

class Animate extends Component {
	state = {
		// 页面类型
		page_type: 'START', 	// START WORD NEXT_EXERCISE
		page_end: false, 			// 页面练习是否完成
		// 当前页面背景图
		background_image_URL: '',

		// 页面展现数据 WORD
		word_data: {
			image: [],
			text: []
		},

		// 当前页面鼠标点击次数
		target_number: 0,

		// 鼠标点击类型
		target_type: 'IMAGE',		//IMAGE	

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

	// WORD 当前切换下一个数据
	nextWordBind = () => {
		let page_type = this.state.page_type
		let target_number = this.state.target_number
		let word_data = this.state.word_data
		var target_type = this.state.target_type
		let resData = this.state.data[page_type].data

		if (target_number < resData.length) {
			if (target_type === 'IMAGE') { 
				word_data.image.push(resData[target_number].image)
				this.setState({
					word_data: word_data,
					target_type: 'WORD'
				})
			} else {
				word_data.text.push(resData[target_number].text)
				this.setState({
					word_data: word_data,
					target_type: 'IMAGE',
					target_number: target_number + 1,
				}) 
				if( (target_number + 1) === resData.length) {
					this.setState({
						page_end: true,
					}) 
					console.log('WORD 已完成练习 跳转下一个')
				}
			}
		}

		console.log('target_number:: ' + target_number )
		console.log('resData.length:: ' + resData.length )
	}

	// 切换下一个练习页面
	nextExerciseBind = () => {
		console.log(121312321)
	}
	render() {
		let page_type = this.state.page_type

		return (
			<section id="Animate-content" style={{backgroundImage:  this.state.data[page_type].background.image_URL}}>
				{	this.state.word_data.image.map((item, index) => {
						return  <img key={index} className={`word-image ${item.animation}`} style={{
													width: item.width,
													height: item.height,
													left: item.left,
													top: item.top,
												}} src={item.path} />
					})
				}
				{ this.state.word_data.text.map((item, index) => {
						return  <span key={index} className={`word-text ${item.animation}`} style={{
											width: item.width,
											top: item.top,
											left: item.left, 
											color: item.color,
											fontSize: item.fontSize,
										}}>{item.value}</span>
					})
				}

				<div className="control-tools">
					{ this.state.page_type == 'START' && <div className="start-exercise button button-3d button-caution button-pill button-jumbo" onClick={this.startButtonBind}>Start Exercise</div> }
					{ this.state.page_type == 'WORD' &&  !this.state.page_end && <div className="next-word button button-3d button-primary button-pill button-jumbo" onClick={this.nextWordBind}>Next Word</div> }
					{ this.state.page_end &&  <div className="next-exercise button button-3d button-highlight button-pill button-jumbo" onClick={this.nextExerciseBind}>Next Exercise</div> }
				</div>
			</section>
		)
	}
}

export default Animate;
