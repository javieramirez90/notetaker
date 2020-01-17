import React, { Component } from 'react';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries';
import { onCreateNote, onUpdateNote, onDeleteNote } from './graphql/subscriptions'

class App extends Component {

  state = {
    id: "",
    note: "",
    notes: []
  }

  handleChange = (e) => this.setState({note: e.target.value});

  hasExistingNote = () => {
    const { notes, id } = this.state;
    if(id){
      const isNote = notes.findIndex(note => note.id === id) > -1
      return isNote;
    }
    return false;
  }

  handleSubmit = async e => {
    const { note, notes } = this.state;
    e.preventDefault();

    if(this.hasExistingNote()){
      this.handleUpdatedNote()
    }else {
      const input = { note };
      // const result = 
      await API.graphql(graphqlOperation(createNote, {input}));
      // const newNote = result.data.createNote
      // const updatedNote = [newNote, ...notes]
      // this.setState({notes: updatedNote, note: ""})
    }
  }

  handleUpdatedNote = async () => {
    const { notes, note, id } = this.state;
    const input = { id, note };
    // const result =  
    await API.graphql(graphqlOperation(updateNote, { input }))
    // const updatedNote = result.data.updateNote
    // const index = notes.findIndex(note => note.id === updatedNote.id)
    // notes[index] = updatedNote
    // this.setState({notes, note: '', id: ''})
  }

  handleUpdateNote = ({note, id}) => this.setState({note, id})

  handleDelete =  async idNote => {
    const { notes } = this.state;
    const input = { id: idNote }
    // const result = 
    await API.graphql(graphqlOperation(deleteNote, { input }))
    // const deletedNoteId = result.data.deleteNote.id;
    // const updatedNotes = notes.filter(note => note.id !== deletedNoteId)
    // this.setState({notes: updatedNotes})
    // this.setState({notes: result.da})
  }

  componentDidMount(){
    const owner = this.props.authData.username;
    this.getNotes();
     this.createNoteListener = API.graphql(
       graphqlOperation(onCreateNote, 
        {
          owner
        }
    )).subscribe({
      next: noteData => {
        const newNote =  noteData.value.data.onCreateNote
        const prevNotes = this.state.notes.filter(note => note.id !== newNote.id)
        const updatedNotes = [...prevNotes, newNote];
        this.setState({notes: updatedNotes, note: ''})
      }
    })
    this.deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote,
      {
        owner
      }
      )).subscribe({
      next: noteData => {
        const { notes } = this.state;
        const deletedNote = noteData.value.data.onDeleteNote
        const updatedNotes = notes.filter(note => note.id !== deletedNote.id)
        this.setState({notes: updatedNotes})
      }
    })
    this.updateNoteListener = API.graphql(graphqlOperation(onUpdateNote, 
      {
        owner
      }
      )).subscribe({
      next: noteData => {
        const { notes } = this.state;
        const updatedNote = noteData.value.data.onUpdateNote
        const index = notes.findIndex(note => note.id === updatedNote.id)
        notes[index] = updatedNote
        this.setState({notes, note: '', id: ''})
      }
    })
  }
  
  getNotes = async() => {
    const result = await API.graphql(graphqlOperation(listNotes))
    this.setState({ notes: result.data.listNotes.items })
  }

  componentWillUnmount(){
    this.createNoteListener.unsubscribe()
    this.updateNoteListener.unsubscribe()
    this.deleteNoteListener.unsubscribe()
  }

  
  render() {
    
    
    console.log(this.props)
    const { notes, note, id  }= this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>
        {/* Note form */}
        <form className="mb3" onSubmit={this.handleSubmit}>
          <input 
            type="text"
            className="pa2 f4"
            placeholder="Write your note"
            name="note"
            value={ note }
            onChange={ this.handleChange }
          />
          <button
            type="submit"
            className="pa2 f4"
          >
            {id ? "Update note" : "Add note"}
          </button>
        </form>
  
        {/* Notes list */}
        <div>
          { notes.map((item, index) => (
            <div key={index} className="flex items-center">
              <li
              className="list pa1 f3"
              onClick={() => this.handleUpdateNote(item)}
              >
                { item.note }
              </li>
              <button
                className="bg-transparent bn f4"
                onClick={() => this.handleDelete(item.id)}
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
