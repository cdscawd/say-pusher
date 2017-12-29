import React, {Component} from 'react';
import $ from 'jquery'
import './../../style/buttons.css'
import './Animate.css';
import pic_01 from '../../images/pic_01.png'

class Animate extends Component {
	state = {
		// 页面类型
		page_type: 'START', 	// START WORD NEXT_EXERCISE SENTENCE
		page_end: false, 			// 页面练习是否完成
		// 当前页面背景图
		background_image_URL: '',

		// 页面展现数据 WORD
		word_data: {
			image: [],
			text: []
		},

		// 页面展现数据 SENTENCE
		sentence_data: {
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
					image_URL: "url('./animation/start/background/start.jpg')"
				}
			},

			WORD: {
				background: {
					image_URL: "url('./animation/word/background/word.jpg')"
				},
				data: [ 
					{
						image: {
							path: './animation/word/mom.png',
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
							path: './animation/word/dad.png',
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
							path: './animation/word/grandma.png',
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
							path: './animation/word/grandpa.png',
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
			},

			SENTENCE: {
				background: {
					image_URL: "url('./animation/sentence/background/sentence.jpg')"
				},
				data: [
					{
						image: {
							path: './animation/sentence/hi.png',
							width: 200,
							height: 200,
							top: 140,
							left: 80,
							animation: 'animated rotateIn'
						},
						text: {
							value: 'hi',
							top: 340,
							left: 40,
							width: 200,
							fontSize: 28,
							animation: 'animated fadeInLeft'
						}
					}, {
						image: {
							path: './animation/sentence/hello.jpg',
							width: 200,
							height: 200,
							top: 140,
							right: 80,
							animation: 'animated rotateInDownRight'
						},
						text: {
							value: 'hello',
							top: 340,
							right: 80,
							width: 200,
							fontSize: 28,
							animation: 'animated fadeInUpBig'
						}
					}, 
				]
			},

			WORD_IMAGE: {
				background: {
					image_URL: "url('./animation/sentence/background/sentence.jpg')"
				},
			},
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
		this.setState({
			page_type: 'WORD',
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

	// SENTENCE 当前切换下一个数据
	nextSentenceBind = () => {
		let page_type = this.state.page_type
		let target_number = this.state.target_number
		let sentence_data = this.state.sentence_data
		var target_type = this.state.target_type
		let resData = this.state.data[page_type].data

		if (target_number < resData.length) {
			if (target_type === 'IMAGE') { 
				sentence_data.image.push(resData[target_number].image)
				this.setState({
					sentence_data: sentence_data,
					target_type: 'WORD'
				})
			} else {
				sentence_data.text.push(resData[target_number].text)
				this.setState({
					sentence_data: sentence_data,
					target_type: 'IMAGE',
					target_number: target_number + 1,
				}) 
				if( (target_number + 1) === resData.length) {
					this.setState({
						page_end: true,
					}) 
					console.log('SENTENCE 已完成练习 跳转下一个')
				}
			}
		}
		// SENTENCE 结束后处理等
		console.log(this.state.sentence_data)
	}

	// 切换下一个练习页面
	nextExerciseBind = () => {
		let page_type = this.state.page_type

		switch (page_type) {
			case 'WORD':
				this.setState({
					page_type: 'SENTENCE',
					page_end: false,
					target_number: 0,
					target_type: 'IMAGE',
				})
				break;
			case 'SENTENCE':
				this.setState({
					page_type: 'WORD_IMAGE',
					page_end: false,
					target_number: 0,
					target_type: 'IMAGE',
				})
				console.log(':: 开始练习')
				break;
			default:
				break;
		}
		
	}
	render() {
		let page_type = this.state.page_type

		return (
			<section id="Animate-content" style={{backgroundImage:  this.state.data[page_type].background.image_URL}}>
				{/* WORD */}
				{	this.state.page_type == 'WORD' && this.state.word_data.image.map((item, index) => {
						return  <img key={index} className={`word-image ${item.animation}`} style={{
													width: item.width,
													height: item.height,
													left: item.left,
													top: item.top,
												}} src={item.path} />
					})
				}
				{ this.state.page_type == 'WORD' && this.state.word_data.text.map((item, index) => {
						return  <span key={index} className={`word-text ${item.animation}`} style={{
											width: item.width,
											top: item.top,
											left: item.left, 
											color: item.color,
											fontSize: item.fontSize,
										}}>{item.value}</span>
					})
				}

				{/* SENTENCE */}
				{	this.state.page_type == 'SENTENCE' && this.state.sentence_data.image.map((item, index) => {
						return  <img key={index} className={`word-image ${item.animation}`} style={{
													width: item.width,
													height: item.height,
													left: item.left,
													right: item.right,
													top: item.top,
												}} src={item.path} />
					})
				}
				{ this.state.page_type == 'SENTENCE' && this.state.sentence_data.text.map((item, index) => {
						return  <span key={index} className={`word-text ${item.animation}`} style={{
											width: item.width,
											top: item.top,
											left: item.left, 
											right: item.right,
											color: item.color,
											fontSize: item.fontSize,
										}}>{item.value}</span>
					})
				}

				<div className="control-tools">
					{ this.state.page_type == 'START' && <div className="start-exercise button button-3d button-caution button-pill button-jumbo" onClick={this.startButtonBind}>Start Exercise</div> }
					{ this.state.page_type == 'WORD' &&  !this.state.page_end && <div className="next-word button button-3d button-primary button-pill button-jumbo" onClick={this.nextWordBind}>Next Word</div> }
					{ this.state.page_end &&  <div className="next-exercise button button-3d button-highlight button-pill button-jumbo" onClick={this.nextExerciseBind}>Next Exercise</div> }
					{ this.state.page_type == 'SENTENCE' &&  !this.state.page_end && <div className="next-sentence button button-3d button-primary button-pill button-jumbo" onClick={this.nextSentenceBind}>Next Sentence</div> }
				</div>
			</section>
		)
	}
}

export default Animate;
