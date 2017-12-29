import React, {Component} from 'react';
import $ from 'jquery'
import './Start.css';

class Animate extends Component {
	state = {
	

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
