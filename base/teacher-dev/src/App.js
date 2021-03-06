import React, { Component } from 'react';

// import Animate_Sentence from './conrainers/Animate_Sentence/Animate'
import Animate_WORD from './conrainers/Animate_WORD/Animate'
import Animate from './conrainers/Animate/Animate'
import Drawing from './conrainers/Drawing/Drawing'
import Pdf from './conrainers/Pdf/Pdf'
import SessionRegister from './conrainers/SessionRegister/SessionRegister'
import Word from './conrainers/Word/Word'
import Sentence from './conrainers/Sentence/Sentence'
import Question from './conrainers/Question/Question'
import FreeTalk from './conrainers/FreeTalk/FreeTalk'
import Prompt from './conrainers/Prompt/Prompt'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="section-content">
        <Animate/>
      </div>
    );
  }
}

export default App;