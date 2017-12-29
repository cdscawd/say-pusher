import React, {Component} from 'react';
import './Pdf.css';

class Pdf extends Component {
	state = {
		
	};

	componentWillMount() {}


	componentDidMount() {
		
	}

	componentWillUnmount() {
	
	}

	render() {
		return (
			<div id="PDF-content">
				{/* pdf iframe容器*/}
				<section id="PDF-Section">
					<iframe id="PDF-iframe" scroll="yes" src="http://localhost:8888/web/teacher_viewer.html?file=Qooco翻转课堂校区案例展示.pdf"></iframe>
				</section>

				{/* Canvas 容器 */}
				<section id="Canvas-Section">
					<canvas id="Canvas" width="768" height="550">您的浏览器不支持canvas!</canvas>
				</section>
			</div>
		)
	}
}

export default Pdf;