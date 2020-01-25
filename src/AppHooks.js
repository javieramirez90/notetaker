import React, { useState, useEffect } from 'react';
import { API, Auth, graphqlOperation } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { createNote, deleteNote, updateNote } from './graphql/mutations'
import { listNotes } from './graphql/queries';
import { onCreateNote, onUpdateNote, onDeleteNote } from './graphql/subscriptions'

const App= (props) => {

  const [id, setId] = useState("");
  const [note, setNote] = useState("");
  const  [notes, setNotes] = useState([]);

  const handleChange = (e) => setNote(e.target.value);

  const hasExistingNote = () => {
    if(id){
      const isNote = notes.findIndex(note => note.id === id) > -1
      return isNote;
    }
    return false;
  }

  const handleSubmit = async e => {
    e.preventDefault();

    if(hasExistingNote()){
      handleUpdatedNote()
    }else {
      const input = { note };
      await API.graphql(graphqlOperation(createNote, {input}));
    }
  }

  const handleUpdatedNote = async () => {
    const input = { id, note };
    await API.graphql(graphqlOperation(updateNote, { input }))
  }

  const handleUpdateNote = ({note, id}) => {
    setNote(note)
    setId(id)
  }

  const handleDelete =  async idNote => {
    const input = { id: idNote }
    // const result = 
    await API.graphql(graphqlOperation(deleteNote, { input }))
  }

  
  
  const getNotes = async() => {
    const result = await API.graphql(graphqlOperation(listNotes))
    setNotes(result.data.listNotes.items)
  }
  const owner = props.authData.username;

  useEffect(() => {
    getNotes();
     const createNoteListener = API.graphql(
       graphqlOperation(onCreateNote, 
        {
          owner
        }
    )).subscribe({
      next: noteData => {
        const newNote =  noteData.value.data.onCreateNote
        const prevNotes = notes.filter(note => note.id !== newNote.id)
        const updatedNotes = [...prevNotes, newNote];
        setNotes(updatedNotes)
        setNote('')
      }
    })
    const deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote,
      {
        owner
      }
      )).subscribe({
      next: noteData => {
        const deletedNote = noteData.value.data.onDeleteNote
        const updatedNotes = notes.filter(note => note.id !== deletedNote.id)
        setNotes(updatedNotes)
      }
    })
    const updateNoteListener = API.graphql(graphqlOperation(onUpdateNote, 
      {
        owner
      }
      )).subscribe({
      next: noteData => {
        const updatedNote = noteData.value.data.onUpdateNote
        const index = notes.findIndex(note => note.id === updatedNote.id)
        notes[index] = updatedNote
        setNotes(notes)
        setNote("")
        setId("")
      }
    })

    return () => {
      createNoteListener.unsubscribe()
      updateNoteListener.unsubscribe()
      deleteNoteListener.unsubscribe()
    }
  }, [])

    console.log(props)
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h1 className="code f2-l">Amplify Notetaker</h1>
        {/* Note form */}
        <form className="mb3" onSubmit={handleSubmit}>
          <input 
            type="text"
            className="pa2 f4"
            placeholder="Write your note"
            name="note"
            value={ note }
            onChange={ handleChange }
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
              onClick={() => handleUpdateNote(item)}
              >
                { item.note }
              </li>
              <button
                className="bg-transparent bn f4"
                onClick={() => handleDelete(item.id)}
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


export default withAuthenticator(App, true)
