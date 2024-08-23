import React, { useState, useEffect, useContext } from 'react'
// import { fakeData} from '../assets/fakeData'
import NoteCard from '../components/NoteCard'
import { databases } from '../appwrite/config'
import db from '../appwrite/databases'
import NotesProvider, { NoteContext } from '../context/NoteContext'
import Controls from '../components/Controls'

const NotesPage = () => {

  const {notes} = useContext(NoteContext)

  return (
    <div>
      {

        notes.map((note) => (
           <NoteCard  note={note} key={note.$id} />
        ))
      }
      <Controls/>
    </div>
  )
}

export default NotesPage