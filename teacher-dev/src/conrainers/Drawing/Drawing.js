import React, {Component} from 'react';
import './Drawing.css';
import pic_01 from '../../images/pic_01.png'

class Drawing extends Component {
	state = {
		canvas: '',
		ctx: '',
		color: "#000",
	};

	componentWillMount() {}


	componentDidMount() {
		var canvas = document.getElementById("Canvas");
		var ctx = canvas.getContext("2d");
		this.Pencil()
	}

	componentWillUnmount() {
	
	}

	// 铅笔函数
	Pencil = () => {
		var that = this
		var flag = 0 // 设置标志位 检测鼠标是否按下
		var canvas = document.getElementById("Canvas")
		var ctx = canvas.getContext("2d")
		var color = this.state.color
		canvas.onmousedown = function (e) {
			var e = window.event || e
			var startX = e.pageX - this.offsetLeft
			var startY = e.pageY - this.offsetTop
			ctx.beginPath()
			ctx.moveTo(startX, startY)
			flag = 1
		}
	
		// 鼠标移动的时候 不断的绘图（获取鼠标的位置）
		canvas.onmousemove = function (e) {
			e = window.event || e
			var endX = e.pageX - this.offsetLeft
			var endY = e.pageY - this.offsetTop
			// 判断鼠标是否按下
			if (flag) {
				// 移动的时候设置路径并画图
				ctx.lineTo(endX, endY)
				ctx.strokeStyle = color
				ctx.stroke()
			}
		}
		// 鼠标抬起的时候结束绘图
		canvas.onmouseup = function () {
			flag = 0
		}
	
		// 鼠标移出canvas取消画图操作
		canvas.onmouseout = function () {
			flag = 0
		}
	}

	render() {
		return (
			<div id="Drawing-content">

				{/* 图片资源容器 */}
				<section id="Picture-Section">
					<div className="picture-box">
						<div className="title">标题</div>
						<img className="img" src={pic_01} />
					</div>
				</section>

				{/* Canvas 容器 */}
				<section id="Canvas-Section">
					<canvas id="Canvas" width="768" height="960">您的浏览器不支持canvas!</canvas>
				</section>

				{/* Canvas 绘图工具 */}
				<div id="Drawing-Tools">
					<ul className="tools">
					{/* 笔类型 */}
					<li title="铅笔" className="active" id="pencil"><i className="iconfont">&#xe621;</i></li>	{/* 铅笔 */}
					<li  title="涂鸦" id="tuya"><i className="iconfont">&#xe601;</i></li>	{/* 涂鸦 */}
					{/* 线条风格 */}
					<li title="线条大小" className="line border" id="lineSize"><i className="iconfont">&#xe61d;</i></li>{/* 粗细线条 */}
					<li title="画直线" id="line"><i className="iconfont">&#xe630;</i></li>{/* 斜线 */}
					<li title="方形" id="square"><i className="iconfont">&#xe634;</i></li>{/* 正方形轮廓 */}
					<li title="圆" id="circular"><i className="iconfont">&#xe611;</i></li>{/* 圆形轮廓 */}
					{/* 样式 */}
					<li title="选择颜色" id="color" className="showColor">
						<i className="iconfont">&#xe6f3;</i>

						<div className="style-picker-box">
							<div className="line-width-check">
								<div className="line-check-box active">
									<div className="line-width" line="2"></div>
								</div>
								<div className="line-check-box">
									<div className="line-width" line="4"></div>
								</div>
								<div className="line-check-box">
									<div className="line-width" line="6"></div>
								</div>
							</div>

							<div className="color-box">
								<div className="checked-color" style={{backgroundColor: 'rgb(251, 56, 56)'}}></div>
								<div className="color-check-box">
									<div className="color-item" style={{backgroundColor: 'rgb(0, 0, 0)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(128, 128, 128)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(128, 0, 0)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(247, 136, 58)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(48, 132, 48)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(56, 90, 211)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(128, 0, 128)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(0, 153, 153)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(255, 255, 255)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(192, 192, 192)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(251, 56, 56)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(255, 255, 0)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(153, 204, 0)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(56, 148, 228)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(243, 27, 243)'}}></div>
									<div className="color-item" style={{backgroundColor: 'rgb(22, 220, 220)'}}></div>
								</div>
							</div>
						</div>
					</li>
					<li title="字体" id="font"><i className="iconfont">&#xe618;</i></li>{/* 字体 */}
					<li  title="橡皮擦" id="eraser"><i className="iconfont">&#xe6c5;</i></li>{/* 橡皮擦 */}
					{/* 功能 */}
					<li title="撤销上一个操作" id="cancelPrev"><i className="iconfont">&#xe60a;</i></li>{/* 撤销 */}
					<li title="重做上一个操作" id="redo"><i className="iconfont">&#xe716;</i></li>{/* 撤销 */}
					<li title="清屏" id="clearSceen"><i className="iconfont">&#xe71a;</i></li>{/* 清空 */}
					</ul>
				</div>
			</div>
		)
	}
}

export default Drawing;