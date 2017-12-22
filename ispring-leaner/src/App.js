import React, { Component } from 'react';

import Prompt from './conrainers/Prompt/Prompt'
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="section-content">
        <Prompt/>
      </div>
    );
  }
}

export default App;