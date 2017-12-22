import React, {Component} from 'react';
import Pusher from 'pusher';

class Prompt extends Component {
	state = {
		
	};

	componentWillMount() {}


	componentDidMount() {
		var pusher = new Pusher({
			appId: '440607',
			key: 'aaef902e40a3359d109c',
			secret: '10630dfd613c224ad75d',
			cluster: 'ap1',
			encrypted: true
		});
		
		pusher.trigger('my-channel', 'my-event', {
			"message": "hello world"
		});
	}

	componentWillUnmount() {
	
	}

	render() {
		return (
			<div className="">
				<div>
					<p>(练习提示页面公用提示page)</p>
					<p>Now, you will see six words, please read and practice.</p>
				</div>
			</div>
		)
	}
}

export default Prompt;