import React, {Component} from 'react';
import $ from 'jquery'
import './Animate.css';
import pic_01 from '../../images/pic_01.png'

class Animate extends Component {
	state = {
		// 页面展现数据
		dom_data: {
			image: [],
			word: []
		},
		// 鼠标点击次数
		target_number: 0,
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

		// if (target_number < word.length) {
		// 	dom_data.push(word[target_number])
		// 	this.setState({
		// 		target_number: target_number + 1,
		// 		dom_data: dom_data
		// 	})
		// }
		// console.log(target_number)
		// console.log(this.state.dom_data)

			dom_data.image.push(word[target_number].image)
			this.setState({
				dom_data: dom_data
			})
			console.log(this.state.dom_data)

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
					this.state.dom_data.image.map((item, index) => {
						return  <img key={index} className={`word-image ${item.animation}`} style={{
													width: item.width,
													height: item.height,
													left: item.left,
													top: item.top,
												}} src={item.path} />
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
