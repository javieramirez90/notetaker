import React, { Component } from 'react';
import { withAuthenticator } from 'aws-amplify-react';



class App extends Component {

  state = {
    note: "",
    notes: []
  }

  handleChange = (e) => {
    let { note } =  this.state;
    this.setState({...note})
    console.log(note)
  }

  render() {

    const { notes }= this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>
        {/* Note form */}
        <form className="mb3">
          <input 
            type="text"
            className="pa2 f4"
            placeholder="Write your note"
            onChange={this.handleChange}
          />
          <button
            type="submit"
            className="pa2 f4"
          >
            Add note
          </button>
        </form>
  
        {/* Notes list */}
        <div>
          { notes.map((item, index) => (
            <div key={index} className="flex items-center">
              <li
              className="list pa1 f3"
              >
                { item.note }
              </li>
              <button
                className="bg-transparent bn f4"
              >
                <span>&times;</span>
              </button>
            </div> 
          )) 
          }
        </div>
      </div>
    );

  }
}

export default withAuthenticator(App, true);
