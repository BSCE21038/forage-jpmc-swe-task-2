import React, { Component } from 'react';
import DataStreamer, { ServerRespond } from './DataStreamer';
import Graph from './Graph';
import './App.css';

interface IState {
  data: ServerRespond[],
}

class App extends Component<{}, IState> {
  private intervalId: NodeJS.Timeout | null = null;

  constructor(props: {}) {
    super(props);

    this.state = {
      data: [],
    };
  }

  componentWillUnmount() {
    // Clear the interval when the component unmounts
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  renderGraph() {
    return (<Graph data={this.state.data}/>)
  }

  getDataFromServer() {
    DataStreamer.getData((serverResponds: ServerRespond[]) => {
      // Update the state by creating a new array of data that consists of
      // Previous data in the state and the new data from server
      this.setState({ data: [...this.state.data, ...serverResponds] });
    });
  }

  startStreaming() {
    // Clear any existing interval to prevent multiple intervals
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    // Set up a new interval to fetch data every 100ms
    this.intervalId = setInterval(() => {
      this.getDataFromServer();
    }, 100);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          Bank & Merge Co Task 2
        </header>
        <div className="App-content">
          <button className="btn btn-primary Stream-button"
            onClick={() => { this.startStreaming() }}>
            Start Streaming Data
          </button>
          <div className="Graph">
            {this.renderGraph()}
          </div>
        </div>
      </div>
    )
  }
}

export default App;
