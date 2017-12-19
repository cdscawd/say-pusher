import React, {Component} from 'react';
import $ from 'jquery'
import './Animate.css';
import pic_01 from '../../images/pic_01.png'

class Animate extends Component {
	state = {
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
						color: '#000',
						fontFamily: 'Comic Sans MS',
						fontSize: 28,
						fontStyle: 'normal',
						fontWeight: '400',
						textAlign: 'center',
						textDecoration: 'none',
						whiteSpace: 'nowrap',
						animation: 'animated fadeInUpBig'
					}
				}, {
					image: {
						path: './animation/step_01/dad.png',
						width: 200,
						height: 200,
						top: 140,
						left: 280,
						animation: 'animated fadeInLeft'
					},
					text: {
						value: 'dad',
						top: 340,
						left: 280,
						width: 200,
						color: '#000',
						fontFamily: 'Comic Sans MS',
						fontSize: 28,
						fontStyle: 'normal',
						fontWeight: '400',
						textAlign: 'center',
						textDecoration: 'none',
						whiteSpace: 'nowrap',
						animation: 'animated fadeInUpBig'
					}
				}, {
					image: {
						path: './animation/step_01/grandma.png',
						width: 200,
						height: 200,
						top: 140,
						left: 520,
						animation: 'animated fadeInLeft'
					},
					text: {
						value: 'grandma',
						top: 340,
						left: 520,
						width: 200,
						color: '#000',
						fontFamily: 'Comic Sans MS',
						fontSize: 28,
						fontStyle: 'normal',
						fontWeight: '400',
						textAlign: 'center',
						textDecoration: 'none',
						whiteSpace: 'nowrap',
						animation: 'animated fadeInUpBig'
					}
				}, {
					image: {
						path: './animation/step_01/grandpa.png',
						width: 200,
						height: 200,
						top: 140,
						left: 760,
						animation: 'animated fadeInLeft'
					},
					text: {
						value: 'grandpa',
						top: 340,
						left: 760,
						width: 200,
						color: '#000',
						fontFamily: 'Comic Sans MS',
						fontSize: 28,
						fontStyle: 'normal',
						fontWeight: '400',
						textAlign: 'center',
						textDecoration: 'none',
						whiteSpace: 'nowrap',
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
		console.log($('.word-text').text())
	}
	render() {
		var data = this.state.data
		var words = this.state.data.word

		return (
			<section id="Animate-content" style={{backgroundImage: data.background.image_path}}>

				<img  className={`word-image ${words[0].image.animation}`} style={{
					width: words[0].image.width,
					height: words[0].image.height,
					left: words[0].image.left,
					top: words[0].image.top,
				}} src={words[0].image.path} />

				<span className={`word-text ${words[0].text.animation}`} style={{
					width: words[0].text.width,
					top: words[0].text.top,
					left: words[0].text.left, 
					color: words[0].text.color,
					fontFamily: words[0].text.fontFamily,
					fontSize: words[0].text.fontSize,
					fontStyle: words[0].text.fontStyle,
					fontWeight: words[0].text.fontWeight,
					textAlign: words[0].text.textAlign,
					textDecoration: words[0].text.textDecoration,
					whiteSpace: words[0].text.whiteSpace,
				}}>{words[0].text.value}</span>

				<div className="control-tools">
					<div className="next" title="next action" 
					onClick={this.nextButtonBind}>Next</div>
				</div>
			</section>
		)
	}
}

export default Animate;
