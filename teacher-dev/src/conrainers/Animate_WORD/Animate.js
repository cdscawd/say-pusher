import React, {Component} from 'react';
import $ from 'jquery'
import './Animate.css';
import pic_01 from '../../images/pic_01.png'

class Animate extends Component {
	state = {
		// 页面展现数据
		dom_data: {
			image: [],
			text: []
		},
		// 鼠标点击次数
		target_number: 0,
		// 鼠标点击类型
		target_type: 'IMAGE',		//IMAGE		 
		// 请求获得数据	
		data: {
			background: {
				image_path: "url('./animation/step_01/background/word.png')"
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
	componentDidMount() {}
	componentWillUnmount() {}
	nextButtonBind = () => {
		var target_number = this.state.target_number
		var dom_data = this.state.dom_data
		var word = this.state.data.word
		var target_type = this.state.target_type

		// if (target_number < word.length) {
		// 	dom_data.push(word[target_number])
		// 	this.setState({
		// 		target_number: target_number + 1,
		// 		dom_data: dom_data
		// 	})
		// }
		// console.log(target_number)
		// console.log(this.state.dom_data)

		if (target_number < word.length) {
			if (target_type === 'IMAGE') { 
				dom_data.image.push(word[target_number].image)
				this.setState({
					dom_data: dom_data,
					target_type: 'WORD'
				})
			} else {
				dom_data.text.push(word[target_number].text)
				this.setState({
					dom_data: dom_data,
					target_type: 'IMAGE',
					target_number: target_number + 1,
				})
			}
		} else {
			alert('WORD 已完成练习 跳转下一个')
		}
		
		console.log(this.state.dom_data)
		// 处理文字推入深渊
	}
	render() {
		var data = this.state.data
		var words = this.state.data.word

		return (
			<section id="Animate-content" style={{backgroundImage: data.background.image_path}}>

				{
					this.state.dom_data.image.map((item, index) => {
						return  <img key={index} className={`word-image ${item.animation}`} style={{
													width: item.width,
													height: item.height,
													left: item.left,
													top: item.top,
												}} src={item.path} />
					})
				}
				{
					this.state.dom_data.text.map((item, index) => {
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
					<div className="next" title="next action" 
					onClick={this.nextButtonBind}>Next</div>
				</div>
			</section>
		)
	}
}

export default Animate;
